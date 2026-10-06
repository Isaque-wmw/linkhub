/* ============ PERSISTÊNCIA (dois backends, mesma interface) ============ */
const seedData=()=>[
  {id:uid(),name:'Acme Logística',notes:'ERP e portal do transportador',links:[
    Link({name:'Portal ERP',url:'erp.acme.example.com',env:'PRD'}),Link({name:'Portal ERP',url:'erp-hom.acme.example.com',env:'HOM'}),Link({name:'API de integração',url:'api.acme.example.com/v2',env:'PRD'})]},
  {id:uid(),name:'Nova Saúde',notes:'',links:[
    Link({name:'Prontuário',url:'app.novasaude.example.com',env:'PRD'}),Link({name:'Prontuário (testes)',url:'hom.novasaude.example.com',env:'HOM'})]},
  {id:uid(),name:'Orbita Varejo',notes:'',links:[]}];

/* Local: usado fora do claude.ai (ex.: abrindo o index.html do .zip). Dados só no navegador. */
const LocalBackend={
  key:'linkhub.clients.v1',
  async start(set){let d;try{d=JSON.parse(localStorage.getItem(this.key))}catch{}
    if(!Array.isArray(d)){d=seedData();this._w(d)}set(d)},
  _w(list){try{localStorage.setItem(this.key,JSON.stringify(list))}catch{}},
  async put(c,list){this._w(list)},
  async del(id,list){this._w(list)}
};
/* Compartilhado: Supabase (Postgres + REST). Configure em js/00-config.js. */
const SupabaseBackend={
  h(extra){const k=CONFIG.supabaseKey;return {apikey:k,Authorization:'Bearer '+k,'Content-Type':'application/json',...extra}},
  url:q=>CONFIG.supabaseUrl.replace(/\/$/,'')+'/rest/v1/clients'+q,
  async start(set){
    let last='';
    const pull=async()=>{try{
      const r=await fetch(this.url('?select=*&order=name'),{headers:this.h()});if(!r.ok)throw new Error(r.status);
      const d=await r.json(),j=JSON.stringify(d);
      if(j!==last){last=j;set(d.map(({updated_at,...c})=>c))}
    }catch{if(!last){last='[]';set([]);toast('Não foi possível conectar ao banco. Confira js/00-config.js e o supabase.sql.',true)}}};
    await pull();
    setInterval(pull,5000);                                   // sincroniza a cada 5 s
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull()});
  },
  async put(c){const r=await fetch(this.url(''),{method:'POST',headers:this.h({Prefer:'resolution=merge-duplicates,return=minimal'}),
    body:JSON.stringify({id:c.id,name:c.name,notes:c.notes,links:c.links})});if(!r.ok)throw new Error(r.status)},
  async del(id){const r=await fetch(this.url('?id=eq.'+encodeURIComponent(id)),{method:'DELETE',headers:this.h()});if(!r.ok)throw new Error(r.status)}
};
/* Para outro backend (API própria), crie um objeto com start(set)/put(c)/del(id). */
const Repo={
  cache:[],mode:'local',be:null,_s:null,_w:null,
  start(){return this._s||(this._s=(async()=>{
    const shared=!!(CONFIG.supabaseUrl&&CONFIG.supabaseKey);
    this.be=shared?SupabaseBackend:LocalBackend;this.mode=shared?'shared':'local';
    await this.be.start(l=>{this.cache=l;if(this._ready)this._w&&this._w(l)});this._ready=true})())},
  watch(fn){this._w=fn},
  async list(){await this.start();return this.cache},
  async put(c){await this.start();const i=this.cache.findIndex(x=>x.id===c.id);
    this.cache=i<0?[...this.cache,c]:this.cache.map(x=>x.id===c.id?c:x);
    await this.be.put(c,this.cache);this._w&&this._w(this.cache)},
  async del(id){await this.start();this.cache=this.cache.filter(x=>x.id!==id);
    await this.be.del(id,this.cache);this._w&&this._w(this.cache)}
};
