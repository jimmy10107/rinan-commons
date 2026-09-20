// Optional browser QA. Set PLAYWRIGHT_MODULE and CHROMIUM_PATH when using an external runtime.
import {createServer} from 'node:http';
import {readFileSync,statSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const plants=JSON.parse(readFileSync('app/plants/assets.json','utf8'));
const out=path.resolve('out'),qa='docs/qa/plants-v3';mkdirSync(qa,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.txt':'text/plain','.xml':'application/xml'};
const server=createServer((req,res)=>{try{
 let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/rinan-commons\/?/,'');let file=path.resolve(out,relative||'index.html');if(!file.startsWith(out+path.sep)&&file!==out)throw Error('invalid path');if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');if(!existsSync(file)){res.writeHead(404);res.end();return;}
 const ext=path.extname(file),type=mime[ext]||'application/octet-stream';let data=readFileSync(file);const compress=/^(text\/|application\/(json|xml))/.test(type)&&req.headers['accept-encoding']?.includes('gzip');if(compress)data=gzipSync(data);res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':ext==='.html'?'no-cache':'public,max-age=3600',...(compress?{'Content-Encoding':'gzip'}:{})});res.end(data);
}catch{res.writeHead(500);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PLANTS_BASE_URL||`http://127.0.0.1:${server.address().port}/rinan-commons`;
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results={base,models:[],errors:[],viewports:[]};
try{
 const p=await b.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});const requests=[];p.on('pageerror',e=>results.errors.push(e.message));p.on('request',r=>{if(r.url().endsWith('.glb'))requests.push(r.url())});
 const ready=async file=>{await p.waitForFunction(file=>{const c=document.querySelector('canvas');return c?.dataset.ready==='true'&&c.dataset.model?.endsWith('/'+file)},file,{timeout:90000});};
 const visible=async file=>{await ready(file);await p.locator('.plant-scene').scrollIntoViewIfNeeded();await p.waitForTimeout(180);const raw=await p.locator('canvas').evaluate(c=>c.toDataURL().split(',')[1]);const info=await sharp(Buffer.from(raw,'base64')).stats();assert.ok(info.channels.slice(0,3).some(c=>c.stdev>2),'blank '+file);results.models.push(file);};
 await p.goto(base+'/plants/');await ready(plants[2].stages[2].file);assert.ok(requests[0].endsWith('taro-3-lite.glb'));results.auto3D=true;results.liteBeforeDetailed=true;
 for(const width of [360,390,768,1024,1440]){await p.setViewportSize({width,height:1000});await p.waitForTimeout(150);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.viewports.push(width);if(width===390||width===1440)await p.screenshot({path:`${qa}/layout-${width}.png`,fullPage:true});}
 for(let i=0;i<6;i++){
  await p.locator('.plant-picker button').nth(i).click();
  for(let n=0;n<5;n++){await p.locator('.plant-stages button').nth(n).click();await p.locator('.plant-quality select').selectOption('lite');await visible(plants[i].stages[n].lite.file);}
  await p.locator('.plant-quality select').selectOption('balanced');await visible(plants[i].stages[4].file);
  await p.getByRole('button',{name:'葉與花果特寫',exact:true}).click();await visible(plants[i].organ.file);
  await p.locator('.plant-quality select').selectOption('lite');await visible(plants[i].organ.lite.file);
  await p.locator('.plant-quality select').selectOption('detail');await visible(plants[i].detail.file);
  console.log('All states and closeups',plants[i].id);
 }
 await p.locator('.plant-picker button').nth(2).click();await ready(plants[2].stages[2].file);await p.getByRole('button',{name:'葉與花果特寫',exact:true}).click();await ready(plants[2].organ.file);
 await p.getByRole('button',{name:'放大模型',exact:true}).click();await p.getByRole('button',{name:'放大模型',exact:true}).click();await ready(plants[2].detail.file);results.zoomAutoRefinement=true;
 const distance=Number(await p.locator('canvas').getAttribute('data-distance'));await p.locator('.plant-quality select').selectOption('balanced');await ready(plants[2].organ.file);const distanceAfter=Number(await p.locator('canvas').getAttribute('data-distance'));assert.ok(Math.abs(distance-distanceAfter)<.001);results.viewPreserved=true;
 await p.getByRole('button',{name:'慢慢轉',exact:true}).click();await p.waitForTimeout(500);await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(200);const f=await p.locator('canvas').getAttribute('data-frames');await p.waitForTimeout(300);assert.equal(await p.locator('canvas').getAttribute('data-frames'),f);results.offscreenPaused=true;await p.getByRole('button',{name:'停止旋轉',exact:true}).click();
 await p.getByRole('button',{name:'全株生長',exact:true}).click();await ready(plants[2].stages[2].file);const dw=p.waitForEvent('download');await p.locator('.plant-svg').click();const download=await dw;await download.saveAs('/tmp/plant-v3.svg');assert.match(readFileSync('/tmp/plant-v3.svg','utf8'),/<svg/);results.svgDownload=true;
 await p.getByRole('button',{name:'網格',exact:true}).click();assert.equal(await p.getByRole('button',{name:'網格',exact:true}).getAttribute('aria-pressed'),'true');
 await p.getByRole('button',{name:'收起 3D',exact:true}).click();assert.equal(await p.locator('canvas').count(),0);await p.route('**/taro-3-lite.glb',route=>route.abort());await p.evaluate(()=>caches.delete('rinan-plant-models-v3'));await p.getByRole('button',{name:'啟動 3D・旋轉看看'}).click();await p.locator('.plant-loading[role=alert]').waitFor();await p.unroute('**/taro-3-lite.glb');await p.getByRole('button',{name:'重新載入',exact:true}).click();await ready(plants[2].stages[2].file);results.networkRecovery=true;
 const warm=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await warm.newPage();const req=[];m.on('request',r=>{if(r.url().endsWith('.glb'))req.push(r.url())});await m.goto(base+'/');await m.waitForTimeout(900);assert.equal(req.length,0);await m.waitForFunction(async()=>{const c=await caches.open('rinan-plant-models-v3');return (await c.keys()).length>0},null,{timeout:18000});assert.ok(req.every(u=>u.endsWith('-lite.glb')));results.idlePreload=true;
 await m.locator('.mobile-menu summary').tap();await m.getByRole('navigation',{name:'手機網站導覽'}).getByRole('link',{name:'日南植物形態室'}).tap();await m.waitForURL('**/plants/');await m.waitForSelector('canvas[data-ready=true]',{timeout:90000});assert.equal(req.filter(u=>u.endsWith('taro-3-lite.glb')).length,1);results.crossPageCache=true;await m.screenshot({path:`${qa}/mobile-live.png`,fullPage:true});await warm.close();
 const low=await b.newContext();await low.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'}}));const l=await low.newPage();const lr=[];l.on('request',r=>{if(r.url().endsWith('.glb'))lr.push(r.url())});await l.goto(base+'/');await l.waitForTimeout(5800);assert.equal(lr.length,0);await l.goto(base+'/plants/');await l.waitForSelector('canvas[data-ready=true]',{timeout:90000});await l.waitForTimeout(1700);assert.ok(lr.length===1&&lr[0].endsWith('-lite.glb'));results.saveDataHonored=true;await low.close();
 assert.deepEqual(results.errors,[]);results.passed=true;writeFileSync(`${qa}/browser-report.json`,JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({...results,models:results.models.length}));
}finally{await b.close();server.close();}
