/* ============ MODELOS ============ */
const ENVS=['PRD','HOM','Suporte','Outro'];
const envCls=e=>({PRD:'prd',HOM:'hom',Suporte:'sup',Outro:'oth'}[e]||'oth');
const envRank=e=>({PRD:0,HOM:1,Suporte:2,Outro:3}[e]??4);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const normUrl=u=>{u=u.trim();return /^https?:\/\//i.test(u)?u:'https://'+u};
const validUrl=u=>{try{const x=new URL(normUrl(u));return x.hostname.includes('.')||x.hostname==='localhost'}catch{return false}};
const Client=({name,notes=''})=>({id:uid(),name:name.trim(),notes:notes.trim(),links:[],info:[],files:[]});
const Link=({name,url,env})=>({id:uid(),name:name.trim(),url:normUrl(url),env:env.trim().toUpperCase()});

/* Limites de anexos (também aplicados no servidor via supabase.sql: 5 MB por arquivo) */
const LIMITS={fileBytes:5*1024*1024,perClient:10,
  ext:['pdf','png','jpg','jpeg','gif','webp','txt','csv','log','json','xml','doc','docx','xls','xlsx','ppt','pptx','zip']};
const fmtSize=b=>b<1048576?Math.max(1,Math.round(b/1024))+' KB':(b/1048576).toFixed(1)+' MB';
const checkFile=(f,count)=>{
  if(count>=LIMITS.perClient)return `Limite de ${LIMITS.perClient} arquivos por cliente atingido.`;
  if(!f.size)return 'Arquivo vazio.';
  if(f.size>LIMITS.fileBytes)return `Maior que ${fmtSize(LIMITS.fileBytes)} (${fmtSize(f.size)}).`;
  if(!LIMITS.ext.includes((f.name.split('.').pop()||'').toLowerCase()))return 'Tipo de arquivo não permitido.';
  return ''};
