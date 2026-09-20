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
const reports=[];
try{for(const plant of plants){const c=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await c.newPage();const d=await c.newCDPSession(p);await d.send('Network.enable');await d.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:1250000,uploadThroughput:250000});await d.send('Emulation.setCPUThrottlingRate',{rate:2});const errors=[];p.on('pageerror',e=>errors.push(e.message));const t=Date.now();await p.goto(base+'/plants/?plant='+plant.id,{waitUntil:'domcontentloaded'});await p.waitForFunction(name=>document.querySelector('.plant-scene-label strong')?.textContent===name&&document.querySelector('.plant-film img.current')?.naturalWidth>0,plant.name);const first=Date.now()-t;await p.waitForFunction(()=>document.querySelector('.plant-observatory')?.getAttribute('data-warmed')==='5',null,{timeout:30000});const all=Date.now()-t;reports.push({id:plant.id,firstFrameMs:first,allFivePreparedMs:all,errors});console.log(reports.at(-1));assert.deepEqual(errors,[]);await c.close();}writeFileSync(`${qa}/cold-network-report.json`,JSON.stringify({conditions:'10 Mbps, 80ms latency, 2x CPU throttle, Chromium software WebGL; not physical mobile',plants:reports},null,2));}finally{await b.close();server.close();}