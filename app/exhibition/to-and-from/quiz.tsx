'use client';

import {useState} from 'react';
import {sitePath} from '../../site-path';
import s from './exhibit.module.css';

const stationHeritage='https://www.tchac.taichung.gov.tw/building?pid=22&uid=33';
const sisterStationNews='https://www.cna.com.tw/news/ahel/202311010163.aspx';
const questions=[
 ['稻站前身是守橋營房。當年駐守的人員主要守護什麼？',['火車站','海岸','舊鐵橋','農田'],2,'營房守護的是鐵路橋梁。今天，原本管制出入的空間成了大家可以停留的日南稻站。',sitePath('/about/#place'),'讀空間故事'],
 ['在《走傱的日南人》裡，哪一位日南人是震樂堂的經紀人？',['鄭成功','鄭宜豪','鄭筱萱','鄭阿極'],2,'鄭筱萱把宮廟搖滾帶上不同舞臺，也是紀錄片裡三位日南人之一。','#people','看人物與紀錄片'],
 ['在植物形態室放大一串稻穗，會看到穀粒怎麼排列？',['藏在一個大莢裡','沿著穗的分枝，各自掛在細梗上','一圈圈貼著莖排列','長在葉片邊緣'],1,'順著稻穗往下看，主軸分出小枝，小枝上再垂著一粒粒稻穀。',sitePath('/plants/'),'近看水稻'],
 ['日南車站最具代表性的站房是哪一種建築？',['木造站房','紅磚拱廊站房','石砌碉堡','玻璃帷幕站房'],0,'日南車站是海線標準形木造站房，現為臺中市市定古蹟。',stationHeritage,'查閱臺中市文化資產處資料'],
 ['2023 年臺中日南站與宮崎日南站締結姊妹站。這是臺鐵第幾個與日本鐵道締結的同名車站？',['第 1 個','第 3 個','第 7 個','第 5 個'],3,'兩站於 2023 年 11 月 1 日締結；這是臺鐵第 5 個與日本鐵道締結的同名車站。',sisterStationNews,'閱讀中央社締結報導'],
 ['從日南驛搭手押臺車向北，經山柑、社苓後，會抵達哪個終點？',['大安港','山腳','后里','清水'],1,'山腳線的路徑是日南驛、山柑、社苓、山腳；另一條五里牌線則通往頂後厝。','https://dcollection.lib.thu.edu.tw/wp-content/uploads/2024/12/02-%E9%A4%A8%E5%88%8A58%E6%9C%9F23-58%E5%91%A8%E5%BF%97%E4%BB%81-1.pdf','讀手押臺車史料'],
 ['一起種下日南吧！哪一種不在本次六種代表植物裡？',['木麻黃','水稻','芋頭','向日葵'],3,'六種代表植物是木麻黃、水稻、芋頭、臺灣欒樹、甜根子草和構樹。',sitePath('/plants/'),'看六種代表植物'],
 ['稻站書架上，一本書旁標著「11/16 種下」。這個日期記的是什麼？',['加入稻站書架的日子','作者完成初稿的日子','出版社首刷的日子','讀者應還書的日子'],0,'稻站用「種下」記錄一本書何時加入書架；有些書也記下了把它帶來的人。',sitePath('/books/index.html'),'逛稻站書架'],
] as const;

