/* ============ TEMA ============ */
const Theme={
  pref(){try{return localStorage.getItem('linkhub.theme')||'dark'}catch{return 'dark'}},
  isLight(){const p=this.pref();return p==='light'||(p==='auto'&&matchMedia('(prefers-color-scheme: light)').matches)},
  apply(){const l=this.isLight();document.documentElement.dataset.theme=l?'light':'dark';
    const b=$('#thm');if(b){$('i',b).innerHTML=ico(l?'moon':'sun');$('.lbl',b).textContent=l?'Tema escuro':'Tema claro'}},
  set(p){try{localStorage.setItem('linkhub.theme',p)}catch{}this.apply()}
};
matchMedia('(prefers-color-scheme: light)').addEventListener('change',()=>Theme.pref()==='auto'&&Theme.apply());

/* ============ ROTEADOR / SHELL ============ */
function route(){const h=location.hash||'#/';view.onclick=null;Repo.watch(null);
  document.body.classList.remove('open');
  const key=h.startsWith('#/clientes')||h.startsWith('#/cliente/')?'clientes':h==='#/config'?'config':'home';
  document.querySelectorAll('.nav[data-r]').forEach(a=>a.classList.toggle('on',a.dataset.r===key));
  window.scrollTo(0,0);
  if(h.startsWith('#/cliente/'))ClientPage(h.split('/')[2]);else if(key==='clientes')ClientsPage(true);else if(key==='config')ConfigPage();else ClientsPage(false)}
addEventListener('hashchange',route);
$('#burger').onclick=()=>document.body.classList.add('open');
$('#scrim').onclick=()=>document.body.classList.remove('open');
$('#col').onclick=()=>{document.body.classList.toggle('min');try{localStorage.setItem('linkhub.min',document.body.classList.contains('min')?'1':'0')}catch{}};
try{if(localStorage.getItem('linkhub.min')==='1')document.body.classList.add('min')}catch{}
hydrate();Theme.apply();$('#thm').onclick=()=>{Theme.set(Theme.isLight()?'dark':'light');if(location.hash==='#/config')route()};route();
Repo.start().then(()=>{const m=$('#mode');m.classList.toggle('on',Repo.mode==='shared');
  $('.lbl',m).textContent=Repo.mode==='shared'?'Banco compartilhado':'Salvo só neste navegador'});
