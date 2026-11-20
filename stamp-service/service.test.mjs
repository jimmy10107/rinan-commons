import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {api} from './api.mjs';

test('QR image remains hidden and LIFF accepts only a proof fragment',()=>{
 const html=readFileSync(new URL('./public/index.html',import.meta.url),'utf8'),js=readFileSync(new URL('./public/stamp.js',import.meta.url),'utf8');
 assert.match(html,/<img id="qr"[^>]* hidden>/);assert.match(html,/img\[hidden\]\{display:none\}/);
 assert.match(js,/#proof=/);assert.doesNotMatch(js,/searchParams\.get\('a'\)|answers:/);
});

test('server-owned quiz, one-time proof, LINE claim and single-use redemption',async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const DB={prepare:s=>({bind:(...v)=>({run:()=>({meta:sql.prepare(s).run(...v)}),first:()=>sql.prepare(s).get(...v)})})};
 const e={DB,CHANNEL_ID:'123',LIFF_ID:'test',IDENTITY_KEY:'x'.repeat(48),END_AT:'2099-01-01',PRIVACY_NOTICE:'test',SITE_ORIGINS:'https://www.rinancommons.com'};
 const verify=sub=>async()=>Response.json({sub,iss:'https://access.line.me',aud:'123',exp:Date.now()/1000+600});
 async function quiz(path,body,origin='https://www.rinancommons.com'){
  const req=new Request('https://example.test/api/quiz/'+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});const r=await api(req,e);return[r.status,await r.json(),r.headers];
 }
 async function line(path,body,sub='guest'){
  const req=new Request('https://example.test/api/'+path,{method:'POST',headers:{origin:'https://example.test',authorization:'Bearer test','content-type':'application/json'},body:JSON.stringify(body)});const r=await api(req,e,verify(sub));return[r.status,await r.json()];
 }
 assert.equal((await quiz('start',{},'https://evil.example'))[0],403);
 const [startStatus,start,startHeaders]=await quiz('start',{});assert.equal(startStatus,200);assert.match(start.challenge,/^[a-f0-9]{64}$/);assert.equal(startHeaders.get('access-control-allow-origin'),'https://www.rinancommons.com');
 const correct=new Map([
  ['稻站前身是守橋營房。當年駐守的人員主要守護什麼？','舊鐵橋'],
  ['在《走傱的日南人》裡，哪一位日南人是震樂堂的經紀人？','鄭筱萱'],
  ['在植物形態室放大一串稻穗，會看到穀粒怎麼排列？','沿著穗的分枝，各自掛在細梗上'],
  ['日南車站最具代表性的站房是哪一種建築？','木造站房'],
  ['2023 年臺中日南站與宮崎日南站締結姊妹站。這是臺鐵第幾個與日本鐵道締結的同名車站？','第 5 個'],
  ['從日南驛搭手押臺車向北，經山柑、社苓後，會抵達哪個終點？','山腳'],
  ['一起種下日南吧！哪一種不在本次六種代表植物裡？','向日葵'],
  ['稻站書架上，一本書旁標著「11/16 種下」。這個日期記的是什麼？','加入稻站書架的日子'],
 ]);
 let state=start;const right=()=>state.options.indexOf(correct.get(state.prompt)),wrong=()=>state.options.findIndex((_,i)=>i!==right());
 const [,miss]=await quiz('answer',{challenge:start.challenge,step:0,option:wrong()});assert.equal(miss.correct,false);assert.equal(miss.position,0);assert.match(miss.explanation,/鐵路橋梁|鄭筱萱|稻穀|木造站房|第 5 個|山腳線|六種代表植物|加入書架/);
 state=(await quiz('answer',{challenge:start.challenge,step:0,option:right()}))[1];assert.equal(state.position,1);
 const [,progress]=await quiz('status',{challenge:start.challenge});assert.equal(progress.position,1);assert.equal(progress.prompt,state.prompt);
 for(let step=1;step<8;step++){const [,next]=await quiz('answer',{challenge:start.challenge,step,option:right()});state=next;if(step<7)assert.equal(next.position,step+1)}
 assert.equal(state.complete,true);assert.match(state.proof,/^[a-f0-9]{64}$/);
 sql.exec('UPDATE quiz_sessions SET proof_expires=0');
 const [,resumed]=await quiz('status',{challenge:start.challenge});assert.equal(resumed.complete,true);assert.equal(resumed.proof,state.proof);assert.ok(resumed.proofExpires>Date.now()/1000);
 assert.equal((await line('claim',{}))[0],403);const [,first]=await line('claim',{proof:state.proof});assert.ok(first.serial);
 assert.equal((await line('claim',{proof:state.proof},'other'))[0],403);
 const [,afterUse]=await quiz('status',{challenge:start.challenge});assert.equal(afterUse.claimed,true);
 assert.equal((await line('claim',{}))[1].serial,first.serial);
 e.STAFF_KEYS=(await line('staff-key',{},'staff'))[1].key;
 const ticket=async()=>(await line('claim',{present:true}))[1].token;
 let token=await ticket();assert.equal((await line('redeem',{token}))[0],403);
 sql.exec('UPDATE claims SET expires=0');assert.equal((await line('redeem',{token},'staff'))[0],409);
 token=await ticket();const both=await Promise.all([line('redeem',{token},'staff'),line('redeem',{token},'staff')]);assert.deepEqual(both.map(r=>r[0]).sort(),[200,409]);
 assert.equal((await line('claim',{}))[1].redeemed,true);sql.close();
});
