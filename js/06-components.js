/* ============ COMPONENTES ============ */
const Empty=(icon,title,text,btn)=>`<div class="empty"><div class="ic">${ico(icon)}</div><h2>${title}</h2><p>${text}</p>${btn||''}</div>`;
const Stat=(icon,n,l)=>`<div class="card stat"><div class="ic">${ico(icon)}</div><div><b>${n}</b><span>${l}</span></div></div>`;
const envOrder=links=>[...new Set(links.map(l=>l.env))].sort((a,b)=>envRank(a)-envRank(b)||a.localeCompare(b));
function ClientCard(c){
  const chips=envOrder(c.links).map(e=>{const first=c.links.find(l=>l.env===e);
    return `<a class="chip ${envCls(e)}" href="${esc(first.url)}" target="_blank" rel="noopener" data-stop title="Abrir ${esc(first.name)}">${esc(e)}${ico('ext')}</a>`}).join('');
  return `<article class="card cc" tabindex="0" data-id="${c.id}">
    <div class="row"><div class="av">${esc(initials(c.name))}</div>
      <div style="min-width:0"><div class="nm">${esc(c.name)}</div><div class="meta">${c.links.length} ${c.links.length===1?'link':'links'}</div></div>
      <div class="acts"><button class="ib" data-edit aria-label="Editar cliente">${ico('edit')}</button><button class="ib dng" data-del aria-label="Excluir cliente">${ico('trash')}</button></div></div>
    <div class="chips">${chips||'<span class="none">Nenhum link cadastrado</span>'}</div></article>`}
function LinkRow(l){return `<div class="lk" data-lid="${l.id}"><div class="t"><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a><span class="url">${esc(l.url)}</span></div>
  <div class="acts"><a class="ib" href="${esc(l.url)}" target="_blank" rel="noopener" aria-label="Abrir em nova aba">${ico('ext')}</a>
  <button class="ib" data-ledit aria-label="Editar link">${ico('edit')}</button><button class="ib dng" data-ldel aria-label="Excluir link">${ico('trash')}</button></div></div>`}

/* Painel lateral de informações livres (Integração, VPN, Observação...) */
const PRESETS=['Integração','VPN','Observação'];
const InfoPanel=c=>{const i=c.info||[];
  return `<aside class="card info" id="info"><div class="sh"><h2>Informações</h2><span class="sp"></span><button class="ib" id="ei" aria-label="Editar informações">${ico('edit')}</button></div>
  <div class="ibody">${i.length?i.map(b=>`<div class="blk"><h3>${esc(b.label)}</h3><p>${esc(b.value)||'<span class="none">—</span>'}</p></div>`).join('')
  :'<p class="none">Nenhuma informação cadastrada. Use o lápis para adicionar Integração, VPN, observações…</p>'}</div></aside>`};
const InfoRow=b=>`<div class="irow" data-k="${b.id||uid()}"><div style="display:flex;gap:6px"><input class="lb" placeholder="Título (ex.: VPN)" maxlength="60" value="${esc(b.label)}"><button type="button" class="ib dng" data-rm aria-label="Remover campo">${ico('trash')}</button></div><textarea class="vl" placeholder="Informação…">${esc(b.value)}</textarea></div>`;
