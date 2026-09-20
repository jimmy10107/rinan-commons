import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync,statSync} from 'node:fs';
import sharp from 'sharp';
const plants=JSON.parse(readFileSync('app/plants/assets.json','utf8'));
test('six plants expose all thirty growth states and both close-up qualities',()=>{
 assert.equal(plants.length,6);assert.equal(new Set(plants.map(p=>p.id)).size,6);
 for(const p of plants){assert.equal(p.stages.length,5);assert.ok(p.photos.length>=4);for(const photo of p.photos){assert.match(photo.source,/^https:\/\/commons.wikimedia.org\//);assert.ok(photo.author&&photo.license&&photo.licenseUrl);}}
});
test('all 42 GLBs are self-contained compressed assets within per-request budgets',()=>{
 let count=0;
 for(const p of plants)for(const [quality,a] of [['balanced',p.organ],['detail',p.detail],...p.stages.map(a=>['balanced',a])]){
  const b=readFileSync('public/plants/'+a.file);assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);assert.equal(a.bytes,b.length);
  assert.ok(b.length<(quality==='detail'?6.2:3.5)*1048576,a.file);
  const d=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));assert.ok(d.extensionsRequired.includes('EXT_meshopt_compression'));assert.ok(d.images.every(im=>typeof im.bufferView==='number'&&!im.uri));assert.ok(d.buffers.every(buf=>!buf.uri));count++;
 }
 assert.equal(count,42);
});
test('every state has a small real-model preview for non-WebGL and low-data visits',async()=>{
 for(const p of plants){
  for(const s of p.stages){const file='public/plants/'+s.preview;assert.ok(existsSync(file));const m=await sharp(file).metadata();assert.equal(m.width,720);assert.equal(m.height,720);assert.ok(statSync(file).size<250000);}
  for(const width of [480,960]){const file=`public/plants/previews/${p.id}-${width}.webp`;assert.ok(existsSync(file));const m=await sharp(file).metadata();assert.equal(m.width,width);}
 }
});
test('static page and shared navigation expose a proper standalone plants route',()=>{
 const h=readFileSync('out/plants/index.html','utf8');assert.match(h,/<h1[^>]*>植物近觀室<\/h1>/);assert.match(h,/啟動 3D/);assert.match(h,/預览|預覽/);assert.doesNotMatch(h,/<canvas/);
 for(const route of ['','about/','explore/','visit/','exhibition/to-and-from/','walk/2026/']){const html=readFileSync(`out/${route}index.html`,'utf8');assert.match(html,/href="\/rinan-commons\/plants\/"/);}
});
