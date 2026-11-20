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
   <p>沒有紙本護照也能玩。八題全對後，用 LINE 收藏電子活動章；想集紙本章，再帶護照到稻站兌換一枚實體活動章。線上答題、LINE 領取及現場兌換碼開放至 12/25（五）23:59（台灣時間）。</p>
   <ol className={s.quizJourney} aria-label="測驗與兌換流程"><li><strong>1</strong><span>完成 8 題<small>可續答</small></span></li><li><strong>2</strong><span>登入 LINE<small>收藏電子活動章</small></span></li><li><strong>3</strong><span>到站蓋章（可選）<small>可從第一章開始</small></span></li></ol>
   <div className={s.quizProgress} aria-label={`已完成 ${answered}／${total} 題`}><span style={{width:`${answered/total*100}%`}}/></div>
   {error&&<div className={`${s.quizFeedback} ${s.quizFeedbackError}`} role="alert"><strong>{error}</strong></div>}
   {wrong&&<div className={`${s.quizFeedback} ${s.quizFeedbackError}`} role="alert"><strong>答錯了，請再選一次。</strong><p>{wrong.explanation}</p>{wrong.sourceUrl&&<a href={wrong.sourceUrl} target="_blank" rel="noreferrer">{wrong.sourceLabel} ↗</a>}</div>}
   <div aria-live="polite">{busy&&!question&&!complete?<h3>正在建立安全測驗…</h3>:complete?<h3>全數答對，到站了！</h3>:question?<h3>第 {question.position+1}／{question.total} 題｜{question.prompt}</h3>:null}</div>
   {complete?<div className={s.quizFinish}><div className={s.quizCompletionHero}>
     <img className={s.quizShellPreview} src={sitePath('/quiz/quiz-complete-shell.webp')} width={480} height={672} decoding="async" alt="走傱日南電子活動章預覽：珍珠色卡面上的金色傱字，非兌換憑證" />
     <p>{claimed?'電子活動章已收藏。開啟 LINE 即可儲存印有你個人編號的卡片。想在紙本護照蓋一枚活動章，再開啟 LINE 查看兌換狀態。':'登入 LINE 就能收藏電子活動章，不必到場。想再集一枚紙本活動章？帶護照到稻站即可，不限已有章數。'}</p>
   </div><div className={s.quizActions}>{claimed&&<a href={`${liffUrl}?view=souvenir`}>儲存電子活動章</a>}<button type="button" disabled={busy} onClick={openLine}>{claimed?'開啟 LINE 查看兌換資格':'登入 LINE，收藏電子活動章'} ↗</button></div><a href={sitePath('/quiz/souvenir.html')}>預覽互動電子活動章</a><button className={s.quizReset} type="button" onClick={reset}>重新挑戰</button></div>:
   question?<div className={s.quizOptions} key={question.position}>{question.options.map((option,i)=><button type="button" disabled={busy} key={option} onClick={()=>void choose(i)}><span>{'ABCD'[i]}</span>{option}</button>)}</div>:error?<button className={s.quizReset} type="button" onClick={reset}>重新建立測驗</button>:null}
 </section>;
}
