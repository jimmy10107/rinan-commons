'use client';
import {useState} from 'react';
import {sitePath} from '../../site-path';
import s from './exhibit.module.css';

const tra='https://eycc.ey.gov.tw/Page/9FAC64F67005E355/ff106c93-c11a-492a-afc9-84d0b8108281';
const questions=[
 ['稻站前身是守橋營房。當年駐守的人員主要守護什麼？',['火車站','海岸','舊鐵橋','農田'],2,'營房要守護的是鐵路橋梁。今天，原本管制出入的空間成了大家可以停留的日南稻站。',sitePath('/about/#place'),'讀空間故事'],
 ['在《走傱的日南人》裡，哪一位日南人是震樂堂的經紀人？',['鄭成功','鄭宜豪','鄭筱萱','鄭阿極'],2,'鄭筱萱把宮廟搖滾帶上不同舞臺。她也是紀錄片裡三位日南人之一。','#people','看人物與紀錄片'],
 ['在植物形態室放大一串稻穗，會看到穀粒怎麼排列？',['藏在一個大莢裡','沿著穗的分枝，各自掛在細梗上','一圈圈貼著莖排列','長在葉片的邊緣'],1,'順著稻穗往下看，主軸分出小枝，小枝上再垂著一粒粒稻穀。',sitePath('/plants/'),'近看水稻'],
 ['下車後回頭看，日南車站最具代表性的站房是哪一種建築？',['木造站房','紅磚拱廊站房','石砌碉堡','玻璃帷幕站房'],0,'日南木造站房於 1922 年啟用，現為臺中市市定古蹟。',tra,'查閱交通部資料'],
 ['2023 年臺中日南站與宮崎日南站締結姊妹站。這是臺鐵第幾個與日本鐵道締結的同名車站？',['第 1 個','第 3 個','第 7 個','第 5 個'],3,'兩站於 2023 年 11 月 1 日締結。這個排名只計臺鐵與日本鐵道締結的同名車站。',tra,'查閱締結公告'],
 ['從日南驛搭手押臺車向北，經山柑、社苓後，會抵達哪個終點？',['大安港','山腳','后里','清水'],1,'山腳線的路徑是日南驛、山柑、社苓、山腳；另一條五里牌線則通往頂後厝。','https://dcollection.lib.thu.edu.tw/wp-content/uploads/2024/12/02-%E9%A4%A8%E5%88%8A58%E6%9C%9F23-58%E5%91%A8%E5%BF%97%E4%BB%81-1.pdf','讀手押臺車史料（PDF）'],
 ['一起種下日南吧！哪一種不在本次六種代表植物裡？',['木麻黃','水稻','芋頭','向日葵'],3,'六種是木麻黃、水稻、芋頭、臺灣欒樹、甜根子草和構樹。這題問的是策展選種，不是日南能不能種向日葵。',sitePath('/plants/'),'看六種代表植物'],
 ['稻站書架上，一本書旁標著「11/16 種下」。這個日期記的是什麼？',['這本書加入稻站書架的日子','作者完成初稿的日子','出版社首刷的日子','讀者應還書的日子'],0,'稻站用「種下」記錄一本書何時加入書架；有些書也記下了把它帶來的人。',sitePath('/books/index.html'),'逛稻站書架'],
] as const;
export function Quiz(){
 const [answers,set]=useState<number[]>([]),answered=answers.length,complete=answered===questions.length;
 const q=questions[Math.min(answered,7)],last=questions[Math.max(0,answered-1)];
 return <section id="quiz" className={s.band} aria-labelledby="quiz-title"><h2 id="quiz-title">小測驗：你搭上車了嗎？</h2><p>從守橋營房出發，沿途認人、看稻穗，最後到書架坐坐。八題，不限時。</p>
 <div aria-live="polite">{answered>0&&<p><strong>{answers[answered-1]===last[2]?'答對了！':'上一題答案：'+last[1][last[2]]+'。'}</strong> {last[3]} <a href={last[4]} target="_blank" rel="noreferrer">{last[5]}</a></p>}
 {complete?<p>到站了！答對 {answers.filter((a,i)=>a===questions[i][2]).length}／8 題。</p>:<h3>第 {answered+1}／8 題｜{q[0]}</h3>}</div>
 {complete?<button type="button" onClick={()=>set([])}>再搭一次車</button>:<div key={answered} style={{display:'grid',gap:8,maxWidth:'38rem'}}>{q[1].map((option,i)=><button type="button" key={option} style={{textAlign:'left',padding:12,minHeight:46,border:'1px solid #87998f'}} onClick={()=>set([...answers,i])}>{'ABCD'[i]}．{option}</button>)}</div>}</section>
}
