/* ============ PÁGINAS ============ */
const view=$('#view');
const skel=n=>`<div class="grid">${'<div class="sk"></div>'.repeat(n)}</div>`;
async function ClientsPage(full){
  view.innerHTML=`<div class="head"><div><h1>${full?'Clientes':'Dashboard'}</h1><p class="sub">${full?'Todos os clientes e seus ambientes.':'Visão geral dos ambientes cadastrados.'}</p></div>
    <button class="btn pri" id="newc">${ico('plus')}Novo cliente</button></div><div id="stats"></div>
    <div class="bar"><div class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar cliente por nome…" aria-label="Buscar cliente"></div></div><div id="grid">${skel(6)}</div>`;
  $('#newc').onclick=()=>clientForm(null,route);
  const list=await Svc.list();let q='';
  if(!full)$('#stats').innerHTML=`<div class="stats">${Stat('users',list.length,'Clientes cadastrados')}${Stat('link',list.reduce((a,c)=>a+c.links.length,0),'Links no total')}${Stat('srv',list.reduce((a,c)=>a+c.links.filter(l=>l.env==='PRD').length,0),'Ambientes de produção')}</div>`;
  const grid=$('#grid');
  const draw=()=>{const f=list.filter(c=>c.name.toLowerCase().includes(q)).sort((a,b)=>a.name.localeCompare(b.name));
    grid.innerHTML=!list.length?Empty('users','Nenhum cliente cadastrado','Cadastre o primeiro cliente para começar a organizar os links dos ambientes.','<button class="btn pri" data-new>'+ico('plus')+'Cadastrar cliente</button>')
     :!f.length?Empty('search','Nenhum resultado',`Nada encontrado para “${esc(q)}”. Verifique o nome e tente de novo.`)
     :`<div class="grid">${f.map(ClientCard).join('')}</div>`;
    const nb=$('[data-new]',grid);if(nb)nb.onclick=()=>clientForm(null,route)};
  draw();$('#q').oninput=e=>{q=e.target.value.trim().toLowerCase();draw()};
  grid.onclick=e=>{const card=e.target.closest('.cc');if(!card)return;const c=list.find(x=>x.id===card.dataset.id);
    if(e.target.closest('[data-stop]'))return;
    if(e.target.closest('[data-edit]'))return clientForm(c,route);
    if(e.target.closest('[data-del]'))return confirmBox('Excluir cliente',`“${esc(c.name)}” e todos os seus ${c.links.length} links serão removidos. Esta ação não pode ser desfeita.`,async()=>{await Svc.deleteClient(c.id);toast('Cliente excluído.');route()});
    location.hash='#/cliente/'+c.id};
  grid.onkeydown=e=>{if(e.key==='Enter'&&e.target.classList.contains('cc'))location.hash='#/cliente/'+e.target.dataset.id}}
async function ClientPage(id){
  view.innerHTML=skel(3);const c=await Svc.get(id);
  if(!c){view.innerHTML=Empty('users','Cliente não encontrado','Ele pode ter sido excluído.','<a class="btn pri" href="#/clientes">Ver clientes</a>');return}
  const groups=envOrder(c.links);
  view.innerHTML=`<a class="back" href="#/clientes">${ico('back')}Clientes</a>
   <div class="head"><div style="display:flex;gap:14px;align-items:center"><div class="av" style="width:52px;height:52px">${esc(initials(c.name))}</div><div><h1>${esc(c.name)}</h1><p class="sub">${esc(c.notes)||c.links.length+' '+(c.links.length===1?'link cadastrado':'links cadastrados')}</p></div></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="ec">${ico('edit')}Editar</button><button class="btn dng" id="dc">${ico('trash')}Excluir</button><button class="btn pri" id="nl">${ico('plus')}Novo link</button></div></div>
   ${groups.length?groups.map(e=>{const ls=c.links.filter(l=>l.env===e);return `<section class="card sec ${envCls(e)}"><div class="sh"><span class="dot"></span><h2>${esc(e)}</h2><span class="cnt">${ls.length} ${ls.length===1?'link':'links'}</span></div>${ls.map(LinkRow).join('')}</section>`}).join('')
   :Empty('link','Nenhum link cadastrado','Adicione os links de PRD, HOM e outros ambientes deste cliente.','<button class="btn pri" id="nl2">'+ico('plus')+'Adicionar link</button>')}`;
  const again=()=>ClientPage(id);
  $('#ec').onclick=()=>clientForm(c,again);
  $('#dc').onclick=()=>confirmBox('Excluir cliente',`“${esc(c.name)}” e todos os seus links serão removidos. Esta ação não pode ser desfeita.`,async()=>{await Svc.deleteClient(c.id);toast('Cliente excluído.');location.hash='#/clientes'});
  $('#nl').onclick=()=>linkForm(c.id,null,again);const n2=$('#nl2');if(n2)n2.onclick=$('#nl').onclick;
  view.onclick=e=>{const row=e.target.closest('.lk');if(!row)return;const l=c.links.find(x=>x.id===row.dataset.lid);
    if(e.target.closest('[data-ledit]'))linkForm(c.id,l,again);
    if(e.target.closest('[data-ldel]'))confirmBox('Excluir link',`O link “${esc(l.name)}” (${esc(l.env)}) será removido.`,async()=>{await Svc.deleteLink(c.id,l.id);toast('Link excluído.');again()})}}
function ConfigPage(){view.onclick=null;view.innerHTML=`<div class="head"><div><h1>Configurações</h1><p class="sub">Preferências do sistema.</p></div></div>
  ${[['Tema da interface','Escuro (padrão)'],['Abrir links em nova aba','Sempre ativo'],['Integração com API','Conectar ao backend']].map(([a,b])=>`<div class="card cfg"><div><h2>${a}</h2><p class="sub">${b}</p></div><span class="pill">Em breve</span></div>`).join('')}`}
