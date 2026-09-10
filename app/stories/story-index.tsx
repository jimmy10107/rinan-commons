'use client';
import { useState } from 'react';
import { sitePath } from '../site-path';
type Story = {id:string;slug:string;category:string;title:string;summary:string;image:string;imageAlt:string;readingMinutes:number};
export function StoryIndex({articles}:{articles:Story[]}){
 const [category,setCategory]=useState('全部');const [query,setQuery]=useState('');
 const categories=['全部',...new Set(articles.map(a=>a.category))];const visible=articles.filter(a=>(category==='全部'||a.category===category)&&`${a.title} ${a.summary} ${a.category}`.includes(query.trim()));
 return <section className="editorial-section journal-index"><div className="journal-controls"><div className="filter-buttons" aria-label="筆記分類">{categories.map(c=><button key={c} type="button" onClick={()=>setCategory(c)} aria-pressed={c===category}>{c}</button>)}</div><label className="journal-search"><span>搜尋筆記</span><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="標題、關鍵字"/></label></div><p className="result-count" role="status">{visible.length} 篇筆記</p><div className="journal-results">{visible.map(a=><a key={a.id} className="journal-result" href={sitePath(`/stories/${a.slug}/`)}>{a.image?<img src={sitePath(a.image)} alt={a.imageAlt} width="640" height="420"/>:<div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br/>休息一下。</strong></div>}<div><p className="kicker">{a.category} / 約 {a.readingMinutes} 分鐘</p><h2>{a.title}</h2><p>{a.summary}</p><span className="underlined-link">閱讀筆記 ↗</span></div></a>)}</div>{!visible.length&&<div className="empty-results"><h2>還沒有符合的筆記。</h2><p>換個關鍵字，或看看所有內容。</p><button className="solid-link" onClick={()=>{setCategory('全部');setQuery('')}}>顯示全部筆記</button></div>}</section>
}
