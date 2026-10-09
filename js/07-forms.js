/* ============ FORMULÁRIOS ============ */
const clientForm=(c,done)=>formModal(c?'Editar cliente':'Novo cliente',
  [{id:'name',label:'Nome do cliente',req:1,ph:'Ex.: Acme Logística'},{id:'notes',label:'Observações',type:'area'}],c||{},c?'Salvar alterações':'Cadastrar cliente',
  async d=>{await Svc.saveClient(d,c&&c.id);toast(c?'Cliente atualizado.':'Cliente cadastrado.');done()});
const linkForm=(cid,l,done)=>{
  const std=l?(ENVS.find(e=>e.toUpperCase()===l.env)||'Outro'):'PRD'; // env é salvo em maiúsculas
  formModal(l?'Editar link':'Novo link',[
    {id:'name',label:'Nome / descrição',req:1,ph:'Ex.: Portal ERP'},
    {id:'url',label:'URL',req:1,ph:'https://sistema.cliente.com.br',validate:v=>validUrl(v)?'':'Informe uma URL válida.'},
    {id:'envSel',label:'Ambiente',type:'select',opts:ENVS},
    {id:'envCustom',label:'Nome do ambiente',req:1,ph:'Ex.: QA, STG'}],
    l?{...l,envSel:std,envCustom:std==='Outro'?l.env:''}:{envSel:'PRD'},l?'Salvar alterações':'Adicionar link',
    async d=>{await Svc.saveLink(cid,{name:d.name,url:d.url,env:d.envSel==='Outro'?d.envCustom:d.envSel},l&&l.id);toast(l?'Link atualizado.':'Link adicionado.');done()},
    o=>{const sel=$('#envSel',o),box=$('[data-f=envCustom]',o);const sync=()=>box.hidden=sel.value!=='Outro';sel.onchange=sync;sync()})};