async function downloadBadge(){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');if(!g)return;
 const gradient=g.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#244f73');gradient.addColorStop(.55,'#356b91');gradient.addColorStop(1,'#173f35');g.fillStyle=gradient;g.fillRect(0,0,c.width,c.height);
 g.globalAlpha=.14;g.fillStyle='#fff';for(let i=0;i<60;i++){const x=(i*197)%1080,y=(i*293)%1350,r=1+(i%3);g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}g.globalAlpha=1;
 g.fillStyle='#f9dc67';g.font='700 30px system-ui';g.textAlign='left';g.fillText('日 南 稻 站',76,92);g.font='600 16px system-ui';g.letterSpacing='5px';g.fillText('RINAN COMMONS',77,124);g.letterSpacing='0px';
 g.textAlign='center';g.fillStyle='#fffdf3';g.font='700 62px serif';g.fillText('日南特別居民',540,210);g.font='700 36px serif';g.fillText('電子紀念章',540,260);g.font='24px system-ui';g.fillStyle='#dce8ee';g.fillText('八題全對・在往返之間，認識日南。',540,307);
 const medal=new Image();medal.src=sitePath('/quiz/rinan-resident-medal.webp');await new Promise<void>((resolve)=>{medal.onload=()=>resolve();medal.onerror=()=>resolve()});
 g.save();g.beginPath();g.arc(540,650,322,0,Math.PI*2);g.clip();if(medal.complete&&medal.naturalWidth)g.drawImage(medal,218,328,644,644);else{g.fillStyle='#d99a2b';g.fillRect(218,328,644,644)}g.restore();
 g.beginPath();g.arc(540,650,326,0,Math.PI*2);g.strokeStyle='#f4bd45';g.lineWidth=9;g.stroke();g.beginPath();g.arc(540,650,338,0,Math.PI*2);g.strokeStyle='#fff4c6aa';g.lineWidth=2;g.stroke();
 g.save();g.translate(540,690);g.rotate(-Math.PI/7);g.globalAlpha=.2;g.fillStyle='#fff';g.font='800 23px system-ui';for(let y=-520;y<520;y+=92)for(let x=-760;x<760;x+=520)g.fillText('日南稻站・電子紀念章',x,y);g.restore();
 g.fillStyle='#102b25dd';g.fillRect(56,1030,968,244);g.strokeStyle='#eab54a';g.lineWidth=2;g.strokeRect(56,1030,968,244);
 const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 const souvenir=`RC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
 g.textAlign='left';g.fillStyle='#f4bd45';g.font='700 24px system-ui';g.fillText('ALL 8 CORRECT / 全題答對',92,1086);g.fillStyle='#fffdf3';g.font='700 38px serif';g.fillText('一起看見日南的鐵路、人物、植物與書架',92,1142);g.font='22px system-ui';g.fillStyle='#dce8ee';g.fillText(`完成日期 ${date}　紀念編號 ${souvenir}`,92,1192);g.fillStyle='#f4bd45';g.font='700 22px system-ui';g.fillText('紀念用｜非實體章兌換憑證',92,1236);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='日南特別居民_電子紀念章.png';a.click();
}

export function Quiz({floating=false}:{floating?:boolean}){
 const [answers,setAnswers]=useState<number[]>([]);const [wrong,setWrong]=useState<number|null>(null);const answered=answers.length,complete=answered===questions.length;
 const current=questions[Math.min(answered,questions.length-1)];
 // The LIFF URL is public configuration, not a secret. Keep a production fallback so
 // every deployment target (GitHub Pages and the custom-domain build) uses one LIFF.
 const liffUrl=process.env.NEXT_PUBLIC_STAMP_LIFF_URL||'https://liff.line.me/2011673526-BOtR0nd7';
 const claimUrl=liffUrl?`${liffUrl}?a=${answers.join('')}`:'';
 const choose=(option:number)=>{if(option!==current[2]){setWrong(option);return}setWrong(null);setAnswers([...answers,option])};
 const reset=()=>{setAnswers([]);setWrong(null)};
 return <section id={floating?'floating-quiz':'quiz'} className={`${s.quiz} ${floating?s.quizFloating:s.band}`} aria-label="日南八題小測驗">
   <p className={s.kicker}>RINAN QUIZ / 到站小測驗</p><h2>你搭上車了嗎？</h2>
   <p>從守橋營房出發，沿途認人、看稻穗，最後到書架坐坐。八題全部答對，才會取得電子紀念章與實體章兌換資格。</p>
   <ol className={s.quizJourney} aria-label="測驗與兌換流程">
    <li><strong>1</strong><span>完成 8 題<small>不用登入</small></span></li>
    <li><strong>2</strong><span>下載紀念章<small>可存入手機</small></span></li>
    <li><strong>3</strong><span>選擇 LINE 兌換<small>每個帳號一次</small></span></li>
   </ol>
   <div className={s.quizProgress} aria-label={`已完成 ${answered}／8 題`}><span style={{width:`${answered/questions.length*100}%`}}/></div>
   <div aria-live="polite">
    {wrong!==null&&<div className={`${s.quizFeedback} ${s.quizFeedbackError}`} role="alert"><strong>答錯了，請再選一次。</strong><p>{current[3]}</p><a href={current[4]==='#people'?sitePath('/exhibition/to-and-from/')+'#people':current[4]} target="_blank" rel="noreferrer">{current[5]} ↗</a></div>}
    {complete?<h3>全數答對，到站了！</h3>:<h3>第 {answered+1}／8 題｜{current[0]}</h3>}
   </div>
   {complete?<div className={s.quizFinish}><img className={s.quizBadgePreview} src={sitePath('/quiz/rinan-resident-medal.webp')} alt="日南特別居民電子紀念章徽章圖樣"/><p>八題全對！先把有專屬浮水印的電子紀念章存進手機；圖片可分享，但不是實體章兌換憑證。</p><div className={s.quizActions}><button type="button" onClick={downloadBadge}>下載電子紀念章 PNG</button>{claimUrl?<a href={claimUrl}>使用 LINE 領取實體章資格 ↗</a>:<span>實體章兌換尚未開放</span>}</div><button className={s.quizReset} type="button" onClick={reset}>再搭一次車</button></div>:
   <div className={s.quizOptions} key={answered}>{current[1].map((option,i)=><button type="button" key={option} aria-invalid={wrong===i||undefined} onClick={()=>choose(i)}><span>{'ABCD'[i]}</span>{option}</button>)}</div>}
 </section>;
}
