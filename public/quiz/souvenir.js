async function renderBadge(){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');if(!g)throw Error('canvas');
 const gradient=g.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#244f73');gradient.addColorStop(.55,'#356b91');gradient.addColorStop(1,'#173f35');g.fillStyle=gradient;g.fillRect(0,0,c.width,c.height);
 g.globalAlpha=.14;g.fillStyle='#fff';for(let i=0;i<60;i++){const x=(i*197)%1080,y=(i*293)%1350,r=1+(i%3);g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}g.globalAlpha=1;
 g.fillStyle='#f9dc67';g.font='700 30px system-ui';g.textAlign='left';g.fillText('日 南 稻 站',76,92);g.font='600 16px system-ui';g.letterSpacing='5px';g.fillText('RINAN COMMONS',77,124);g.letterSpacing='0px';
 g.textAlign='center';g.fillStyle='#fffdf3';g.font='700 62px serif';g.fillText('日南特別居民',540,210);g.font='700 36px serif';g.fillText('電子紀念章',540,260);g.font='24px system-ui';g.fillStyle='#dce8ee';g.fillText('八題全對・在往返之間，認識日南。',540,307);
 const medal=new Image();await new Promise((resolve,reject)=>{medal.onload=resolve;medal.onerror=reject;medal.src='./rinan-resident-medal.webp'});
 g.save();g.beginPath();g.arc(540,650,322,0,Math.PI*2);g.clip();if(medal.complete&&medal.naturalWidth)g.drawImage(medal,218,328,644,644);else{g.fillStyle='#d99a2b';g.fillRect(218,328,644,644)}g.restore();
 g.beginPath();g.arc(540,650,326,0,Math.PI*2);g.strokeStyle='#f4bd45';g.lineWidth=9;g.stroke();g.beginPath();g.arc(540,650,338,0,Math.PI*2);g.strokeStyle='#fff4c6aa';g.lineWidth=2;g.stroke();
 g.save();g.translate(540,690);g.rotate(-Math.PI/7);g.globalAlpha=.2;g.fillStyle='#fff';g.font='800 23px system-ui';for(let y=-520;y<520;y+=92)for(let x=-760;x<760;x+=520)g.fillText('日南稻站・電子紀念章',x,y);g.restore();
 g.fillStyle='#102b25dd';g.fillRect(56,1030,968,244);g.strokeStyle='#eab54a';g.lineWidth=2;g.strokeRect(56,1030,968,244);
 const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),souvenir=`RC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
 g.textAlign='left';g.fillStyle='#f4bd45';g.font='700 24px system-ui';g.fillText('ALL 8 CORRECT / 全題答對',92,1086);g.fillStyle='#fffdf3';g.font='700 38px serif';g.fillText('一起看見日南的鐵路、人物、植物與書架',92,1142);g.font='22px system-ui';g.fillStyle='#dce8ee';g.fillText(`製圖日期 ${date}　紀念編號 ${souvenir}`,92,1192);g.fillStyle='#f4bd45';g.font='700 22px system-ui';g.fillText('紀念用｜非實體章兌換憑證',92,1236);
 const blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
 const url=URL.createObjectURL(blob),img=document.querySelector('#badge');
 img.src=url;await img.decode();img.hidden=false;
 document.querySelector('#message').textContent='手機可長按下方完整圖片，選「儲存到照片」或「下載圖片」。';
 const share=document.querySelector('#share');
 if(typeof File==='function'&&navigator.canShare){const files=[new File([blob],'日南特別居民_電子紀念章.png',{type:'image/png'})];if(navigator.canShare({files})){share.hidden=false;share.onclick=()=>navigator.share({files}).catch(e=>{if(e.name!=='AbortError')document.querySelector('#message').textContent='請長按圖片儲存。'})}}
}
renderBadge().catch(()=>{document.querySelector('#message').textContent='圖片未能載入，請檢查網路後重新整理。';document.querySelector('#retry').hidden=false});
