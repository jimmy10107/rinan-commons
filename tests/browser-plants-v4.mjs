// Optional browser QA. Set PLAYWRIGHT_MODULE and CHROMIUM_PATH when using an external runtime.
import {createServer} from 'node:http';
import {readFileSync,statSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {gzipSync} from 'node:zlib';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE||'playwright');
const plants=JSON.parse(readFileSync('app/plants/assets.json','utf8'));
const out=path.resolve('out'),qa='docs/qa/plants-v4';mkdirSync(qa,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.glb':'model/gltf-binary','.txt':'text/plain','.xml':'application/xml'};
const server=createServer((req,res)=>{try{
 let relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/rinan-commons\/?/,'');let file=path.resolve(out,relative||'index.html');if(!file.startsWith(out+path.sep)&&file!==out)throw Error('invalid path');if(existsSync(file)&&statSync(file).isDirectory())file=path.join(file,'index.html');if(!existsSync(file)){res.writeHead(404);res.end();return;}
 const ext=path.extname(file),type=mime[ext]||'application/octet-stream';let data=readFileSync(file);const compress=/^(text\/|application\/(json|xml))/.test(type)&&req.headers['accept-encoding']?.includes('gzip');if(compress)data=gzipSync(data);res.writeHead(200,{'Content-Type':type,'Content-Length':data.length,'Cache-Control':ext==='.html'?'no-cache':'public,max-age=3600',...(compress?{'Content-Encoding':'gzip'}:{})});res.end(data);
}catch{res.writeHead(500);res.end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.PLANTS_BASE_URL||`http://127.0.0.1:${server.address().port}/rinan-commons`;
const b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});
const results={models:[],errors:[],warmTimes:[],viewports:[],base};
try{
 const p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>results.errors.push(e.message));const requests=[];p.on('request',r=>{if(r.url().endsWith('.glb'))requests.push(r.url())});
 const ready=async file=>p.waitForFunction(f=>{const c=document.querySelector('canvas');return c?.dataset.ready==='true'&&c.dataset.model?.endsWith('/'+f)},file,{timeout:90000});
 await p.goto(base+'/plants/');await p.locator('.plant-film').waitFor();assert.equal(await p.locator('.plant-film img').count(),5);await p.waitForFunction(()=>[...document.querySelectorAll('.plant-film img')].every(i=>i.complete&&i.naturalWidth>0));await p.screenshot({path:`${qa}/svg-intro.png`,fullPage:true});
 for(let i=0;i<6;i++){
  const start=Date.now();await p.locator('.plant-picker button').nth(i).click();await p.waitForFunction(()=>document.querySelector('.plant-observatory')?.getAttribute('data-warmed')==='5',null,{timeout:90000});results.warmTimes.push({id:plants[i].id,ms:Date.now()-start});if(await p.getByRole('button',{name:'直接操作 3D',exact:true}).isVisible())await p.getByRole('button',{name:'直接操作 3D',exact:true}).click();
  for(let j=0;j<5;j++){const n=requests.length,t=Date.now();await p.locator('.plant-stages button').nth(j).click();await ready(plants[i].stages[j].lite.file);const switchMs=Date.now()-t;assert.equal(requests.length,n,'cached stage triggered a download');assert.ok(switchMs<1600,'cached stage too slow');results.models.push({id:plants[i].id,stage:j,ms:switchMs});}
  console.log('Five cached states',plants[i].id,results.warmTimes.at(-1).ms);
 }
 await p.locator('.plant-picker button').nth(2).click();await p.locator('.plant-stages button').nth(2).click();await ready('models/taro-3-lite.glb');const n=requests.length;await p.waitForTimeout(1700);assert.ok(!requests.slice(n).some(u=>u.endsWith('taro-3.glb')));results.noUnrequestedUpgrade=true;
 await p.getByRole('button',{name:'放大模型',exact:true}).click();await p.getByRole('button',{name:'放大模型',exact:true}).click();await ready('models/taro-3.glb');results.zoomWholeDetail=true;
 await p.getByRole('button',{name:'葉與花果特寫',exact:true}).click();await ready('models/taro-macro-lite.glb');await p.getByRole('button',{name:'放大模型',exact:true}).click();await p.getByRole('button',{name:'放大模型',exact:true}).click();await ready('models/taro-detail.glb');results.zoomMacroDetail=true;
 for(const width of [360,390,768,1024,1440]){await p.setViewportSize({width,height:950});assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.viewports.push(width);}
 await p.getByRole('button',{name:'重播生長動畫',exact:true}).click();await p.locator('.plant-film').waitFor();const begin=Date.now();await p.waitForFunction(()=>document.querySelector('.plant-observatory')?.getAttribute('data-intro')==='false');results.filmMs=Date.now()-begin;assert.ok(results.filmMs>=6200&&results.filmMs<7500);
 const slow=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const m=await slow.newPage();const cdp=await slow.newCDPSession(m);await cdp.send('Network.enable');await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1250000,uploadThroughput:250000});await cdp.send('Emulation.setCPUThrottlingRate',{rate:2});const start=Date.now();await m.goto(base+'/plants/',{waitUntil:'domcontentloaded'});await m.waitForFunction(()=>document.querySelector('.plant-film img.current')?.naturalWidth>0);results.coldMobileFirstFrameMs=Date.now()-start;await m.waitForFunction(()=>document.querySelector('.plant-observatory')?.getAttribute('data-warmed')==='5',null,{timeout:90000});results.coldMobileAllFiveMs=Date.now()-start;await m.waitForFunction(()=>document.querySelector('.plant-observatory')?.getAttribute('data-intro')==='false');await m.screenshot({path:`${qa}/mobile-ready.png`,fullPage:true});assert.ok(await m.getByRole('button',{name:'放大模型',exact:true}).isEnabled());results.mobileReady=true;await slow.close();
 const low=await b.newContext({reducedMotion:'reduce'});await low.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,effectiveType:'4g'}}));const l=await low.newPage();const lr=[];l.on('request',r=>{if(r.url().endsWith('.glb'))lr.push(r.url())});await l.goto(base+'/plants/');await l.waitForSelector('canvas[data-ready=true]',{timeout:90000});await l.waitForTimeout(600);assert.equal(await l.locator('.plant-film').count(),0);assert.equal(lr.length,1);results.reducedMotionAndSaveData=true;await low.close();
 assert.deepEqual(results.errors,[]);results.passed=true;writeFileSync(`${qa}/browser-report.json`,JSON.stringify(results,null,2));console.log(JSON.stringify({...results,models:results.models.length}));
}finally{await b.close();server.close();}
