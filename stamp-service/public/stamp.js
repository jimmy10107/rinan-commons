const $=s=>document.querySelector(s),act=$('#act'),statusEl=$('#status'),qrStatusEl=$('#qr-status'),img=$('#qr');
const initial=new URL(location.href);
// Keep short-lived handoff values in this tab; fragments never reach HTTP logs or referrers.
if(/^#redeem=[0-9a-f]{48}$/.test(initial.hash))sessionStorage.setItem('scan',JSON.stringify([initial.hash.slice(8),Date.now()+90000]));
if(/^#proof=[0-9a-f]{64}$/.test(initial.hash)){sessionStorage.setItem('proof',initial.hash.slice(7));history.replaceState(null,'',location.pathname+location.search)}
let job,clock;
function action(label,fn){act.textContent=label;act.hidden=false;act.disabled=false;job=fn}
function loginAgain(){sessionStorage.setItem('line-reauth-attempted','1');try{liff.logout()}catch{}liff.login({redirectUri:location.origin+location.pathname+location.search})}
function showError(e){statusEl.textContent=e.message;if(e.status===401)action('重新登入 LINE',loginAgain)}
function showClaim(serial,redeemed=false){
 statusEl.className='claim-card';statusEl.replaceChildren();
 const title=document.createElement('strong'),number=document.createElement('span'),note=document.createElement('span');
 title.textContent='線上特殊章已收藏';number.textContent='資格編號：'+serial;note.textContent=redeemed?'此資格已完成兌換。':'此資格會保留至活動兌換截止。';statusEl.append(title,number,note)
 const save=document.createElement('a');save.href='https://www.rinancommons.com/quiz/souvenir.html';save.className='save-badge';save.textContent='儲存電子紀念章';statusEl.append(save)
}
act.onclick=async()=>{act.disabled=true;try{await job()}catch(e){showError(e)}finally{act.disabled=false}};
async function post(path,body){
 const token=liff.getIDToken();
 if(!token){const e=Error('LINE 登入已逾時，請重新登入。');e.status=401;throw e}
 const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify(body)});const b=await r.json();
 if(!r.ok){const e=Error(b.error||'驗證失敗，請重新開啟');e.status=r.status;throw e}return b
}
async function claim(present=false){
 const proof=sessionStorage.getItem('proof');const b=await post('claim',{proof,present});
 sessionStorage.removeItem('proof');const serial='RC-'+String(b.serial).padStart(6,'0');
 showClaim(serial,!!b.redeemed);act.hidden=b.redeemed;if(b.redeemed)return;
 action('我已帶紙本 14 章｜產生 90 秒現場兌換碼',()=>claim(true));
 if(b.image){img.src=b.image;img.hidden=false;clearInterval(clock);const tick=()=>{const left=b.expires-Math.floor(Date.now()/1000);qrStatusEl.textContent=left>0?'現場兌換碼剩餘 '+left+' 秒':'兌換碼已過期，可重新產生。';if(left<=0){clearInterval(clock);img.hidden=true;img.removeAttribute('src')}};tick();clock=setInterval(tick,1000)}
}
async function init(){
 const cfg=await(await fetch('/config')).json();if(!cfg.liff||!cfg.notice)throw Error('兌換尚未開放。');$('#notice').textContent=cfg.notice;
 await liff.init({liffId:cfg.liff});
 if(!liff.isLoggedIn()){action('使用 LINE 登入',()=>liff.login({redirectUri:location.origin+location.pathname+location.search}));return}
 const scan=JSON.parse(sessionStorage.getItem('scan')||'null');
 if(scan){if(scan[1]<Date.now()){sessionStorage.removeItem('scan');throw Error('兌換碼逾時，請重新掃描。')}
 statusEl.textContent='請先確認旅客在場，再按下核銷。';
 action('工作人員：確認核銷',async()=>{const b=await post('redeem',{token:scan[0]});sessionStorage.removeItem('scan');statusEl.textContent='核銷成功，可以發章。流水號 RC-'+String(b.serial).padStart(6,'0');act.hidden=true});return}
 if(initial.searchParams.has('staff')){action('顯示我的工作人員申請代碼',async()=>{statusEl.textContent=(await post('staff-key',{})).key;act.hidden=true});return}
 statusEl.textContent='正在登入 LINE 並領取電子紀念章…';act.hidden=true;
 try{await claim();sessionStorage.removeItem('line-reauth-attempted')}
 catch(e){
  if(e.status===401&&!sessionStorage.getItem('line-reauth-attempted')){loginAgain();return}
  showError(e)
 }
}
init().catch(e=>{statusEl.textContent=e.message;act.hidden=true});
