// Render the thirty state previews from the actual browser models. Optional Playwright dependency.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {spawn}=require('child_process');const fs=require('fs');const root=process.cwd();const sharp=require(root+'/node_modules/sharp');
(async()=>{let server,b;
try{
 server=spawn('node',['node_modules/next/dist/bin/next','dev','--hostname','127.0.0.1','--port','3000'],{cwd:root,env:{...process.env,NEXT_PUBLIC_BASE_PATH:'/rinan-commons',GITHUB_PAGES:'true'},stdio:['ignore','pipe','pipe']});
 await new Promise((resolve,reject)=>{server.stdout.on('data',d=>{if(d.toString().includes('Ready'))resolve()});server.on('exit',c=>reject(Error('Server exit '+c)));});
 b=await chromium.launch({...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1280,height:1000},deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:3000/rinan-commons/plants/');await p.getByRole('button',{name:'啟動 3D・旋轉看看'}).click();await p.waitForSelector('canvas[data-ready="true"]',{timeout:60000});
 const assets=JSON.parse(fs.readFileSync(root+'/app/plants/assets.json'));let outputs=[];
 for(let i=0;i<assets.length;i++){
  await p.locator('.plant-picker button').nth(i).click();
  for(let s=0;s<5;s++){
   await p.locator('.plant-stages button').nth(s).click();
   const ending=`/${assets[i].id}-${s+1}.glb`;
   await p.waitForFunction(e=>{const c=document.querySelector('canvas');return c?.dataset.ready==='true'&&c.dataset.model?.endsWith(e)},ending,{timeout:60000});
   await p.locator('.plant-scene').scrollIntoViewIfNeeded();await p.waitForTimeout(200);
   const download=p.waitForEvent('download');await p.getByRole('button',{name:'儲存目前視角 PNG'}).click();const file=await download;const temp=`/tmp/${assets[i].id}-${s+1}.png`;await file.saveAs(temp);
   const input=sharp(temp);const stats=await input.stats();if(stats.channels.slice(0,3).every(c=>c.stdev<2))throw Error('Blank model '+ending);
   await sharp(temp).resize(720,720,{fit:'contain',background:'#17231c'}).webp({quality:85}).toFile(root+`/public/plants/previews/${assets[i].id}-${s+1}.webp`);
   outputs.push(ending);console.log('Rendered',ending);
  }
 }
 if(errors.length)throw Error(JSON.stringify(errors));fs.writeFileSync('/tmp/plant-stage-render-report.json',JSON.stringify({models:outputs,allVisible:true}));
}finally{if(b)await b.close();if(server)server.kill('SIGTERM');}
})().catch(e=>{console.error(e);process.exit(1)});
