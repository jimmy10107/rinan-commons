'use client';
import {useEffect,useRef,useState} from 'react';
import {sitePath} from './site-path';
export function MapExplorer({primary=false}:{primary?:boolean}){
 const Heading=primary?'h1':'h3';
 const [open,setOpen]=useState(true);
 const [status,setStatus]=useState<'loading'|'ready'|'slow'>('loading');
 const [attempt,setAttempt]=useState(0);
 const button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{if(status!=='loading')return;const timer=setTimeout(()=>setStatus('slow'),12000);return()=>clearTimeout(timer);},[status,attempt]);
 return <div className="map-explorer"><div className="map-explorer-intro"><div><span className="kicker">RINAN / NINE VILLAGES</span><Heading>從九里，看日南。</Heading><p>查看里界、切換底圖，或點里名定位。</p></div><div className="map-explorer-actions"><button ref={button} className="quiet-button" aria-expanded={open} aria-controls="interactive-map" onClick={()=>setOpen(!open)}>{open?'收起互動地圖':'展開互動地圖'} <span aria-hidden="true">{open?'−':'＋'}</span></button><a className="underlined-link" href={sitePath('/maps/')} target="_blank" rel="noreferrer">另開大地圖 ↗</a></div></div>
 <div id="interactive-map" hidden={!open}><div className="map-viewport" aria-busy={status==='loading'}>{status!=='ready'&&<div className="map-status" role="status"><strong>{status==='slow'?'地圖載入較久':'地圖載入中'}</strong><p>{status==='slow'?'請確認網路連線，或另開大地圖。':'正在準備九里邊界與底圖。'}</p>{status==='slow'&&<button className="quiet-button" onClick={()=>{setStatus('loading');setAttempt(n=>n+1);}}>重新載入</button>}</div>}<iframe key={attempt} className="rinan-map-frame" src={sitePath('/maps/')} title="日南九里邊界互動地圖" onLoad={()=>setStatus('ready')}/></div><div className="map-return"><p>手機可用雙指縮放，點選里名查看位置。</p><button onClick={()=>{setOpen(false);button.current?.focus();}}>收起地圖 ↑</button></div></div></div>;
}
