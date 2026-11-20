'use client';

import {useCallback, useEffect, useState} from 'react';
import {sitePath} from '../../site-path';
import s from './exhibit.module.css';

const quizApi=process.env.NEXT_PUBLIC_STAMP_API_URL||'https://rinan-quiz-stamp.jimmy10107-tw.workers.dev';
const liffUrl=process.env.NEXT_PUBLIC_STAMP_LIFF_URL||'https://liff.line.me/2011673526-BOtR0nd7';
const storageKey='rinan-quiz-challenge-v2';
type Question={position:number,total:number,prompt:string,options:string[]};
type QuizReply=Partial<Question>&{challenge?:string;expires?:number;correct?:boolean;complete?:boolean;claimed?:boolean;proof?:string;proofExpires?:number;explanation?:string;sourceUrl?:string;sourceLabel?:string;error?:string};
class ApiError extends Error{status:number;constructor(message:string,status:number){super(message);this.status=status}}
async function post(path:string,body:Record<string,unknown>){const response=await fetch(`${quizApi}/api/quiz/${path}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),cache:'no-store'});const data=await response.json() as QuizReply;if(!response.ok)throw new ApiError(data.error||'連線失敗，請稍後再試',response.status);return data}
const asQuestion=(data:QuizReply):Question=>({position:data.position||0,total:data.total||8,prompt:data.prompt||'',options:data.options||[]});

async function downloadBadge(){
 const c=document.createElement('canvas');c.width=1080;c.height=1350;const g=c.getContext('2d');if(!g)return;
 const gradient=g.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,'#244f73');gradient.addColorStop(.55,'#356b91');gradient.addColorStop(1,'#173f35');g.fillStyle=gradient;g.fillRect(0,0,c.width,c.height);
 g.globalAlpha=.14;g.fillStyle='#fff';for(let i=0;i<60;i++){const x=(i*197)%1080,y=(i*293)%1350,r=1+(i%3);g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()}g.globalAlpha=1;
 g.fillStyle='#f9dc67';g.font='700 30px system-ui';g.textAlign='left';g.fillText('日 南 稻 站',76,92);g.font='600 16px system-ui';g.letterSpacing='5px';g.fillText('RINAN COMMONS',77,124);g.letterSpacing='0px';
 g.textAlign='center';g.fillStyle='#fffdf3';g.font='700 62px serif';g.fillText('日南特別居民',540,210);g.font='700 36px serif';g.fillText('電子紀念章',540,260);g.font='24px system-ui';g.fillStyle='#dce8ee';g.fillText('八題全對・在往返之間，認識日南。',540,307);
 const medal=new Image();medal.src=sitePath('/quiz/rinan-resident-medal.webp');await new Promise<void>(resolve=>{medal.onload=()=>resolve();medal.onerror=()=>resolve()});
 g.save();g.beginPath();g.arc(540,650,322,0,Math.PI*2);g.clip();if(medal.complete&&medal.naturalWidth)g.drawImage(medal,218,328,644,644);else{g.fillStyle='#d99a2b';g.fillRect(218,328,644,644)}g.restore();
 g.beginPath();g.arc(540,650,326,0,Math.PI*2);g.strokeStyle='#f4bd45';g.lineWidth=9;g.stroke();g.beginPath();g.arc(540,650,338,0,Math.PI*2);g.strokeStyle='#fff4c6aa';g.lineWidth=2;g.stroke();
 g.save();g.translate(540,690);g.rotate(-Math.PI/7);g.globalAlpha=.2;g.fillStyle='#fff';g.font='800 23px system-ui';for(let y=-520;y<520;y+=92)for(let x=-760;x<760;x+=520)g.fillText('日南稻站・電子紀念章',x,y);g.restore();
 g.fillStyle='#102b25dd';g.fillRect(56,1030,968,244);g.strokeStyle='#eab54a';g.lineWidth=2;g.strokeRect(56,1030,968,244);
 const date=new Intl.DateTimeFormat('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),souvenir=`RC-${Date.now().toString(36).toUpperCase().slice(-6)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
 g.textAlign='left';g.fillStyle='#f4bd45';g.font='700 24px system-ui';g.fillText('ALL 8 CORRECT / 全題答對',92,1086);g.fillStyle='#fffdf3';g.font='700 38px serif';g.fillText('一起看見日南的鐵路、人物、植物與書架',92,1142);g.font='22px system-ui';g.fillStyle='#dce8ee';g.fillText(`完成日期 ${date}　紀念編號 ${souvenir}`,92,1192);g.fillStyle='#f4bd45';g.font='700 22px system-ui';g.fillText('紀念用｜非實體章兌換憑證',92,1236);
 const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='日南特別居民_電子紀念章.png';a.click();
}

export function Quiz({floating=false}:{floating?:boolean}){
 const [challenge,setChallenge]=useState(''),[question,setQuestion]=useState<Question|null>(null),[complete,setComplete]=useState(false),[claimed,setClaimed]=useState(false),[wrong,setWrong]=useState<QuizReply|null>(null),[busy,setBusy]=useState(true),[error,setError]=useState('');
 const startNew=useCallback(async()=>{setBusy(true);setError('');setWrong(null);setQuestion(null);setComplete(false);setClaimed(false);try{const data=await post('start',{});if(!data.challenge)throw new Error('無法建立測驗');localStorage.setItem(storageKey,data.challenge);setChallenge(data.challenge);setQuestion(asQuestion(data))}catch(e){setError(e instanceof Error?e.message:'無法開始測驗')}finally{setBusy(false)}},[]);
 useEffect(()=>{let active=true;(async()=>{const saved=localStorage.getItem(storageKey);if(!saved){await startNew();return}try{const data=await post('status',{challenge:saved});if(!active)return;setChallenge(saved);if(data.complete){setComplete(true);setClaimed(!!data.claimed);setQuestion(null)}else setQuestion(asQuestion(data))}catch(e){if(e instanceof ApiError&&[400,410].includes(e.status)){localStorage.removeItem(storageKey);if(active)await startNew()}else if(active)setError(e instanceof Error?e.message:'無法恢復測驗')}finally{if(active)setBusy(false)}})();return()=>{active=false}},[startNew]);
 const choose=async(option:number)=>{if(!question||busy)return;setBusy(true);setError('');try{const data=await post('answer',{challenge,option,step:question.position});if(!data.correct){setWrong(data);return}setWrong(null);if(data.complete){setComplete(true);setClaimed(false);setQuestion(null)}else setQuestion(asQuestion(data))}catch(e){setError(e instanceof Error?e.message:'答案送出失敗')}finally{setBusy(false)}};
 const openLine=async()=>{if(busy)return;setBusy(true);setError('');try{if(claimed){location.assign(liffUrl);return}const data=await post('status',{challenge});if(data.claimed){setClaimed(true);location.assign(liffUrl);return}if(!data.proof)throw new Error('尚未取得完成證明');location.assign(`${liffUrl}#proof=${data.proof}`)}catch(e){setError(e instanceof Error?e.message:'無法開啟 LINE 驗證')}finally{setBusy(false)}};
 const reset=()=>{localStorage.removeItem(storageKey);void startNew()};
 const answered=complete?8:(question?.position||0),total=question?.total||8;
 return <section id={floating?'floating-quiz':'quiz'} className={`${s.quiz} ${floating?s.quizFloating:s.band}`} aria-label="日南八題小測驗">
   <p className={s.kicker}>RINAN QUIZ / 到站小測驗</p><h2>你搭上車了嗎？</h2>
   <p>每題由伺服器即時驗證。進度會保留到兌換截止；八題全部答對後，仍可稍後回來完成 LINE 驗證。</p>
   <ol className={s.quizJourney} aria-label="測驗與兌換流程"><li><strong>1</strong><span>完成 8 題<small>可續答</small></span></li><li><strong>2</strong><span>登入 LINE<small>收藏電子紀念章</small></span></li><li><strong>3</strong><span>取得資格<small>可抵一枚活動章</small></span></li></ol>
   <div className={s.quizProgress} aria-label={`已完成 ${answered}／${total} 題`}><span style={{width:`${answered/total*100}%`}}/></div>
   {error&&<div className={`${s.quizFeedback} ${s.quizFeedbackError}`} role="alert"><strong>{error}</strong></div>}
   {wrong&&<div className={`${s.quizFeedback} ${s.quizFeedbackError}`} role="alert"><strong>答錯了，請再選一次。</strong><p>{wrong.explanation}</p>{wrong.sourceUrl&&<a href={wrong.sourceUrl} target="_blank" rel="noreferrer">{wrong.sourceLabel} ↗</a>}</div>}
   <div aria-live="polite">{busy&&!question&&!complete?<h3>正在建立安全測驗…</h3>:complete?<h3>全數答對，到站了！</h3>:question?<h3>第 {question.position+1}／{question.total} 題｜{question.prompt}</h3>:null}</div>
   {complete?<div className={s.quizFinish}><img className={s.quizBadgePreview} src={sitePath('/quiz/rinan-resident-medal.webp')} alt="日南特別居民電子紀念章徽章圖樣"/><p>{claimed?'電子紀念章已綁定 LINE，並已取得一枚實體活動章兌換資格。':'完成資格已安全保留到活動截止。登入 LINE 後，即可收藏電子紀念章，並取得一枚實體活動章兌換資格。'}</p><div className={s.quizActions}>{claimed&&<button type="button" onClick={downloadBadge}>下載電子紀念章 PNG</button>}<button type="button" disabled={busy} onClick={openLine}>{claimed?'開啟 LINE 查看電子紀念章與資格':'登入 LINE，領取電子紀念章並取得一枚實體活動章資格'} ↗</button></div><button className={s.quizReset} type="button" onClick={reset}>重新挑戰</button></div>:
   question?<div className={s.quizOptions} key={question.position}>{question.options.map((option,i)=><button type="button" disabled={busy} key={option} onClick={()=>void choose(i)}><span>{'ABCD'[i]}</span>{option}</button>)}</div>:error?<button className={s.quizReset} type="button" onClick={reset}>重新建立測驗</button>:null}
 </section>;
}
