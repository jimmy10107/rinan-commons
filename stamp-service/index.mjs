import qr from 'qrcode-generator';
import {api,corsHeaders} from './api.mjs';
export default {async scheduled(controller,env){
 const cutoff=Date.parse(env.PURGE_AT);
 if(Number.isFinite(cutoff)&&controller.scheduledTime>=cutoff){
   await env.DB.prepare("DELETE FROM claims WHERE event=?").bind("rinan-quiz-2026").run();
 }
 await env.DB.prepare("DELETE FROM quiz_sessions WHERE expires<? OR (used IS NOT NULL AND used<?)").bind(Math.floor(controller.scheduledTime/1000),Math.floor(controller.scheduledTime/1000)-86400).run();
},async fetch(req,env){
 const url=new URL(req.url);
 if(url.pathname==='/config')return Response.json({liff:env.LIFF_ID||'',notice:env.PRIVACY_NOTICE||''},{headers:{'cache-control':'no-store'}});
 if(!url.pathname.startsWith('/api/'))return env.ASSETS.fetch(req);
 try {
 const res=await api(req,env);
 if(url.pathname!=='/api/claim'||!res.ok)return res;
 const b=await res.json();if(b.token){
 const q=qr(0,'M');q.addData(url.origin+'/#redeem='+b.token);q.make();
 b.image=q.createDataURL(6,24);delete b.token;
 }
 return Response.json(b,{headers:{'cache-control':'no-store'}});
 }catch{return Response.json({error:'服務暫時無法使用，請稍後再試'},{status:503,headers:{'cache-control':'no-store',...corsHeaders(req,env)}})}
}};
