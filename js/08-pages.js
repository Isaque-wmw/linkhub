/* ============ PÁGINAS ============ */
const view = $('#view');
const skel = n => `<div class="grid">${'<div class="sk"></div>'.repeat(n)}</div>`;
async function ClientsPage(full) {
  view.innerHTML = `<div class="head"><div><h1>${full ? 'Clientes' : 'Dashboard'}</h1><p class="sub">${full ? 'Todos os clientes e seus ambientes.' : 'Visão geral dos ambientes cadastrados.'}</p></div>
    <button class="btn pri" id="newc">${ico('plus')}Novo cliente</button></div><div id="stats"></div>
    <div class="bar"><div class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar cliente por nome…" aria-label="Buscar cliente"></div></div><div id="grid">${skel(6)}</div>`;
  $('#newc').onclick = () => clientForm(null, route);
  let list = await Svc.list(); let q = '';
  const stats = () => { if (!full) $('#stats').innerHTML = `<div class="stats">${Stat('users', list.length, 'Clientes cadastrados')}${Stat('link', list.reduce((a, c) => a + c.links.length, 0), 'Links no total')}${Stat('srv', list.reduce((a, c) => a + c.links.filter(l => l.env === 'PRD').length, 0), 'Ambientes de produção')}</div>` }; stats();
  const grid = $('#grid');
  const draw = () => {
    const f = list.filter(c => c.name.toLowerCase().includes(q)).sort((a, b) => a.name.localeCompare(b.name));
    grid.innerHTML = !list.length ? Empty('users', 'Nenhum cliente cadastrado', 'Cadastre o primeiro cliente para começar a organizar os links dos ambientes.', '<button class="btn pri" data-new>' + ico('plus') + 'Cadastrar cliente</button>')
      : !f.length ? Empty('search', 'Nenhum resultado', `Nada encontrado para “${esc(q)}”. Verifique o nome e tente de novo.`)
        : `<div class="grid">${f.map(ClientCard).join('')}</div>`;
    const nb = $('[data-new]', grid); if (nb) nb.onclick = () => clientForm(null, route)
  };
  Repo.watch(l => { list = l; stats(); draw() });
  draw(); $('#q').oninput = e => { q = e.target.value.trim().toLowerCase(); draw() };
  grid.onclick = e => {
    const card = e.target.closest('.cc'); if (!card) return; const c = list.find(x => x.id === card.dataset.id);
    if (e.target.closest('[data-stop]')) return;
    if (e.target.closest('[data-edit]')) return clientForm(c, route);
    if (e.target.closest('[data-del]')) return confirmBox('Excluir cliente', `“${esc(c.name)}” e todos os seus ${c.links.length} links serão removidos. Esta ação não pode ser desfeita.`, async () => { await Svc.deleteClient(c.id); toast('Cliente excluído.'); route() });
    location.hash = '#/cliente/' + c.id
  };
  grid.onkeydown = e => { if (e.key === 'Enter' && e.target.classList.contains('cc')) location.hash = '#/cliente/' + e.target.dataset.id }
}
function wireFiles(c, again) {
  const inp = $('#fin'), box = $('#files');
  const send = async list => {
    list = [...list]; if (!list.length) return; const b = $('#upl'); b.disabled = true; b.textContent = 'Enviando…';
    try { const errs = await Svc.addFiles(c.id, list); errs.forEach(e => toast(e, true)); if (errs.length < list.length) toast('Arquivo(s) anexado(s).') }
    catch { toast('Falha no envio. Verifique sua conexão e permissões.', true) }
    again()
  };
  $('#upl').onclick = () => inp.click(); inp.onchange = () => send(inp.files);
  box.ondragover = e => { e.preventDefault(); box.classList.add('over') }; box.ondragleave = () => box.classList.remove('over');
  box.ondrop = e => { e.preventDefault(); box.classList.remove('over'); send(e.dataTransfer.files) };
  box.onclick = async e => {
    const row = e.target.closest('[data-fid]'); if (!row) return; const m = (c.files || []).find(x => x.id === row.dataset.fid);
    if (e.target.closest('[data-fdl]')) { try { await FileStore.download(m) } catch { toast('Não foi possível baixar o arquivo.', true) } }
    if (e.target.closest('[data-fdel]')) confirmBox('Excluir arquivo', `“${esc(m.name)}” será removido definitivamente.`, async () => { await Svc.removeFile(c.id, m.id); toast('Arquivo excluído.'); again() })
  }
}
let infoEditing = false; // evita que a atualização em tempo real apague o que está sendo digitado
function wireInfo(c, again) {
  const box = $('#info');
  $('#ei').onclick = () => {
    if (infoEditing) return; infoEditing = true;
    const draw = rows => { $('.ibody', box).innerHTML = `<div>${rows.map(InfoRow).join('')}</div><div class="sugs">${PRESETS.filter(p => !rows.some(r => r.label === p)).map(p => `<button type="button" class="chip oth" data-add="${p}">+ ${p}</button>`).join('')}<button type="button" class="chip dev" data-add="">+ Campo</button></div><div class="ft"><button type="button" class="btn" data-cancel>Cancelar</button><button type="button" class="btn pri" data-save>Salvar</button></div>` };
    const read = () => [...box.querySelectorAll('[data-k]')].map(r => ({ id: r.dataset.k, label: $('.lb', r).value.trim(), value: $('.vl', r).value.trim() }));
    draw(c.info || []); if (!(c.info || []).length) box.querySelector('[data-add=""]').click();
    box.onclick = async e => {
      const rm = e.target.closest('[data-rm]'); if (rm) { const k = rm.closest('[data-k]').dataset.k; return draw(read().filter(x => x.id !== k)) }
      const a = e.target.closest('[data-add]'); if (a) {
        draw([...read(), { id: uid(), label: a.dataset.add, value: '' }]);
        const r = [...box.querySelectorAll('[data-k]')].pop(); return $(a.dataset.add ? '.vl' : '.lb', r).focus()
      }
      if (e.target.closest('[data-cancel]')) { infoEditing = false; return again() }
      const s = e.target.closest('[data-save]'); if (s) {
        s.disabled = true;
        try { await Svc.saveInfo(c.id, read().filter(x => x.label || x.value)); infoEditing = false; toast('Informações salvas.'); again() }
        catch { toast('Não foi possível salvar. Verifique sua conexão e permissões.', true); s.disabled = false }
      }
    }
  }
}
async function ClientPage(id, quiet) {
  if (!quiet) { infoEditing = false; view.innerHTML = skel(3) } const c = await Svc.get(id);
  if (!c) { view.innerHTML = Empty('users', 'Cliente não encontrado', 'Ele pode ter sido excluído.', '<a class="btn pri" href="#/clientes">Ver clientes</a>'); return }
  const groups = envOrder(c.links);
  view.innerHTML = `<a class="back" href="#/clientes">${ico('back')}Clientes</a>
   <div class="head"><div style="display:flex;gap:14px;align-items:center"><div class="av" style="width:52px;height:52px">${esc(initials(c.name))}</div><div><h1>${esc(c.name)}</h1><p class="sub">${esc(c.notes) || c.links.length + ' ' + (c.links.length === 1 ? 'link cadastrado' : 'links cadastrados')}</p></div></div>
   <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="ec">${ico('edit')}Editar</button><button class="btn dng" id="dc">${ico('trash')}Excluir</button><button class="btn pri" id="nl">${ico('plus')}Novo link</button></div></div>
   <div class="cols"><div>${groups.length ? groups.map(e => { const ls = c.links.filter(l => l.env === e); return `<section class="card sec ${envCls(e)}"><div class="sh"><span class="dot"></span><h2>${esc(e)}</h2><span class="cnt">${ls.length} ${ls.length === 1 ? 'link' : 'links'}</span></div>${ls.map(LinkRow).join('')}</section>` }).join('')
      : Empty('link', 'Nenhum link cadastrado', 'Adicione os links de PRD, HOM e outros ambientes deste cliente.', '<button class="btn pri" id="nl2">' + ico('plus') + 'Adicionar link</button>')}${FilesPanel(c)}</div>${InfoPanel(c)}</div>`;
  const again = () => ClientPage(id, true);
  Repo.watch(() => { if (!infoEditing) ClientPage(id, true) }); wireInfo(c, again); wireFiles(c, again);
  $('#ec').onclick = () => clientForm(c, again);
  $('#dc').onclick = () => confirmBox('Excluir cliente', `“${esc(c.name)}” e todos os seus links serão removidos. Esta ação não pode ser desfeita.`, async () => { await Svc.deleteClient(c.id); toast('Cliente excluído.'); location.hash = '#/clientes' });
  $('#nl').onclick = () => linkForm(c.id, null, again); const n2 = $('#nl2'); if (n2) n2.onclick = $('#nl').onclick;
  view.onclick = e => {
    const row = e.target.closest('.lk'); if (!row) return; const l = c.links.find(x => x.id === row.dataset.lid);
    if (e.target.closest('[data-ledit]')) linkForm(c.id, l, again);
    if (e.target.closest('[data-ldel]')) confirmBox('Excluir link', `O link “${esc(l.name)}” (${esc(l.env)}) será removido.`, async () => { await Svc.deleteLink(c.id, l.id); toast('Link excluído.'); again() })
  }
}
function ConfigPage() {
  view.onclick = null; view.innerHTML = `<div class="head"><div><h1>Configurações</h1><p class="sub">Preferências do sistema.</p></div></div>
  <div class="card cfg live"><div><h2>Tema da interface</h2><p class="sub">Escuro, claro ou seguindo o sistema.</p></div><div class="seg">${[['dark', 'Escuro'], ['light', 'Claro'], ['auto', 'Automático']].map(([v, l]) => `<button class="${Theme.pref() === v ? 'on' : ''}" data-th="${v}">${l}</button>`).join('')}</div></div>
  <div class="card cfg live"><div><h2>Abrir links</h2><p class="sub">Onde os links de clientes e das informações devem abrir. Vale para este navegador.</p></div><div class="seg">${[['new', 'Nova aba'], ['same', 'Aba atual']].map(([v, l]) => `<button class="${(Prefs.newTab() ? 'new' : 'same') === v ? 'on' : ''}" data-lt="${v}">${l}</button>`).join('')}</div></div>
  <div class="card cfg live"><div><h2>Banco de dados</h2><p class="sub">${CONFIG.supabaseUrl && CONFIG.supabaseKey ? 'Supabase · dados e arquivos compartilhados entre todos os usuários.' : 'Modo local · dados e arquivos só neste navegador.'}</p></div><span class="pill">${CONFIG.supabaseUrl && CONFIG.supabaseKey ? 'Conectado' : 'Local'}</span></div>`;
  view.onclick = e => {
    const b = e.target.closest('[data-th]'), t = e.target.closest('[data-lt]');
    if (b) { Theme.set(b.dataset.th); ConfigPage() }
    if (t) { Prefs.setNewTab(t.dataset.lt === 'new'); toast(t.dataset.lt === 'new' ? 'Links abrirão em nova aba.' : 'Links abrirão na aba atual.'); ConfigPage() }
  }
}

