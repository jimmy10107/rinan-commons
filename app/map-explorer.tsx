'use client';
import { useState, useRef } from 'react';
import { sitePath } from './site-path';
export function MapExplorer(){
 const [open,setOpen]=useState(true);const [ready,setReady]=useState(false);const button=useRef<HTMLButtonElement>(null);
 return <div className="map-explorer"><div className="map-explorer-intro"><div><span className="kicker">RINAN / NINE VILLAGES</span><h3>從九里，看日南。</h3><p>查看里界、切換底圖，或點里名定位。<br/>地圖預設展開，可隨時收起，繼續閱讀到訪資訊。</p></div><div className="map-explorer-actions"><button ref={button} className="solid-link" aria-expanded={open} aria-controls="interactive-map" onClick={()=>{setOpen(!open);setReady(false);}}>{open?'收起互動地圖':'在此開啟互動地圖'} <span aria-hidden="true">{open?'−':'＋'}</span></button><a className="underlined-link" href={sitePath('/maps/')} target="_blank" rel="noreferrer">另開大地圖 ↗</a></div></div><div id="interactive-map">{open&&<>{!ready&&<p role="status" className="map-loading">正在載入地圖… 若連線較慢，可另開大地圖。</p>}<iframe className="rinan-map-frame" src={sitePath('/maps/')} title="日南九里邊界互動地圖" onLoad={()=>setReady(true)} /><p className="map-return"><button onClick={()=>{setOpen(false);button.current?.focus();}}>收起地圖，繼續閱讀 ↑</button></p></>}</div></div>;
}
