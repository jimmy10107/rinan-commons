const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve('out');
const output=process.env.CIS_REVIEW_DIR || '/tmp/rinan-cis-review';fs.mkdirSync(output,{recursive:true});
const server=http.createServer((req,res)=>{let f=root+decodeURIComponent(req.url.split('?')[0]).replace(/^\/rinan-commons/,'');if(f.endsWith('/'))f+='index.html';if(!fs.existsSync(f)){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',({'.html':'text/html','.css':'text/css','.js':'application/javascript','.json':'application/json','.webp':'image/webp','.woff2':'font/woff2'})[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));});
(async()=>{
 await new Promise(r=>server.listen(4173,'127.0.0.1',r));
 const b=await chromium.launch({executablePath:process.env.CIS_CHROMIUM, args:process.env.CIS_CHROMIUM_ARGS?JSON.parse(process.env.CIS_CHROMIUM_ARGS):[],headless:true});
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:4173/rinan-commons';const results=[];
 const go=async(route)=>{await p.goto(base+route,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready)};
 try{
 for(const width of [320,390,768,1440]){
  await p.setViewportSize({width,height:900});
  for(const route of ['/','/about/','/stories/','/visit/','/stories/a-station-in-daily-life/']){
   await go(route);const size=await p.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert.ok(size.scroll<=width,`${width} ${route} overflow ${size.scroll}`);
   results.push(`${width}px ${route}: no horizontal overflow`);
   if(route==='/'&&(width===390||width===1440))await p.screenshot({path:output+`/v2-home-${width}.png`,fullPage:true});
  }
 }
 await p.setViewportSize({width:390,height:844});await go('/');
 await p.getByRole('button',{name:'選單'}).click();assert.equal(await p.locator('dialog').evaluate(e=>e.open),true);
 assert.equal(await p.evaluate(()=>document.body.style.overflow),'hidden');
 for(let i=0;i<12;i++){await p.keyboard.press('Tab');assert.ok(await p.evaluate(()=>!!document.activeElement.closest('dialog')))}
 await p.keyboard.press('Escape');assert.equal(await p.locator('dialog').evaluate(e=>e.open),false);assert.ok((await p.evaluate(()=>document.activeElement.textContent)).includes('選單'));
 results.push('Mobile dialog: focus containment, Escape, return focus, scroll lock passed');
 await p.getByRole('button',{name:'選單'}).click();await p.setViewportSize({width:1440,height:900});await p.waitForFunction(()=>!document.querySelector('dialog').open);assert.equal(await p.evaluate(()=>document.body.style.overflow),'');results.push('Desktop breakpoint closes mobile dialog and restores scroll');
 await p.setViewportSize({width:390,height:844});await go('/stories/');
 const field=p.getByRole('searchbox');await field.fill('zzzzzz');assert.equal(await p.locator('.journal-result').count(),0);assert.ok(p.url().includes('q=zzzzzz'));
 await p.getByRole('button',{name:'清除條件，顯示全部'}).click();assert.equal(await p.locator('.journal-result').count(),2);
 await field.fill('車站');await p.reload();await p.waitForFunction(()=>document.querySelector('input').value==='車站');
 await p.locator('.journal-result').first().click();await p.waitForURL('**/stories/a-station-in-daily-life/');await p.goBack();await p.waitForFunction(()=>document.querySelector('input').value==='車站');
 await p.getByRole('button',{name:'清除搜尋',exact:true}).click();assert.equal(await p.locator('.journal-result').count(),2);
 const categories=await p.locator('.filter-buttons button').allTextContents();await p.locator('.filter-buttons button').nth(1).click();assert.ok(p.url().includes('category='));assert.equal(await p.locator('.filter-buttons button').nth(1).getAttribute('aria-pressed'),'true');
 results.push('Search: empty/recovery, clear, category, URL reload and back persistence passed');
 await go('/visit/');assert.equal(await p.locator('iframe').count(),0);await p.getByRole('link',{name:'公車',exact:true}).click();assert.ok(p.url().endsWith('#bus'));
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}},configurable:true}));await p.getByRole('button',{name:'複製地址'}).click();await p.getByText('地址已複製',{exact:true}).waitFor();
 await p.evaluate(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true}));await p.getByRole('button',{name:'複製地址'}).click();await p.getByRole('textbox',{name:'可手動複製的地址'}).waitFor();results.push('Visit: no map, transport anchor, clipboard success and denied fallback passed');
 await p.goto(base+'/explore/',{waitUntil:'domcontentloaded'});await p.locator('.rinan-map-frame').evaluate(e=>e.dataset.keep='yes');
 await p.getByRole('button',{name:'收起互動地圖'}).click();assert.equal(await p.locator('#interactive-map').isVisible(),false);
 await p.getByRole('button',{name:'展開互動地圖'}).click();assert.equal(await p.locator('.rinan-map-frame').getAttribute('data-keep'),'yes');results.push('Map collapse retains original iframe node and expands again');
 await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.quiet-button').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');results.push('Reduced motion removes transitions');
 await p.goto('file://'+output+'/rinan-cis-v2-preview.html');const frame=p.frameLocator('#preview');await frame.locator('h1').waitFor();await p.getByRole('button',{name:'手機 390'}).click();
 await frame.getByRole('button',{name:'選單'}).click();await frame.getByRole('navigation',{name:'手機網站導覽'}).getByRole('link',{name:'地方筆記'}).click();await frame.getByRole('searchbox').fill('zzzzz');await frame.getByRole('button',{name:'清除條件，顯示全部'}).click();assert.equal(await frame.locator('.journal-result').count(),2);results.push('Downloaded single-file React preview: menu, navigation, search and recovery passed');
 assert.deepEqual(errors,[]);results.push('No JavaScript page errors');
 fs.writeFileSync(output+'/qa-results.json',JSON.stringify({browser:await b.version(),date:'2026-09-19',results,errors},null,2));console.log(JSON.stringify({checks:results.length,results},null,2));
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close()});