async function UsefulPage(){
  view.innerHTML=`<div class="head"><div><h1>Links Úteis</h1><p class="sub">Links importantes da equipe, organizados por seção.</p></div>
    <button class="btn pri" id="newu">${ico('plus')}Novo link</button></div>
    <div class="bar"><div class="search">${ico('search')}<input id="q" type="search" placeholder="Buscar por título, descrição ou seção…" aria-label="Buscar links úteis"></div></div><div id="ul">${skel(3)}</div>`;
  let list=await UsefulSvc.list(),q='';
  const cats=()=>[...new Set(list.map(u=>u.category))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  $('#newu').onclick=()=>usefulForm(null,cats());
  const box=$('#ul');
  const draw=()=>{
    const f=list.filter(u=>`${u.title} ${u.description} ${u.category} ${u.url}`.toLowerCase().includes(q));
    if(!list.length)box.innerHTML=Empty('bookmark','Nenhum link útil cadastrado','Cadastre os links importantes da equipe e organize por seção.','<button class="btn pri" data-new>'+ico('plus')+'Cadastrar link</button>');
    else if(!f.length)box.innerHTML=Empty('search','Nenhum resultado',`Nada encontrado para “${esc(q)}”. Verifique o termo e tente de novo.`);
    else{const g={};f.forEach(u=>{const k=u.category.toLowerCase();(g[k]=g[k]||{n:u.category,items:[]}).items.push(u)});
      box.innerHTML=Object.values(g).sort((a,b)=>a.n.localeCompare(b.n,'pt-BR'))
        .map(x=>UsefulSection(x.n,x.items.sort((a,b)=>a.title.localeCompare(b.title,'pt-BR')))).join('')}
    const nb=$('[data-new]',box);if(nb)nb.onclick=()=>usefulForm(null,cats())};
  draw();$('#q').oninput=e=>{q=e.target.value.trim().toLowerCase();draw()};
  UsefulRepo.watch(l=>{list=l;draw()});
  box.onclick=e=>{const row=e.target.closest('[data-uid]');if(!row)return;const u=list.find(x=>x.id===row.dataset.uid);
    if(e.target.closest('[data-uedit]'))usefulForm(u,cats());
    if(e.target.closest('[data-udel]'))confirmBox('Excluir link',`O link “${esc(u.title)}” será removido.`,async()=>{await UsefulSvc.remove(u.id);toast('Link excluído.')})}}
