'use client';
import { useEffect, useRef } from 'react';
import { sitePath } from './site-path';
type Item = readonly [string,string,string];
export function MobileMenu({items,active}:{items:readonly Item[];active:string}) {
  const ref=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{
    const close=(event:PointerEvent)=>{if(ref.current&&!ref.current.contains(event.target as Node)) ref.current.open=false;};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&ref.current?.open){ref.current.open=false;ref.current.querySelector('summary')?.focus();}};
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};
  },[]);
  return <details ref={ref} className="mobile-menu"><summary>選單 <span aria-hidden="true">＋</span></summary><nav aria-label="手機網站導覽"><a href={sitePath('/')} aria-current={active==='home'?'page':undefined}>首頁</a>{items.map(([id,label,path])=><a key={id} href={sitePath(path)} aria-current={active===id?'page':undefined} onClick={()=>{if(ref.current)ref.current.open=false;}}>{label}<span aria-hidden="true">↗</span></a>)}</nav></details>;
}
