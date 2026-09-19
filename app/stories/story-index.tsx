'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {ResponsivePhoto} from '../responsive-photo';
import {sitePath} from '../site-path';
type Story={id:string;slug:string;category:string;title:string;summary:string;image:string;imageAlt:string;readingMinutes:number};
export function StoryIndex({articles}:{articles:Story[]}){
 const [category,setCategory]=useState('全部');const [query,setQuery]=useState('');
 const [initialized,setInitialized]=useState(false);const field=useRef<HTMLInputElement>(null);
 const categories=['全部',...new Set(articles.map(a=>a.category))];
 useEffect(()=>{
  const read=()=>{const p=new URLSearchParams(location.search);const c=p.get('category');setCategory(c&&articles.some(a=>a.category===c)?c:'全部');setQuery(p.get('q')||'');setInitialized(true);};
  read();window.addEventListener('popstate',read);return()=>window.removeEventListener('popstate',read);
 },[articles]);
 useEffect(()=>{if(!initialized)return;const p=new URLSearchParams(location.search);if(query)p.set('q',query);else p.delete('q');if(category!=='全部')p.set('category',category);else p.delete('category');const search=p.toString();try{history.replaceState(history.state,'',location.pathname+(search?'?'+search:'')+location.hash);}catch{/* Local-file previews may disallow history URLs; filtering remains usable. */}},[query,category,initialized]);
 const normalize=(s:string)=>s.normalize('NFKC').toLocaleLowerCase().trim();
 const visible=articles.filter(a=>(category==='全部'||a.category===category)&&normalize(`${a.title} ${a.summary} ${a.category}`).includes(normalize(query)));
 const reset=()=>{setCategory('全部');setQuery('');field.current?.focus();};
 return <section className="editorial-section journal-index"><div className="journal-controls"><div className="filter-buttons" role="group" aria-label="筆記分類">{categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)} aria-pressed={c===category}>{c}<span className="filter-count">{c==='全部'?articles.length:articles.filter(a=>a.category===c).length}</span></button>)}</div><div className="journal-search"><label htmlFor="story-search">搜尋筆記</label><div className="search-input"><input ref={field} id="story-search" type="search" value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Escape'){setQuery('');e.preventDefault();}}} placeholder="標題、關鍵字" autoComplete="off" enterKeyHint="search"/>{query&&<button type="button" onClick={()=>{setQuery('');field.current?.focus();}} aria-label="清除搜尋">×</button>}</div></div></div>
 <p className="result-count" role="status" aria-live="polite" aria-atomic="true">{visible.length} 篇筆記{category!=='全部'&&` · ${category}`}{query&&` ·「${query}」`}</p><div className="journal-results">{visible.map(a=><Link key={a.id} className="journal-result" href={`/stories/${a.slug}/`}>{a.image?<ResponsivePhoto src={a.image} alt={a.imageAlt} width={640} height={420}/>:<div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br/>休息一下。</strong></div>}<div><p className="kicker">{a.category} / 約 {a.readingMinutes} 分鐘</p><h2>{a.title}</h2><p>{a.summary}</p><span className="underlined-link">閱讀筆記 →</span></div></Link>)}</div>{!visible.length&&<div className="empty-results"><span className="kicker">換一個角度找找</span><h2>還沒有符合的筆記。</h2><p>試試「車站」或「空間」，<br/>也可以清除條件，看看全部故事。</p><button className="solid-link" onClick={reset}>清除條件，顯示全部</button></div>}</section>;
}
