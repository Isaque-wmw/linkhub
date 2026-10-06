/* ============ SERVIÇOS ============ */
const Svc={
  list:()=>Repo.list(),
  async get(id){return (await Repo.list()).find(c=>c.id===id)},
  async saveClient(d,id){const c=id&&await this.get(id);
    return Repo.put(c?{...c,name:d.name.trim(),notes:d.notes.trim()}:Client(d))},
  deleteClient:id=>Repo.del(id),
  async saveLink(cid,d,lid){const c=await this.get(cid);
    const links=lid?c.links.map(x=>x.id===lid?{...Link(d),id:lid}:x):[...c.links,Link(d)];
    return Repo.put({...c,links})},
  async deleteLink(cid,lid){const c=await this.get(cid);return Repo.put({...c,links:c.links.filter(x=>x.id!==lid)})}
};
