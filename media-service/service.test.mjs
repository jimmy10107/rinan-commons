import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {generateKeyPair,SignJWT} from 'jose';
import {verifyOwner} from './auth.mjs';
import {createHandler} from './worker.mjs';
const {privateKey,publicKey}=await generateKeyPair('RS256');
const hash='a'.repeat(64);
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
 db.prepare('INSERT INTO media_assets(id,title,original_key,mime_type,width,height) VALUES(?,?,?,?,?,?)').run('RN-001','Test',`originals/${hash}.jpg`,'image/jpeg',1600,1200);
 for(const width of [480,800,1200])db.prepare('INSERT INTO media_variants VALUES(?,?,?)').run('RN-001',width,`previews/${hash}/${width}.webp`);
 let originalsRead=0;
 const env={ACCESS_TEAM_DOMAIN:'https://example.cloudflareaccess.com',ACCESS_AUDIENCE:'media-app',MEDIA_OWNER_EMAIL:'owner@example.com',
 MEDIA_DB:{prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args);},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}};}},
 ORIGINALS:{async get(){originalsRead++;return {body:'original'};}},DISPLAYS:{async get(){return {body:'preview',httpMetadata:{contentType:'image/webp'}};},async head(){return {httpMetadata:{contentType:'image/webp'}};}}};
 const handler=createHandler((r,e)=>verifyOwner(r,e,publicKey));
 return {env,db,readCount:()=>originalsRead,request:async(path,token,body,origin='https://media.example.com')=>handler(new Request('https://media.example.com'+path,{method:body===undefined?'GET':'POST',headers:{...(token?{'cf-access-jwt-assertion':token}:{}),...(body!==undefined?{'content-type':'application/json',origin}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})}),env)};
}
async function token(email='owner@example.com',audience='media-app',expiration='5m') {return new SignJWT({email}).setProtectedHeader({alg:'RS256'}).setIssuer('https://example.cloudflareaccess.com').setAudience(audience).setSubject('owner-id').setIssuedAt().setExpirationTime(expiration).sign(privateKey);}
test('anonymous and forged headers cannot read originals or administration',async()=>{const f=fixture();for(const path of ['/admin','/admin/catalog','/admin/original/RN-001','/admin/preview/RN-001/800.webp'])for(const jwt of [undefined,'forged'])assert.equal((await f.request(path,jwt)).status,403);assert.equal(f.readCount(),0);});
test('JWT must be unexpired, correct audience, and owner',async()=>{const f=fixture();for(const jwt of [await token('other@example.com'),await token(undefined,'other-app'),await token(undefined,undefined,1)])assert.equal((await f.request('/admin/original/RN-001',jwt)).status,403);assert.equal(f.readCount(),0);});
test('owner can download originals; catalog never exposes object keys',async()=>{const f=fixture(),jwt=await token();const r=await f.request('/admin/original/RN-001',jwt);assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);assert.match(r.headers.get('content-disposition'),/attachment/);const catalog=await (await f.request('/admin/catalog',jwt)).text();assert.doesNotMatch(catalog,/originals\/|object_key|original_key/);});
test('draft is private; explicit approval publishes only variants; revocation is immediate',async()=>{const f=fixture(),jwt=await token();assert.equal((await f.request('/image/RN-001/800.webp')).status,404);assert.equal((await f.request('/admin/publish/RN-001',jwt,{credit:'Photographer'})).status,400);assert.equal((await f.request('/admin/publish/RN-001',jwt,{credit:'Photographer',displayApproved:true})).status,200);const r=await f.request('/image/RN-001/800.webp');assert.equal(r.status,200);assert.equal(await r.text(),'preview');assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(f.readCount(),0);assert.equal((await f.request('/image/RN-001/original')).status,404);assert.equal((await f.request('/admin/unpublish/RN-001',jwt,{})).status,200);assert.equal((await f.request('/image/RN-001/800.webp')).status,404);});
test('cross-origin mutations and missing variants fail closed',async()=>{const f=fixture(),jwt=await token(),body={credit:'Photographer',displayApproved:true};assert.equal((await f.request('/admin/publish/RN-001',jwt,body,'https://attacker.example')).status,403);f.env.DISPLAYS.head=async()=>null;assert.equal((await f.request('/admin/publish/RN-001',jwt,body)).status,409);assert.equal((await f.request('/image/RN-001/800.webp')).status,404);});
test('invalid object keys cannot access originals through display endpoint',async()=>{const f=fixture(),jwt=await token();f.db.prepare('UPDATE media_variants SET object_key=? WHERE width=800').run(`originals/${hash}.jpg`);assert.equal((await f.request('/admin/preview/RN-001/800.webp',jwt)).status,404);assert.equal(f.readCount(),0);});
test('oversized mutation and unsupported image sizes are rejected',async()=>{const f=fixture(),jwt=await token();assert.equal((await f.request('/admin/publish/RN-001',jwt,{credit:'x'.repeat(5000),displayApproved:true})).status,413);assert.equal((await f.request('/image/RN-001/1600.webp')).status,404);});
