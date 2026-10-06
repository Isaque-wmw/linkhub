/* ============ SERVIÇOS ============ */
const Svc={
  list:()=>Repo.list(),
  async get(id){return (await Repo.list()).find(c=>c.id===id)},
  async saveClient(d,id){const l=await Repo.list();
    if(id){Object.assign(l.find(c=>c.id===id),{name:d.name.trim(),notes:d.notes.trim()})}else l.push(Client(d));
    return Repo.persist()},
  async deleteClient(id){Repo.cache=(await Repo.list()).filter(c=>c.id!==id);return Repo.persist()},
  async saveLink(cid,d,lid){const c=await this.get(cid);
    if(lid){const i=c.links.findIndex(x=>x.id===lid);c.links[i]={...Link(d),id:lid}}else c.links.push(Link(d));
    return Repo.persist()},
  async deleteLink(cid,lid){const c=await this.get(cid);c.links=c.links.filter(x=>x.id!==lid);return Repo.persist()}
};
