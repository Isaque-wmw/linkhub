/* ============ PERSISTÊNCIA (troque por chamadas HTTP no futuro) ============ */
const Repo={
  key:'linkhub.clients.v1',cache:null,
  seed(){return [
    {id:uid(),name:'Acme Logística',notes:'ERP e portal do transportador',links:[
      Link({name:'Portal ERP',url:'erp.acme.example.com',env:'PRD'}),Link({name:'Portal ERP',url:'erp-hom.acme.example.com',env:'HOM'}),Link({name:'API de integração',url:'api.acme.example.com/v2',env:'PRD'})]},
    {id:uid(),name:'Nova Saúde',notes:'',links:[
      Link({name:'Prontuário',url:'app.novasaude.example.com',env:'PRD'}),Link({name:'Prontuário (testes)',url:'hom.novasaude.example.com',env:'HOM'})]},
    {id:uid(),name:'Orbita Varejo',notes:'',links:[]}]},
  async list(){
    await new Promise(r=>setTimeout(r,350)); // simula latência de rede
    if(!this.cache){try{this.cache=JSON.parse(localStorage.getItem(this.key))}catch{}
      if(!Array.isArray(this.cache)){this.cache=this.seed();await this.persist()}}
    return this.cache},
  async persist(){try{localStorage.setItem(this.key,JSON.stringify(this.cache))}catch{}}
};
