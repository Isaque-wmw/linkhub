/* ============ SERVIÇOS ============ */
const Svc={
  list:()=>Repo.list(),
  async get(id){return (await Repo.list()).find(c=>c.id===id)},
  async saveClient(d,id){const c=id&&await this.get(id);
    return Repo.put(c?{...c,name:d.name.trim(),notes:d.notes.trim()}:Client(d))},
  async deleteClient(id){const c=await this.get(id);for(const f of (c&&c.files)||[]){try{await FileStore.del(f.path)}catch{}}return Repo.del(id)},
  async addFiles(cid,list){const errs=[],metas=[];let n=((await this.get(cid)).files||[]).length;
    for(const f of list){const e=checkFile(f,n);if(e){errs.push(f.name+': '+e);continue}
      try{metas.push(await FileStore.put(cid,f));n++}catch{errs.push(f.name+': falha no envio.')}}
    if(metas.length){const c=await this.get(cid);await Repo.put({...c,files:[...(c.files||[]),...metas]})}
    return errs},
  async removeFile(cid,fid){const c=await this.get(cid),m=(c.files||[]).find(x=>x.id===fid);if(!m)return;
    try{await FileStore.del(m.path)}catch{}
    return Repo.put({...c,files:c.files.filter(x=>x.id!==fid)})},
  async saveInfo(cid,info){const c=await this.get(cid);return Repo.put({...c,info})},
  async saveLink(cid,d,lid){const c=await this.get(cid);
    const links=lid?c.links.map(x=>x.id===lid?{...Link(d),id:lid}:x):[...c.links,Link(d)];
    return Repo.put({...c,links})},
  async deleteLink(cid,lid){const c=await this.get(cid);return Repo.put({...c,links:c.links.filter(x=>x.id!==lid)})}
};
