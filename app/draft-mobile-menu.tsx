'use client';
import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { sitePath } from './site-path';
type Item = readonly [string, string, string];
/** Native modal supplies focus containment, Escape and inert background. */
export function DraftMobileMenu({items, active}:{items:readonly Item[];active:string}) {
 const dialog = useRef<HTMLDialogElement>(null);
 const trigger = useRef<HTMLButtonElement>(null);
 const [open,setOpen] = useState(false);
 const id = useId();
 const close = () => dialog.current?.close();
 useEffect(() => {
   if (!open) return;
   const before = document.body.style.overflow;
   document.body.style.overflow = 'hidden';
   const mq = window.matchMedia('(min-width: 1201px)');
   const resize = () => { if(mq.matches) close(); };
   mq.addEventListener('change',resize);
   return () => {document.body.style.overflow=before;mq.removeEventListener('change',resize);};
 }, [open]);
 return <div className="draft-mobile-menu">
  <button ref={trigger} className="menu-trigger" aria-haspopup="dialog" aria-controls={id} aria-expanded={open} onClick={()=>{dialog.current?.showModal();setOpen(true);}}>選單 <span aria-hidden="true">☰</span></button>
  <dialog ref={dialog} id={id} className="navigation-dialog" aria-labelledby={`${id}-title`} onKeyDown={e=>{if(e.key!=='Tab')return;const nodes=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled])'));const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}} onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target===e.currentTarget)close();}}>
   <div className="menu-surface"><div className="menu-heading"><span id={`${id}-title`}>走進日南</span><button type="button" autoFocus onClick={close} aria-label="關閉選單">關閉 <span aria-hidden="true">×</span></button></div>
   <nav aria-label="手機網站導覽"><Link href={'/'} aria-current={active==='home'?'page':undefined} onClick={close}><span>首頁</span><span aria-hidden="true">→</span></Link>{items.map(([key,label,path])=><Link key={key} href={path} aria-current={key===active?'page':undefined} onClick={close}><span>{label}</span><span aria-hidden="true">→</span></Link>)}</nav>
   <p className="menu-note">在往返之間，認識日南。</p></div>
  </dialog>
 </div>;
}
