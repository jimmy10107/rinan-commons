import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {api} from './api.mjs';
test('QR image remains hidden until a short-lived code is generated',()=>{
 const html=readFileSync(new URL('./public/index.html',import.meta.url),'utf8');
 assert.match(html,/<img id="qr"[^>]* hidden>/);
 assert.match(html,/img\[hidden\]\{display:none\}/);
});
test('LINE claim and short-lived, staff-only, single-use redemption',async()=>{
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 const DB={prepare:s=>({bind:(...v)=>({run:()=>({meta:sql.prepare(s).run(...v)}),first:()=>sql.prepare(s).get(...v)})})};
 const e={DB,CHANNEL_ID:'123',LIFF_ID:'test',IDENTITY_KEY:'x'.repeat(48),END_AT:'2099-01-01',PRIVACY_NOTICE:'test'};
 async function call(path,body,sub='guest'){
  const req=new Request('https://example.test/api/'+path,{method:'POST',headers:{origin:'https://example.test',authorization:'Bearer test','content-type':'application/json'},body:JSON.stringify(body)});
  const r=await api(req,e,async()=>Response.json({sub,iss:'https://access.line.me',aud:'123',exp:Date.now()/1000+600}));return [r.status,await r.json()];
 }
 assert.equal((await call('claim',{}))[0],403);
 const form={answers:Array(8).fill(0)};
 const [,first]=await call('claim',form);assert.equal(first.serial,(await call('claim',form))[1].serial);
 e.STAFF_KEYS=(await call('staff-key',{},'staff'))[1].key;
 const ticket=async()=>(await call('claim',{present:true}))[1].token;
 let token=await ticket();assert.equal((await call('redeem',{token}))[0],403);
 sql.exec('UPDATE claims SET expires=0');assert.equal((await call('redeem',{token},'staff'))[0],409);
 token=await ticket();const both=await Promise.all([call('redeem',{token},'staff'),call('redeem',{token},'staff')]);assert.deepEqual(both.map(r=>r[0]).sort(),[200,409]);
 assert.equal((await call('claim',form))[1].redeemed,true);sql.close();
});
