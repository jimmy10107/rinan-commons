'use client';

import {useMemo, useState} from 'react';
import {sitePath} from '../../site-path';
import s from './exhibit.module.css';

const tra='https://eycc.ey.gov.tw/Page/9FAC64F67005E355/ff106c93-c11a-492a-afc9-84d0b8108281';
const questions=[
 ['稻站前身是守橋營房。當年駐守的人員主要守護什麼？',['火車站','海岸','舊鐵橋','農田'],2,'營房守護的是鐵路橋梁。今天，原本管制出入的空間成了大家可以停留的日南稻站。',sitePath('/about/#place'),'讀空間故事'],
 ['在《走傱的日南人》裡，哪一位日南人是震樂堂的經紀人？',['鄭成功','鄭宜豪','鄭筱萱','鄭阿極'],2,'鄭筱萱把宮廟搖滾帶上不同舞臺，也是紀錄片裡三位日南人之一。','#people','看人物與紀錄片'],
 ['在植物形態室放大一串稻穗，會看到穀粒怎麼排列？',['藏在一個大莢裡','沿著穗的分枝，各自掛在細梗上','一圈圈貼著莖排列','長在葉片邊緣'],1,'順著稻穗往下看，主軸分出小枝，小枝上再垂著一粒粒稻穀。',sitePath('/plants/'),'近看水稻'],
 ['日南車站最具代表性的站房是哪一種建築？',['木造站房','紅磚拱廊站房','石砌碉堡','玻璃帷幕站房'],0,'日南木造站房於 1922 年啟用，現為臺中市市定古蹟。',tra,'查閱交通部資料'],
 ['2023 年臺中日南站與宮崎日南站締結姊妹站。這是臺鐵第幾個與日本鐵道締結的同名車站？',['第 1 個','第 3 個','第 7 個','第 5 個'],3,'兩站於 2023 年 11 月 1 日締結；這個排名只計臺鐵與日本鐵道締結的同名車站。',tra,'查閱締結公告'],
 ['從日南驛搭手押臺車向北，經山柑、社苓後，會抵達哪個終點？',['大安港','山腳','后里','清水'],1,'山腳線的路徑是日南驛、山柑、社苓、山腳；另一條五里牌線則通往頂後厝。','https://dcollection.lib.thu.edu.tw/wp-content/uploads/2024/12/02-%E9%A4%A8%E5%88%8A58%E6%9C%9F23-58%E5%91%A8%E5%BF%97%E4%BB%81-1.pdf','讀手押臺車史料'],
 ['一起種下日南吧！哪一種不在本次六種代表植物裡？',['木麻黃','水稻','芋頭','向日葵'],3,'六種代表植物是木麻黃、水稻、芋頭、臺灣欒樹、甜根子草和構樹。',sitePath('/plants/'),'看六種代表植物'],
 ['稻站書架上，一本書旁標著「11/16 種下」。這個日期記的是什麼？',['加入稻站書架的日子','作者完成初稿的日子','出版社首刷的日子','讀者應還書的日子'],0,'稻站用「種下」記錄一本書何時加入書架；有些書也記下了把它帶來的人。',sitePath('/books/index.html'),'逛稻站書架'],
] as const;

function downloadBadge(score:number){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');if(!g)return;
 g.fillStyle='#f7f2e5';g.fillRect(0,0,c.width,c.height);
 g.save();g.translate(540,675);g.rotate(-Math.PI/8);g.globalAlpha=.08;g.fillStyle='#173f35';g.font='700 31px system-ui';g.textAlign='center';
 for(let y=-760;y<760;y+=95)for(let x=-900;x<900;x+=680)g.fillText('RINAN COMMONS・紀念用・非兌換憑證',x,y);g.restore();
 g.strokeStyle='#173f35';g.lineWidth=7;g.strokeRect(54,54,972,1242);
 g.textAlign='center';g.fillStyle='#173f35';g.beginPath();g.arc(540,310,145,0,Math.PI*2);g.stroke();
 g.font='700 34px system-ui';g.fillText('日 南 稻 站',540,292);g.font='600 20px system-ui';g.fillText('R I N A N   C O M M O N S',540,340);
 g.font='700 70px serif';g.fillText('日南到站紀念章',540,610);g.font='32px system-ui';g.fillText('在往返之間，認識日南。',540,690);
 g.font='700 42px system-ui';g.fillText(`完成八題・答對 ${score} 題`,540,820);
 g.font='28px system-ui';g.fillText('一起看見日南的鐵路、人物、植物與書架',540,900);
 g.fillStyle='#9a522f';g.fillRect(170,1020,740,2);g.font='700 27px system-ui';g.fillText('紀念用｜非實體章兌換憑證',540,1090);
 g.fillStyle='#173f35';g.font='22px system-ui';g.fillText(new Date().toLocaleDateString('zh-TW'),540,1160);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='日南到站紀念章_紀念用.png';a.click();
}

export function Quiz({floating=false}:{floating?:boolean}){
 const [answers,setAnswers]=useState<number[]>([]);const answered=answers.length,complete=answered===questions.length;
 const current=questions[Math.min(answered,questions.length-1)],last=questions[Math.max(0,answered-1)];
 const score=useMemo(()=>answers.filter((answer,i)=>answer===questions[i][2]).length,[answers]);
 const liffUrl=process.env.NEXT_PUBLIC_STAMP_LIFF_URL;
 const claimUrl=liffUrl?`${liffUrl}?a=${answers.join('')}`:'';
 return <section id={floating?'floating-quiz':'quiz'} className={`${s.quiz} ${floating?s.quizFloating:s.band}`} aria-label="日南八題小測驗">
   <p className={s.kicker}>RINAN QUIZ / 到站小測驗</p><h2>你搭上車了嗎？</h2>
   <p>從守橋營房出發，沿途認人、看稻穗，最後到書架坐坐。八題、不限時，也不設及格門檻。</p>
   <div className={s.quizProgress} aria-label={`已完成 ${answered}／8 題`}><span style={{width:`${answered/questions.length*100}%`}}/></div>
   <div aria-live="polite">
    {answered>0&&<div className={s.quizFeedback}><strong>{answers[answered-1]===last[2]?'答對了！':`答案是 ${last[1][last[2]]}。`}</strong><p>{last[3]}</p><a href={last[4]==='#people'?sitePath('/exhibition/to-and-from/')+'#people':last[4]} target="_blank" rel="noreferrer">{last[5]} ↗</a></div>}
    {complete?<h3>到站了！你答對 {score}／8 題。</h3>:<h3>第 {answered+1}／8 題｜{current[0]}</h3>}
   </div>
   {complete?<div className={s.quizFinish}><p>先把紀念章存進手機；圖片可分享，但不是實體章兌換憑證。</p><div className={s.quizActions}><button type="button" onClick={()=>downloadBadge(score)}>下載紀念章 PNG</button>{claimUrl?<a href={claimUrl}>使用 LINE 領取實體章資格 ↗</a>:<span>實體章兌換尚未開放</span>}</div><button className={s.quizReset} type="button" onClick={()=>setAnswers([])}>再搭一次車</button></div>:
   <div className={s.quizOptions} key={answered}>{current[1].map((option,i)=><button type="button" key={option} onClick={()=>setAnswers([...answers,i])}><span>{'ABCD'[i]}</span>{option}</button>)}</div>}
 </section>;
}
