/* ============ ROTEADOR / SHELL ============ */
function route(){const h=location.hash||'#/';view.onclick=null;
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
hydrate();route();
