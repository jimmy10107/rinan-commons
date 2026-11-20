const event='rinan-quiz-2026';
const proofTtl=15*60,maxAttempts=32;
const enc=new TextEncoder();
const questions=[
 {prompt:'稻站前身是守橋營房。當年駐守的人員主要守護什麼？',options:['火車站','海岸','舊鐵橋','農田'],answer:2,explanation:'營房守護的是鐵路橋梁。今天，原本管制出入的空間成了大家可以停留的日南稻站。',sourceUrl:'https://www.rinancommons.com/about/#place',sourceLabel:'讀空間故事'},
 {prompt:'在《走傱的日南人》裡，哪一位日南人是震樂堂的經紀人？',options:['鄭成功','鄭宜豪','鄭筱萱','鄭阿極'],answer:2,explanation:'鄭筱萱把宮廟搖滾帶上不同舞臺，也是紀錄片裡三位日南人之一。',sourceUrl:'https://www.rinancommons.com/exhibition/to-and-from/#people',sourceLabel:'看人物與紀錄片'},
 {prompt:'在植物形態室放大一串稻穗，會看到穀粒怎麼排列？',options:['藏在一個大莢裡','沿著穗的分枝，各自掛在細梗上','一圈圈貼著莖排列','長在葉片邊緣'],answer:1,explanation:'順著稻穗往下看，主軸分出小枝，小枝上再垂著一粒粒稻穀。',sourceUrl:'https://www.rinancommons.com/plants/',sourceLabel:'近看水稻'},
 {prompt:'日南車站最具代表性的站房是哪一種建築？',options:['木造站房','紅磚拱廊站房','石砌碉堡','玻璃帷幕站房'],answer:0,explanation:'日南車站是海線標準形木造站房，現為臺中市市定古蹟。',sourceUrl:'https://www.tchac.taichung.gov.tw/building?pid=22&uid=33',sourceLabel:'查閱臺中市文化資產處資料'},
 {prompt:'2023 年臺中日南站與宮崎日南站締結姊妹站。這是臺鐵第幾個與日本鐵道締結的同名車站？',options:['第 1 個','第 3 個','第 7 個','第 5 個'],answer:3,explanation:'兩站於 2023 年 11 月 1 日締結；這是臺鐵第 5 個與日本鐵道締結的同名車站。',sourceUrl:'https://www.cna.com.tw/news/ahel/202311010163.aspx',sourceLabel:'閱讀中央社締結報導'},
 {prompt:'從日南驛搭手押臺車向北，經山柑、社苓後，會抵達哪個終點？',options:['大安港','山腳','后里','清水'],answer:1,explanation:'山腳線的路徑是日南驛、山柑、社苓、山腳；另一條五里牌線則通往頂後厝。',sourceUrl:'https://dcollection.lib.thu.edu.tw/wp-content/uploads/2024/12/02-%E9%A4%A8%E5%88%8A58%E6%9C%9F23-58%E5%91%A8%E5%BF%97%E4%BB%81-1.pdf',sourceLabel:'讀手押臺車史料'},
 {prompt:'一起種下日南吧！哪一種不在本次六種代表植物裡？',options:['木麻黃','水稻','芋頭','向日葵'],answer:3,explanation:'六種代表植物是木麻黃、水稻、芋頭、臺灣欒樹、甜根子草和構樹。',sourceUrl:'https://www.rinancommons.com/plants/',sourceLabel:'看六種代表植物'},
 {prompt:'稻站書架上，一本書旁標著「11/16 種下」。這個日期記的是什麼？',options:['加入稻站書架的日子','作者完成初稿的日子','出版社首刷的日子','讀者應還書的日子'],answer:0,explanation:'稻站用「種下」記錄一本書何時加入書架；有些書也記下了把它帶來的人。',sourceUrl:'https://www.rinancommons.com/books/index.html',sourceLabel:'逛稻站書架'},
];
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('');
const randomToken=(bytes=32)=>hex(crypto.getRandomValues(new Uint8Array(bytes)));
const hash=async v=>hex(await crypto.subtle.digest('SHA-256',enc.encode(v)));
const importKey=key=>crypto.subtle.importKey('raw',enc.encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);
const hmac=async(key,value)=>hex(await crypto.subtle.sign('HMAC',key,enc.encode(value)));
const allowedOrigins=e=>(e.SITE_ORIGINS||'https://www.rinancommons.com,https://jimmy10107.github.io').split(',').map(x=>x.trim()).filter(Boolean);
export const corsHeaders=(req,e)=>{const origin=req.headers.get('origin')||'';return allowedOrigins(e).includes(origin)?{'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'Content-Type','access-control-max-age':'600','vary':'Origin'}:{}};
const reply=(v,status=200,headers={})=>Response.json(v,{status,headers:{'cache-control':'no-store','referrer-policy':'no-referrer',...headers}});
const shuffle=a=>{const b=[...a];for(let i=b.length-1;i>0;i--){const n=new Uint32Array(1);crypto.getRandomValues(n);const j=n[0]%(i+1);[b[i],b[j]]=[b[j],b[i]]}return b};
const makePlan=()=>shuffle(questions.map((_,q)=>q)).map(q=>({q,o:shuffle([0,1,2,3])}));
const payload=(plan,position)=>{const item=plan[position],q=questions[item.q];return{position,total:questions.length,prompt:q.prompt,options:item.o.map(i=>q.options[i])}};
const validChallenge=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const quizOpen=e=>e.DB&&e.IDENTITY_KEY?.length>=32&&e.END_AT&&Date.parse(e.END_AT)>Date.now();
export const issueSQL='INSERT INTO claims(event,holder,issued) VALUES(?,?,?) ON CONFLICT(event,holder) DO NOTHING';
export const redeemSQL='UPDATE claims SET redeemed=?,staff=?,token_hash=NULL,expires=NULL WHERE event=? AND token_hash=? AND expires>? AND redeemed IS NULL RETURNING serial';

async function quizApi(req,e,p,body){
 const cors=corsHeaders(req,e);if(!cors['access-control-allow-origin'])return reply({},403);
 if(!quizOpen(e))return reply({error:'測驗或兌換目前未開放'},503,cors);
 const now=Math.floor(Date.now()/1000),db=e.DB,key=await importKey(e.IDENTITY_KEY);
 if(p.pathname==='/api/quiz/start'){
   const challenge=randomToken(),plan=makePlan(),expires=Math.floor(Date.parse(e.END_AT)/1000);
   await db.prepare('DELETE FROM quiz_sessions WHERE expires<? OR (used IS NOT NULL AND used<?)').bind(now,now-86400).run();
   await db.prepare('INSERT INTO quiz_sessions(challenge_hash,plan,position,attempts,created,expires) VALUES(?,?,?,?,?,?)').bind(await hash(challenge),JSON.stringify(plan),0,0,now,expires).run();
   return reply({challenge,expires,...payload(plan,0)},200,cors);
 }
 if(!validChallenge(body.challenge))return reply({error:'測驗工作階段無效，請重新開始'},400,cors);
 const challengeHash=await hash(body.challenge),row=await db.prepare('SELECT plan,position,attempts,expires,proof_expires,used FROM quiz_sessions WHERE challenge_hash=?').bind(challengeHash).first();
 if(!row||row.expires<=now)return reply({error:'測驗已逾時，請重新開始'},410,cors);
 const plan=JSON.parse(row.plan);
 if(row.position===questions.length){
   if(row.used)return reply({complete:true,claimed:true},200,cors);
   const proof=await hmac(key,'quiz-proof:'+body.challenge),proofExpires=Math.min(now+proofTtl,Math.floor(Date.parse(e.END_AT)/1000));
   await db.prepare('UPDATE quiz_sessions SET proof_hash=?,proof_expires=? WHERE challenge_hash=? AND used IS NULL').bind(await hash(proof),proofExpires,challengeHash).run();
   return reply({complete:true,proof,proofExpires},200,cors);
 }
 if(p.pathname==='/api/quiz/status')return reply(payload(plan,row.position),200,cors);
 if(p.pathname!=='/api/quiz/answer')return reply({},404,cors);
 if(!Number.isInteger(body.option)||body.option<0||body.option>3||body.step!==row.position)return reply({error:'測驗進度不同步，請重新載入'},409,cors);
 if(row.attempts>=maxAttempts)return reply({error:'嘗試次數過多，請重新開始'},429,cors);
 const item=plan[row.position],q=questions[item.q],correct=item.o[body.option]===q.answer;
 if(!correct){await db.prepare('UPDATE quiz_sessions SET attempts=attempts+1 WHERE challenge_hash=? AND position=?').bind(challengeHash,row.position).run();return reply({correct:false,...payload(plan,row.position),explanation:q.explanation,sourceUrl:q.sourceUrl,sourceLabel:q.sourceLabel},200,cors)}
 const next=row.position+1;
 if(next<questions.length){const changed=await db.prepare('UPDATE quiz_sessions SET position=? WHERE challenge_hash=? AND position=? AND expires>? RETURNING position').bind(next,challengeHash,row.position,now).first();if(!changed)return reply({error:'測驗進度已更新，請重新載入'},409,cors);return reply({correct:true,...payload(plan,next)},200,cors)}
 const proofExpires=Math.min(now+proofTtl,Math.floor(Date.parse(e.END_AT)/1000)),proof=await hmac(key,'quiz-proof:'+body.challenge);
 const changed=await db.prepare('UPDATE quiz_sessions SET position=?,proof_hash=?,proof_expires=? WHERE challenge_hash=? AND position=? AND expires>? RETURNING position').bind(next,await hash(proof),proofExpires,challengeHash,row.position,now).first();
 return changed?reply({correct:true,complete:true,proof,proofExpires},200,cors):reply({error:'測驗進度已更新，請重新載入'},409,cors);
}

export async function api(req,e,verify=fetch){
 const p=new URL(req.url),quiz=p.pathname.startsWith('/api/quiz/');
 if(req.method==='OPTIONS'&&quiz){const headers=corsHeaders(req,e);return new Response(null,{status:headers['access-control-allow-origin']?204:403,headers})}
 if(req.method!=='POST'||!req.headers.get('content-type')?.startsWith('application/json'))return reply({},403,quiz?corsHeaders(req,e):{});
 const body=await req.json().catch(()=>null);if(!body)return reply({},400,quiz?corsHeaders(req,e):{});
 if(quiz)return quizApi(req,e,p,body);
 if(req.headers.get('origin')!==p.origin)return reply({},403);
 if(!e.DB||!e.PRIVACY_NOTICE||!e.LIFF_ID||!e.CHANNEL_ID||!e.IDENTITY_KEY||e.IDENTITY_KEY.length<32||!e.END_AT||!(Date.parse(e.END_AT)>Date.now()))return reply({error:'兌換未開放或已截止'},503);
 const id=req.headers.get('authorization')?.match(/^Bearer (\S{1,8192})$/)?.[1];if(!id)return reply({},401);
 const r=await verify('https://api.line.me/oauth2/v2.1/verify',{method:'POST',body:new URLSearchParams({id_token:id,client_id:e.CHANNEL_ID})});
 if(!r.ok)return reply({error:'請重新登入 LINE'},401);
 const {sub,aud,exp,iss}=await r.json();if(typeof sub!=='string'||!sub||aud!==e.CHANNEL_ID||iss!=='https://access.line.me'||!(exp*1000>Date.now()))return reply({},401);
 const key=await importKey(e.IDENTITY_KEY),holder=await hmac(key,event+':'+sub),now=Math.floor(Date.now()/1000),db=e.DB;
 if(p.pathname==='/api/redeem'){
   if(!(e.STAFF_KEYS||'').split(',').map(s=>s.trim()).includes(holder))return reply({error:'此帳號沒有核銷權限'},403);
   if(!/^[a-f0-9]{48}$/.test(body.token||''))return reply({},400);
   const row=await db.prepare(redeemSQL).bind(now,holder,event,await hash(body.token),now).first();
   return row?reply({serial:row.serial,redeemed:true}):reply({error:'已使用、過期或無效；請勿發章'},409);
 }
 if(p.pathname==='/api/staff-key')return reply({key:holder});
 if(p.pathname!=='/api/claim')return reply({},404);
 let row=await db.prepare('SELECT serial,redeemed FROM claims WHERE event=? AND holder=?').bind(event,holder).first();
 if(!row&&typeof body.proof==='string'&&/^[a-f0-9]{64}$/.test(body.proof)){
   const used=await db.prepare('UPDATE quiz_sessions SET used=? WHERE proof_hash=? AND proof_expires>? AND used IS NULL AND position=? RETURNING challenge_hash').bind(now,await hash(body.proof),now,questions.length).first();
   if(used){await db.prepare(issueSQL).bind(event,holder,now).run();row=await db.prepare('SELECT serial,redeemed FROM claims WHERE event=? AND holder=?').bind(event,holder).first()}
 }
 if(!row)return reply({error:'請先在官網完成八題；完成證明不可重複使用'},403);
 if(row.redeemed||body.present!==true)return reply({serial:row.serial,redeemed:!!row.redeemed});
 const token=randomToken(24),expires=Math.min(now+90,Math.floor(Date.parse(e.END_AT)/1000));
 const changed=await db.prepare('UPDATE claims SET token_hash=?,expires=? WHERE serial=? AND redeemed IS NULL').bind(await hash(token),expires,row.serial).run();
 return changed.meta.changes?reply({serial:row.serial,token,expires}):reply({serial:row.serial,redeemed:true});
}
