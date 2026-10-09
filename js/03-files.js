/* ============ ARQUIVOS (mesma lógica de dois backends) ============ */
/* Local: IndexedDB do navegador. */
const LocalFiles={
  db(){return this._d||(this._d=new Promise((res,rej)=>{const r=indexedDB.open('linkhub-files',1);
    r.onupgradeneeded=()=>r.result.createObjectStore('f');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
  async tx(mode,fn){const d=await this.db();return new Promise((res,rej)=>{const t=d.transaction('f',mode),q=fn(t.objectStore('f'));
    t.oncomplete=()=>res(q.result);t.onerror=()=>rej(t.error)})},
  put:(p,f)=>LocalFiles.tx('readwrite',s=>s.put(f,p)),
  get:p=>LocalFiles.tx('readonly',s=>s.get(p)),
  del:p=>LocalFiles.tx('readwrite',s=>s.delete(p))
};
/* Compartilhado: Supabase Storage, bucket "linkhub-files". */
const SupabaseFiles={
  u:p=>CONFIG.supabaseUrl.replace(/\/$/,'')+'/storage/v1/object/linkhub-files/'+p.split('/').map(encodeURIComponent).join('/'),
  h:x=>({apikey:CONFIG.supabaseKey,Authorization:'Bearer '+CONFIG.supabaseKey,...x}),
  async put(p,f){const r=await fetch(this.u(p),{method:'POST',headers:this.h({'Content-Type':f.type||'application/octet-stream','x-upsert':'false'}),body:f});if(!r.ok)throw new Error(r.status)},
  async get(p){const r=await fetch(this.u(p),{headers:this.h()});if(!r.ok)throw new Error(r.status);return r.blob()},
  async del(p){const r=await fetch(this.u(p),{method:'DELETE',headers:this.h()});if(!r.ok)throw new Error(r.status)}
};
const FileStore={
  be:()=>Repo.mode==='shared'?SupabaseFiles:LocalFiles,
  async put(cid,f){const id=uid(),path=`${cid}/${id}-${f.name.replace(/[^\w.-]+/g,'_')}`;
    await FileStore.be().put(path,f);return {id,name:f.name,size:f.size,type:f.type,path,at:Date.now()}},
  del:p=>FileStore.be().del(p),
  async download(m){const b=await FileStore.be().get(m.path),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download=m.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000)}
};
