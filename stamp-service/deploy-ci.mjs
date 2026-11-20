import {readFileSync,writeFileSync,mkdtempSync,rmSync,appendFileSync,copyFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const e=process.env, name='rinan-quiz-stamp',phase=e.PHASE;
if(!['bootstrap','activate'].includes(phase)||!e.CLOUDFLARE_API_TOKEN||!/^\w{32}$/.test(e.CLOUDFLARE_ACCOUNT_ID||''))throw Error('Invalid deployment configuration');
const cfg=JSON.parse(readFileSync('wrangler.example.jsonc','utf8'));
// Bundle the same card shown on the main site into the authenticated LINE app.
copyFileSync('../public/quiz/souvenir.js','public/souvenir.js');
if(phase==='activate'){
 if(!/^\d+-[A-Za-z0-9]+$/.test(e.LIFF_ID)||e.LIFF_ID.split('-')[0]!==e.CHANNEL_ID||!e.PRIVACY_NOTICE?.trim()||!(e.IDENTITY_KEY?.length>=32))throw Error('Set STAMP_LIFF_ID, STAMP_CHANNEL_ID, STAMP_PRIVACY_NOTICE and stable STAMP_IDENTITY_KEY before activation');
 Object.assign(cfg.vars,{LIFF_ID:e.LIFF_ID,CHANNEL_ID:e.CHANNEL_ID,PRIVACY_NOTICE:e.PRIVACY_NOTICE});
}
const api='https://api.cloudflare.com/client/v4/accounts/'+e.CLOUDFLARE_ACCOUNT_ID;
async function cf(path,params={}){const r=await fetch(api+path,{...params,headers:{authorization:'Bearer '+e.CLOUDFLARE_API_TOKEN,'content-type':'application/json'}});const b=await r.json();if(!r.ok||!b.success)throw Error('Cloudflare '+path.split('?')[0]+' HTTP '+r.status+' error codes: '+(b.errors||[]).map(x=>x.code).join(','));return b.result}
const domain=(await cf('/workers/subdomain')).subdomain;
if(!/^[a-z0-9-]+$/.test(domain||''))throw Error('Enable your account workers.dev subdomain first');
const url='https://'+name+'.'+domain+'.workers.dev';
const db=await cf('/d1/database?name='+name);
let id=db.find(x=>x.name===name)?.uuid;
if(!id)id=(await cf('/d1/database',{method:'POST',body:JSON.stringify({name})})).uuid;
if(!/^[0-9a-f-]{36}$/.test(id||''))throw Error('No dedicated database ID returned');
cfg.d1_databases[0].database_id=id;cfg.workers_dev=true;cfg.preview_urls=false;
// Re-running bootstrap preserves live LINE settings; it never intentionally disables claims.
cfg.keep_vars=true;
writeFileSync('wrangler.jsonc',JSON.stringify(cfg));
const dir=mkdtempSync(join(tmpdir(),'stamp-deploy-'));
const wr=(args)=>execFileSync('../node_modules/.bin/wrangler',args,{stdio:'inherit'});
try{
 const args=['deploy','--config','wrangler.jsonc','--keep-vars'];
 if(phase==='activate'){const file=join(dir,'bindings.json');writeFileSync(file,JSON.stringify({IDENTITY_KEY:e.IDENTITY_KEY,...(e.STAFF_KEYS?{STAFF_KEYS:e.STAFF_KEYS}:{})}),{mode:0o600});args.push('--secrets-file',file)}
 wr(['d1','execute',name,'--config','wrangler.jsonc','--remote','--file=schema.sql','--yes']);
 wr(args);
 let verified=false;for(let i=0;i<8;i++){try{const r=await fetch(url+'/config',{signal:AbortSignal.timeout(5000)});const b=await r.json();if(r.ok&&typeof b.liff==='string'&&(phase==='bootstrap'||b.liff===e.LIFF_ID)){verified=true;break}}catch{}await new Promise(r=>setTimeout(r,3000))}
 if(!verified)throw Error('Deployment submitted; endpoint not verified: '+url);
 appendFileSync(e.GITHUB_STEP_SUMMARY,'Verified stamp endpoint (LIFF Endpoint URL): '+url+'/\n');
}finally{rmSync(dir,{recursive:true,force:true})}
