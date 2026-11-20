// The LINE collection calls this with the serial returned by the authenticated claim API.
// Do not read a serial from the URL, browser storage or a random number generator.
export async function renderSouvenir(container, serial, artwork, now = new Date()) {
  if (!/^RC-\d{6,}$/.test(serial)) throw new Error('尚未取得個人紀念編號，請重新開啟 LINE 收藏頁。');
  const art = new Image();
  await new Promise((resolve, reject) => { art.onload=resolve; art.onerror=reject; art.src=artwork; });
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1430;
  const g=canvas.getContext('2d');
  if(!g) throw new Error('無法製作圖片');
  g.fillStyle='#14231f'; g.fillRect(0,0,960,1430);g.drawImage(art,0,0,960,1220);
  // Two unobtrusive signed-by-design marks straddle the pearl field and the emblem.
  g.save();g.translate(480,645);g.rotate(-Math.PI/11);g.textAlign='center';
  g.font='600 21px system-ui,sans-serif';g.lineWidth=1;
  for(const y of [-131,143]){
    const mark='日南稻站  ·  RINAN COMMONS  /  '+serial;
    g.strokeStyle='rgba(255,255,255,.38)';g.strokeText(mark,0,y);
    g.fillStyle='rgba(29,54,45,.23)';g.fillText(mark,0,y);
  }
  g.restore();
  const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  g.font='25px system-ui,sans-serif';g.fillStyle='#dad8b4';g.fillText('紀念編號',65,1240);g.fillText('製圖日期',550,1240);
  g.font='600 49px sans-serif';g.fillStyle='#fff8e7';g.fillText(serial,64,1309,450);g.fillText(date,548,1309,353);
  g.strokeStyle='#668078';g.beginPath();g.moveTo(64,1340);g.lineTo(896,1340);g.stroke();
  g.font='26px system-ui,sans-serif';g.fillStyle='#d9e5dc';g.fillText('紀念用｜非實體章兌換憑證',65,1392);
  const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('PNG')),'image/png'));
  const img=new Image();img.alt='日南稻站走傱日南紀念章，八題全對，紀念編號 '+serial;
  img.style.cssText='width:100%;height:auto;display:block;-webkit-touch-callout:default';img.src=URL.createObjectURL(blob);
  await img.decode();
  const tip=document.createElement('p');tip.textContent='長按卡片可儲存到手機相簿。';container.replaceChildren(tip,img);
  if(typeof File==='function'&&navigator.canShare){
    const files=[new File([blob], '日南稻站走傱日南紀念章_'+serial+'.png',{type:'image/png'})];
    if(navigator.canShare({files})){const share=document.createElement('button');share.type='button';share.textContent='分享或儲存圖片';
      share.onclick=()=>navigator.share({files}).catch(e=>{if(e.name!=='AbortError')tip.textContent='請長按卡片儲存圖片。'});container.append(share);}
  }
}
