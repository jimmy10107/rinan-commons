const $=s=>document.querySelector(s),act=$('#act'),statusEl=$('#status'),img=$('#qr');
const initial=new URL(location.href);
// Keep short-lived handoff values in this tab; fragments never reach HTTP logs or referrers.
if(/^#redeem=[0-9a-f]{48}$/.test(initial.hash))sessionStorage.setItem('scan',JSON.stringify([initial.hash.slice(8),Date.now()+90000]));
if(/^#proof=[0-9a-f]{64}$/.test(initial.hash)){sessionStorage.setItem('proof',initial.hash.slice(7));history.replaceState(null,'',location.pathname+location.search)}
let job,clock;
function action(label,fn){act.textContent=label;act.hidden=false;act.disabled=false;job=fn}
act.onclick=async()=>{act.disabled=true;try{await job()}catch(e){statusEl.textContent=e.message}finally{act.disabled=false}};
async function post(path,body){const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+liff.getIDToken()},body:JSON.stringify(body)});const b=await r.json();if(!r.ok)throw Error(b.error||'驗證失敗，請重新開啟');return b}
async function claim(present=false){
 const proof=sessionStorage.getItem('proof');const b=await post('claim',{proof,present});
 sessionStorage.removeItem('proof');const serial='RC-'+String(b.serial).padStart(6,'0');
 statusEl.textContent=serial+(b.redeemed?'｜已兌換':'｜尚未兌換');act.hidden=b.redeemed;if(b.redeemed)return;
 action('出示現場兌換碼',()=>claim(true));
 if(b.image){img.src=b.image;img.hidden=false;clearInterval(clock);const tick=()=>{const left=b.expires-Math.floor(Date.now()/1000);statusEl.textContent=serial+'｜'+(left>0?'請在 '+left+' 秒內出示':'兌換碼已過期，可以重新出示');if(left<=0){clearInterval(clock);img.hidden=true;img.removeAttribute('src')}};tick();clock=setInterval(tick,1000)}
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
 action('確認並查詢我的兌換資格',()=>claim());
}
init().catch(e=>{statusEl.textContent=e.message;act.hidden=true});
