/* ============ MODELOS ============ */
const ENVS=['PRD','HOM','Suporte','Outro'];
const envCls=e=>({PRD:'prd',HOM:'hom',Suporte:'sup',Outro:'oth'}[e]||'oth');
const envRank=e=>({PRD:0,HOM:1,Suporte:2,Outro:3}[e]??4);
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const normUrl=u=>{u=u.trim();return /^https?:\/\//i.test(u)?u:'https://'+u};
const validUrl=u=>{try{const x=new URL(normUrl(u));return x.hostname.includes('.')||x.hostname==='localhost'}catch{return false}};
const Client=({name,notes=''})=>({id:uid(),name:name.trim(),notes:notes.trim(),links:[],info:[]});
const Link=({name,url,env})=>({id:uid(),name:name.trim(),url:normUrl(url),env:env.trim().toUpperCase()});
