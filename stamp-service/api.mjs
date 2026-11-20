const event='rinan-quiz-2026';
const correctAnswers=[2,2,1,0,3,1,3,0];
const enc=new TextEncoder();
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const hash=async v=>hex(await crypto.subtle.digest('SHA-256',enc.encode(v)));
const reply=(v,status=200)=>Response.json(v,{status,headers:{'cache-control':'no-store','referrer-policy':'no-referrer'}});
export const issueSQL='INSERT INTO claims(event,holder,issued) VALUES(?,?,?) ON CONFLICT(event,holder) DO NOTHING';
export const redeemSQL='UPDATE claims SET redeemed=?,staff=?,token_hash=NULL,expires=NULL WHERE event=? AND token_hash=? AND expires>? AND redeemed IS NULL RETURNING serial';
export async function api(req,e,verify=fetch){
 const p=new URL(req.url);
 if(req.method!=='POST'||req.headers.get('origin')!==p.origin||!req.headers.get('content-type')?.startsWith('application/json'))return reply({},403);
 if(!e.DB||!e.PRIVACY_NOTICE||!e.LIFF_ID||!e.CHANNEL_ID||!e.IDENTITY_KEY||e.IDENTITY_KEY.length<32||!e.END_AT||!(Date.parse(e.END_AT)>Date.now()))return reply({error:'兌換未開放或已截止'},503);
 const id=req.headers.get('authorization')?.match(/^Bearer (\S{1,8192})$/)?.[1];if(!id)return reply({},401);
 const r=await verify('https://api.line.me/oauth2/v2.1/verify',{method:'POST',body:new URLSearchParams({id_token:id,client_id:e.CHANNEL_ID})});
 if(!r.ok)return reply({error:'請重新登入 LINE'},401);
 const {sub,aud,exp,iss}=await r.json();if(typeof sub!=='string'||!sub||aud!==e.CHANNEL_ID||iss!=='https://access.line.me'||!(exp*1000>Date.now()))return reply({},401);
 const k=await crypto.subtle.importKey('raw',enc.encode(e.IDENTITY_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const holder=hex(await crypto.subtle.sign('HMAC',k,enc.encode(event+':'+sub)));
 const body=await req.json().catch(()=>null);if(!body)return reply({},400);
 const now=Math.floor(Date.now()/1000),db=e.DB;
 if(p.pathname==='/api/redeem'){
   if(!(e.STAFF_KEYS||'').split(',').map(s=>s.trim()).includes(holder))return reply({error:'此帳號沒有核銷權限'},403);
   if(!/^[a-f0-9]{48}$/.test(body.token||''))return reply({},400);
   const row=await db.prepare(redeemSQL).bind(now,holder,event,await hash(body.token),now).first();
   return row?reply({serial:row.serial,redeemed:true}):reply({error:'已使用、過期或無效；請勿發章'},409);
 }
 if(p.pathname==='/api/staff-key')return reply({key:holder});
 if(p.pathname!=='/api/claim')return reply({},404);
 if(Array.isArray(body.answers)&&body.answers.length===correctAnswers.length&&body.answers.every((x,i)=>x===correctAnswers[i]))
   await db.prepare(issueSQL).bind(event,holder,now).run();
 const row=await db.prepare('SELECT serial,redeemed FROM claims WHERE event=? AND holder=?').bind(event,holder).first();
 if(!row)return reply({error:'請先完成官網八題'},403);
 if(row.redeemed||body.present!==true)return reply({serial:row.serial,redeemed:!!row.redeemed});
 const token=hex(crypto.getRandomValues(new Uint8Array(24))),expires=Math.min(now+90,Math.floor(Date.parse(e.END_AT)/1000));
 const changed=await db.prepare('UPDATE claims SET token_hash=?,expires=? WHERE serial=? AND redeemed IS NULL').bind(await hash(token),expires,row.serial).run();
 return changed.meta.changes?reply({serial:row.serial,token,expires}):reply({serial:row.serial,redeemed:true});
}
