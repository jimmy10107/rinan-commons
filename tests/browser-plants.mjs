// Optional browser QA. Set PLAYWRIGHT_MODULE and CHROMIUM_PATH when using an external runtime.
import {createServer} from 'node:http';
import {readFileSync,statSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const plants=JSON.parse(readFileSync('app/plants/assets.json','utf8'));
const out=path.resolve('out'),qa='docs/qa/plants';mkdirSync(qa,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.txt':'text/plain','.xml':'application/xml'};
const server=createServer((req,res)=>{try{
 let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/rinan-commons\/?/,'');let file=path.resolve(out,relative||'index.html');if(!file.startsWith(out+path.sep)&&file!==out)throw Error('invalid path');if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');if(!existsSync(file)){res.writeHead(404);res.end();return;}
 const ext=path.extname(file),type=mime[ext]||'application/octet-stream';let data=readFileSync(file);const compress=/^(text\/|application\/(json|xml))/.test(type)&&req.headers['accept-encoding']?.includes('gzip');if(compress)data=gzipSync(data);res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':ext==='.html'?'no-cache':'public,max-age=3600',...(compress?{'Content-Encoding':'gzip'}:{})});res.end(data);
}catch{res.writeHead(500);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PLANTS_BASE_URL||`http://127.0.0.1:${server.address().port}/rinan-commons`;
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results={base,renderer:'Chromium software WebGL; mobile viewport emulation, not a physical phone',models:[],errors:[],viewports:[]};
try{
 const p=await b.newPage({viewport:{width:1366,height:1000},acceptDownloads:true});const requests=[];p.on('pageerror',e=>results.errors.push(e.message));p.on('request',r=>requests.push(r.url()));
 await p.goto(base+'/plants/');await p.locator('h1').waitFor();await p.evaluate(()=>document.fonts.ready);assert.equal(requests.filter(u=>u.endsWith('.glb')).length,0);assert.equal(await p.locator('canvas').count(),0);results.initialModelRequests=0;
 for(const width of [360,390,768,1024,1440]){await p.setViewportSize({width,height:1000});await p.waitForTimeout(100);const overflow=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);assert.equal(overflow,false,'overflow at '+width);results.viewports.push({width,noOverflow:true});if(width===390||width===1440)await p.screenshot({path:`${qa}/preview-${width}.png`,fullPage:true});}
 await p.getByRole('button',{name:'啟動 3D・旋轉看看'}).click();
 async function ready(file){await p.waitForFunction(e=>{const c=document.querySelector('canvas');return c?.dataset.ready==='true'&&c.dataset.model?.endsWith('/'+e)},file,{timeout:90000});await p.locator('.plant-scene').scrollIntoViewIfNeeded();await p.waitForTimeout(180);}
 async function visible(file){await ready(file);const raw=await p.locator('canvas').evaluate(c=>c.toDataURL('image/png').split(',')[1]);const info=await sharp(Buffer.from(raw,'base64')).stats();assert.ok(info.channels.slice(0,3).some(c=>c.stdev>2),'blank render: '+file);assert.ok(info.channels[3].mean>254,'cleared buffer: '+file);results.models.push({file,visible:true});}
 await ready(plants[2].organ.file);
 for(let i=0;i<6;i++){
  await p.locator('.plant-picker button').nth(i).click();await visible(plants[i].organ.file);
  await p.locator('.plant-quality select').selectOption('detail');await visible(plants[i].detail.file);
  await p.locator('.plant-quality select').selectOption('balanced');await ready(plants[i].organ.file);
  for(let s=0;s<5;s++){await p.locator('.plant-stages button').nth(s).click();await visible(plants[i].stages[s].file);}
  console.log('Verified',plants[i].id,'macro, detail, five stages');
 }
 await p.locator('.plant-picker button').nth(2).click();await ready(plants[2].organ.file);
 for(const name of ['正面','葉背','側面','放大模型','縮小模型','逆光'])await p.getByRole('button',{name,exact:true}).click();
 await p.getByRole('button',{name:'正面',exact:true}).click();await p.getByRole('button',{name:'逆光',exact:true}).click();
 await p.getByRole('button',{name:'慢慢轉',exact:true}).click();await p.waitForTimeout(250);const f1=await p.locator('canvas').getAttribute('data-frames');await p.waitForTimeout(300);const f2=await p.locator('canvas').getAttribute('data-frames');assert.ok(Number(f2)>Number(f1));
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await p.waitForTimeout(250);const off1=await p.locator('canvas').getAttribute('data-frames');await p.waitForTimeout(350);assert.equal(await p.locator('canvas').getAttribute('data-frames'),off1);results.offscreenPaused=true;
 await p.locator('.plant-scene').scrollIntoViewIfNeeded();await p.getByRole('button',{name:'停止旋轉',exact:true}).click();await p.waitForTimeout(500);const idle1=await p.locator('canvas').getAttribute('data-frames');await p.waitForTimeout(400);assert.equal(await p.locator('canvas').getAttribute('data-frames'),idle1);results.idlePaused=true;
 const pngWait=p.waitForEvent('download');await p.getByRole('button',{name:'儲存目前視角 PNG',exact:true}).click();const png=await pngWait;await png.saveAs('/tmp/plant-qa-export.png');assert.ok((await sharp('/tmp/plant-qa-export.png').stats()).channels[0].stdev>2);results.pngExport=true;
 const modelWait=p.waitForEvent('download');await p.locator('.plant-actions a').click();const glb=await modelWait;await glb.saveAs('/tmp/plant-qa-export.glb');assert.equal(readFileSync('/tmp/plant-qa-export.glb').toString('ascii',0,4),'glTF');results.glbExport=true;
 await p.getByRole('button',{name:'收起 3D',exact:true}).click();assert.equal(await p.locator('canvas').count(),0);results.contextReleased=true;
 await p.locator('.plant-sources-toggle').click();assert.equal(await p.locator('.plant-reference-grid figure').count(),plants[2].photos.length);await p.locator('.plant-sources-toggle').click();
 await p.route('**/models/rice-macro.glb',route=>route.abort());await p.locator('.plant-picker button').nth(1).click();await p.getByRole('button',{name:'啟動 3D・旋轉看看'}).click();await p.locator('.plant-loading[role=alert]').waitFor();assert.ok(await p.locator('.plant-poster').isVisible());await p.unroute('**/models/rice-macro.glb');await p.getByRole('button',{name:'重新載入',exact:true}).click();await ready(plants[1].organ.file);results.networkRecovery=true;
 await p.locator('canvas').evaluate(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());await p.locator('.plant-loading[role=alert]').waitFor();await p.getByRole('button',{name:'重新載入',exact:true}).click();await ready(plants[1].organ.file);results.contextRecovery=true;
 await p.locator('.plant-picker button').nth(0).click();await p.locator('.plant-picker button').nth(5).click();await ready(plants[5].organ.file);assert.equal(await p.locator('canvas').count(),1);results.rapidSwitch=true;
 await p.locator('.plant-picker button').nth(2).click();await ready(plants[2].organ.file);await p.screenshot({path:`${qa}/desktop-3d.png`,fullPage:true});
 const phone=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,reducedMotion:'reduce'});const m=await phone.newPage();m.on('pageerror',e=>results.errors.push(e.message));await m.goto(base+'/');await m.locator('.mobile-menu summary').tap();await m.getByRole('navigation',{name:'手機網站導覽'}).getByRole('link',{name:'植物近觀室'}).tap();await m.waitForURL('**/plants/');assert.equal(await m.locator('canvas').count(),0);await m.getByRole('button',{name:'啟動 3D・旋轉看看'}).tap();await m.waitForSelector('canvas[data-ready="true"]',{timeout:90000});await m.waitForTimeout(500);await m.screenshot({path:`${qa}/mobile-3d.png`,fullPage:true});results.mobileMenuAndTouch=true;assert.equal(await m.getByRole('button',{name:'慢慢轉',exact:true}).getAttribute('aria-pressed'),'false');results.reducedMotionNoAutoplay=true;await phone.close();
 const slow=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const s=await slow.newPage();const cdp=await slow.newCDPSession(s);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:100000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
 await s.addInitScript(()=>{window.__plantPerf={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__plantPerf.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__plantPerf.cls+=e.value}).observe({type:'layout-shift',buffered:true});});
 await s.goto(base+'/plants/');await s.waitForTimeout(1000);results.slowMobile=await s.evaluate(()=>({...window.__plantPerf,transferBytes:performance.getEntriesByType('resource').reduce((a,r)=>a+r.transferSize,0)+performance.getEntriesByType('navigation')[0].transferSize,modelRequests:performance.getEntriesByType('resource').filter(r=>r.name.endsWith('.glb')).length}));assert.equal(results.slowMobile.modelRequests,0);assert.ok(results.slowMobile.cls<.05);assert.ok(results.slowMobile.transferBytes<650000);await slow.close();
 assert.equal(results.models.length,42);assert.deepEqual(results.errors,[]);results.browser=await b.version();results.passed=true;writeFileSync(`${qa}/browser-report.json`,JSON.stringify(results,null,2)+'\n');console.log(JSON.stringify({...results,models:results.models.length}));
}finally{await b.close();server.close();}
