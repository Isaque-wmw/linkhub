/* ============ UTILIDADES DE UI ============ */
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const initials=n=>n.split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();
function toast(msg,err){const t=document.createElement('div');t.className='toast'+(err?' err':'');
  t.innerHTML=`<span style="color:var(--${err?'red':'grn'})">${ico(err?'x':'check')}</span>${esc(msg)}`;
  $('#toasts').append(t);setTimeout(()=>t.remove(),3200)}
function modal(title,body,{onMount}={}){
  const o=document.createElement('div');o.className='ov';
  o.innerHTML=`<div class="md" role="dialog" aria-modal="true"><h2>${title}</h2>${body}</div>`;
  const close=()=>{o.remove();document.removeEventListener('keydown',esc_)};
  const esc_=e=>e.key==='Escape'&&close();
  o.addEventListener('mousedown',e=>e.target===o&&close());document.addEventListener('keydown',esc_);
  document.body.append(o);o.close=close;onMount&&onMount(o,close);
  (o.querySelector('input,button')||{}).focus?.();return o}
function confirmBox(title,text,onOk){
  modal(title,`<p class="sub">${text}</p><div class="ft"><button class="btn" data-x>Cancelar</button><button class="btn pri" data-ok style="background:var(--red);box-shadow:none">Excluir</button></div>`,
   {onMount(o,close){$('[data-x]',o).onclick=close;$('[data-ok]',o).onclick=async e=>{e.target.disabled=true;await onOk();close()}}})}
/* formulário genérico: campos [{id,label,type,req,validate,...}] */
function formModal(title,fields,values,okLabel,onSave,extra){
  const html=fields.map(f=>`<div class="f" data-f="${f.id}"><label for="${f.id}">${f.label}${f.req?' *':''}</label>${
    f.type==='select'?`<select id="${f.id}">${f.opts.map(o=>`<option ${o===values[f.id]?'selected':''}>${o}</option>`).join('')}</select>`:
    f.type==='area'?`<textarea id="${f.id}">${esc(values[f.id]||'')}</textarea>`:
    `<input id="${f.id}" value="${esc(values[f.id]||'')}" placeholder="${f.ph||''}" autocomplete="off">`}<div class="er"></div></div>`).join('');
  modal(title,`<form novalidate>${html}<div class="ft"><button type="button" class="btn" data-x>Cancelar</button><button class="btn pri" type="submit">${okLabel}</button></div></form>`,{onMount(o,close){
    const form=$('form',o);$('[data-x]',o).onclick=close;extra&&extra(o);
    form.onsubmit=async e=>{e.preventDefault();let ok=true;const data={};
      fields.forEach(f=>{const el=$('#'+f.id,o),box=$(`[data-f=${f.id}]`,o);if(box.hidden){data[f.id]='';return}
        const v=el.value.trim();data[f.id]=v;let m='';
        if(f.req&&!v)m='Campo obrigatório.';else if(v&&f.validate)m=f.validate(v)||'';
        box.classList.toggle('bad',!!m);$('.er',box).textContent=m;if(m)ok=false});
      if(!ok)return;const b=$('[type=submit]',o);b.disabled=true;b.textContent='Salvando…';
      try{await onSave(data);close()}catch{toast('Não foi possível salvar. Tente novamente.',true);b.disabled=false;b.textContent=okLabel}}}})}
