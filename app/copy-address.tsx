'use client';
import {useState,useRef} from 'react';
export function CopyAddress({address}:{address:string}) {
 const [status,setStatus]=useState('');
 const fallback=useRef<HTMLTextAreaElement>(null);
 const [manual,setManual]=useState(false);
 async function copy(){
  try{if(!navigator.clipboard)throw Error('unavailable');await navigator.clipboard.writeText(address);setStatus('地址已複製');setManual(false);}
  catch{setManual(true);setStatus('請選取下方地址複製');requestAnimationFrame(()=>{fallback.current?.focus();fallback.current?.select();});}
 }
 return <div className="copy-address"><button type="button" className="quiet-button" onClick={copy}>複製地址 <span aria-hidden="true">⧉</span></button><span role="status">{status}</span>{manual&&<textarea ref={fallback} readOnly value={address} aria-label="可手動複製的地址"/>}</div>;
}
