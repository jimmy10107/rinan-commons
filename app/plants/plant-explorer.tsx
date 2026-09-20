'use client';
import {useEffect,useRef,useState} from 'react';
import assets from './assets.json';
import {sitePath} from '../site-path';
import {allowBackgroundModels} from './model-cache';
import type {PlantViewer} from './renderer';

type State='idle'|'loading'|'ready'|'error'|'refining'|'refine-error';
const places:Record<string,string>={casuarina:'海風裡的枝梢',rice:'田間的稻穗',taro:'舒展的盾形葉',koelreuteria:'換季的樹色',saccharum:'河床的銀白穗',broussonetia:'路旁的葉與果'};
const focus:Record<string,string>={casuarina:'細看綠色小枝的節段，再找找木質果序上的裂口。',rice:'沿著分枝往下看，穀粒各自掛在細梗上。',taro:'從葉面中央往外看，細脈順著彎曲的葉面展開。',koelreuteria:'近看三瓣蒴果的紙質表面，再回到複葉的排列。',saccharum:'靠近銀白花序，看看分枝間細細的長毛。',broussonetia:'比較葉面的粗糙感，以及熟果上密集的橙紅突起。'};
const urls:Record<string,{title:string,url:string}>={casuarina:{title:'NParks｜Casuarina equisetifolia',url:'https://www.nparks.gov.sg/florafaunaweb/flora/2/7/2793'},rice:{title:'Julius Kühn-Institut｜BBCH 生育期圖譜',url:'https://www.julius-kuehn.de/media/Veroeffentlichungen/bbch%20epaper%20en/page.pdf'},taro:{title:'NC State Extension｜Colocasia esculenta',url:'https://plants.ces.ncsu.edu/plants/colocasia-esculenta/'},koelreuteria:{title:'中央研究院｜數位典藏植物資料',url:'https://digiarch.sinica.edu.tw/content/subject/resource_content.jsp?id=442'},saccharum:{title:'中國植物志｜甜根子草',url:'https://db.kib.ac.cn/CNFlora/SearchResult.aspx?cpni=CPNI-233-12069'},broussonetia:{title:'NC State Extension｜Broussonetia papyrifera',url:'https://plants.ces.ncsu.edu/plants/broussonetia-papyrifera/'}};
const assetURL=(file:string)=>sitePath('/plants/'+file);
const mb=(bytes:number)=>(bytes/1048576).toFixed(1)+' MB';
export default function PlantExplorer(){
 const [index,setIndex]=useState(2),[stage,setStage]=useState(4),[mode,setMode]=useState<'macro'|'whole'>('whole'),[quality,setQuality]=useState<'auto'|'lite'|'balanced'|'detail'>('auto');
 const [active,setActive]=useState(true),[status,setStatus]=useState<State>('loading'),[rotating,setRotating]=useState(false),[backlit,setBacklit]=useState(false),[wire,setWire]=useState(false),[dark,setDark]=useState(false),[references,setReferences]=useState(false),[snapshotting,setSnapshotting]=useState(false),[mounted,setMounted]=useState(0),[zoomed,setZoomed]=useState(false),[shown,setShown]=useState('');
 const [playing,setPlaying]=useState(true),[frame,setFrame]=useState(0),[elapsed,setElapsed]=useState(0),[replay,setReplay]=useState(0),[warmed,setWarmed]=useState<string[]>([]);
 const host=useRef<HTMLDivElement>(null),viewer=useRef<PlantViewer|null>(null),keyRef=useRef(''),selectionRef=useRef({mode,quality});selectionRef.current={mode,quality};
 const plant=assets[index],base=mode==='macro'?plant.organ:plant.stages[stage];
 const asset=quality==='lite'||quality==='auto'&&!zoomed?base.lite:mode==='macro'&&(quality==='detail'||quality==='auto'&&zoomed)?plant.detail:base;
 const key=plant.id+':'+mode+':'+stage;
 const frameURL=(n:number)=>assetURL(`frames/${plant.id}_${String(n+1).padStart(2,'0')}.svg`);
 const poster=mode==='macro'?assetURL(`previews/${plant.id}-960.webp`):frameURL(stage);
 const onStage=playing?frame:stage;
 const downloadAsset=playing?plant.stages[frame].lite:asset;
 useEffect(()=>{
  const params=new URLSearchParams(location.search),i=assets.findIndex(p=>p.id===params.get('plant'));if(i>=0){setIndex(i);setDark(i===4);}
  const s=Number(params.get('stage'));if(params.has('stage')&&Number.isInteger(s)&&s>=1&&s<=5){setStage(s-1);setPlaying(false);}
  if(params.get('mode')==='macro'){setMode('macro');setPlaying(false);}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)setPlaying(false);
 },[]);
 useEffect(()=>{
  if(!active)return;let stopped=false;setStatus('loading');
  import('./renderer').then(({createPlantViewer})=>{if(stopped||!host.current)return;const instance=createPlantViewer(host.current,state=>{if(!stopped)setStatus(state);},ratio=>{if(selectionRef.current.quality==='auto'&&ratio>1.45&&allowBackgroundModels())setZoomed(true);});viewer.current=instance;keyRef.current='';setMounted(n=>n+1);}).catch(()=>{if(!stopped)setStatus('error');});
  return ()=>{stopped=true;viewer.current?.destroy();viewer.current=null;};
 },[active]);
 // The film is independent of the 3D selection; it never triggers five render loads.
 useEffect(()=>{
  if(!playing)return;let last=performance.now(),time=0,raf=0;
  function tick(now:number){const delta=Math.max(0,now-last);last=now;if(!document.hidden){time+=delta;setElapsed(Math.min(time/6500,1));setFrame(Math.max(0,Math.min(4,Math.floor(time/1300))));}if(time<6500)raf=requestAnimationFrame(tick);else setPlaying(false);}
  const visibility=()=>{last=performance.now();};document.addEventListener('visibilitychange',visibility);raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);document.removeEventListener('visibilitychange',visibility);};
 },[index,playing,replay]);
 useEffect(()=>{
  // Decode only this plant's five small vector frames ahead of playback.
  for(let n=0;n<5;n++){const image=new Image();image.src=frameURL(n);void image.decode().catch(()=>{});}
 },[index]);
 useEffect(()=>{
  const instance=viewer.current;if(!active||!instance)return;let cancelled=false;
  const target=quality==='auto'&&!allowBackgroundModels()?base.lite:asset;
  const same=keyRef.current===key;keyRef.current=key;
  void instance.load(assetURL(target.file),same).then(ok=>{if(!cancelled&&ok){setShown(target.file);if(target.file.endsWith('-lite.glb'))setWarmed(plant.stages.filter(s=>instance.isPrepared(assetURL(s.lite.file))).map(s=>s.lite.file));}});
  return()=>{cancelled=true;};
 },[key,quality,zoomed,mounted,active]);
 useEffect(()=>{
  const instance=viewer.current;if(!active||!instance)return;let cancelled=false;
  const urls=[...plant.stages.map(s=>assetURL(s.lite.file)),assetURL(plant.organ.lite.file),assetURL(plant.organ.file),assetURL(plant.detail.file),...plant.stages.map(s=>assetURL(s.file))];instance.retain(urls);
  const queue=[...plant.stages].sort((a,b)=>a.lite.bytes-b.lite.bytes);let cursor=0;
  async function worker(){while(!cancelled&&cursor<queue.length){const a=queue[cursor++];if(!allowBackgroundModels())return;const ok=await instance!.warm(assetURL(a.lite.file));if(cancelled)return;if(ok)setWarmed(plant.stages.filter(s=>instance!.isPrepared(assetURL(s.lite.file))).map(s=>s.lite.file));}}
  void worker();void worker();return()=>{cancelled=true;};
 },[index,mounted,active]);
 useEffect(()=>{viewer.current?.rotate(rotating);},[rotating,status]);
 useEffect(()=>{viewer.current?.backlight(backlit);},[backlit,status]);
 useEffect(()=>{viewer.current?.wireframe(wire);},[wire,status]);
 useEffect(()=>{viewer.current?.background(dark);},[dark,status]);
 function select(i:number){setIndex(i);setWarmed([]);setFrame(0);setElapsed(0);setReplay(n=>n+1);setPlaying(!matchMedia('(prefers-reduced-motion: reduce)').matches);setDark(i===4);setMode('whole');setStage(4);setZoomed(false);setShown('');setRotating(false);setBacklit(false);setReferences(false);setQuality('auto');const u=new URL(location.href);u.searchParams.set('plant',assets[i].id);u.searchParams.delete('stage');u.searchParams.delete('mode');history.replaceState(null,'',u);}
 function selectStage(s:number){setPlaying(false);setQuality('auto');setStage(s);setMode('whole');setZoomed(false);setShown('');setRotating(false);const u=new URL(location.href);u.searchParams.set('plant',plant.id);u.searchParams.set('stage',String(s+1));u.searchParams.delete('mode');history.replaceState(null,'',u);}
 function stop(){setPlaying(false);setActive(false);setStatus('idle');setRotating(false);setBacklit(false);}
 function retry(){stop();requestAnimationFrame(()=>setActive(true));}
 async function snapshot(){if(!viewer.current)return;setSnapshotting(true);try{const blob=await viewer.current.snapshot();if(blob){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=plant.id+'-3D.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);}}finally{setSnapshotting(false);}}
 const modelReady=active&&['ready','refining','refine-error'].includes(status);
 const ready=modelReady&&!playing;
 const warmCount=plant.stages.filter(s=>warmed.includes(s.lite.file)).length;
 return <section data-intro={playing} data-warmed={warmCount} className="plant-observatory" aria-label="植物模型探索">
  <div className="plant-picker" aria-label="選擇植物">{assets.map((p,i)=><button key={p.id} className={i===index?'selected':''} aria-pressed={i===index} onClick={()=>select(i)}><span className="plant-picker-number">0{i+1}</span><span>{p.name}</span><small>{p.latin}</small><em>{places[p.id]}</em></button>)}</div>
  <div className="plant-workbench">
   <div className="plant-visual-column">
    <div className="plant-scene" data-state={status} data-dark={dark}>
     <div ref={host} className="plant-canvas-host" style={{visibility:playing?'hidden':undefined}} hidden={!active||status==='error'}/>
     {!ready&&!playing&&<img className="plant-poster" src={poster} srcSet={mode==='macro'?`${assetURL(`previews/${plant.id}-480.webp`)} 480w, ${poster} 960w`:undefined} sizes="(max-width:760px) 100vw, 65vw" alt={`${plant.name}｜${mode==='macro'?'器官特寫':plant.stages[stage].label}的三維模型渲染預覽`} width={960} height={960} fetchPriority="high"/>}
     {playing&&<div className="plant-film" aria-label="植物生長影格動畫">{plant.stages.map((s,i)=><img key={s.label} src={frameURL(i)} className={i===frame?'current':''} alt={i===frame?`${plant.name}・${s.label}`:''} aria-hidden={i!==frame} width={1000} height={1040} fetchPriority={i===0?'high':'auto'}/>)}</div>}
     <div className="plant-scene-label"><span>{mode==='macro'?'CLOSE-UP / 器官特寫':'GROWTH / 全株生長'}</span><strong>{plant.name}</strong><small>{plant.latin}</small></div>
     {!active&&<div className="plant-start"><button onClick={()=>setActive(true)}><span aria-hidden="true">◌</span> 啟動 3D・旋轉看看</button><p>載入這一株，約 {mb(asset.bytes)}</p></div>}
     {active&&status==='loading'&&!playing&&<div className="plant-load-badge" role="status">正在準備這個階段的 3D，可先切換影格。<button onClick={stop}>使用靜態模式</button></div>}
     {active&&status==='error'&&!playing&&<div className="plant-loading" role="alert"><p>暫時無法開啟 3D，仍可瀏覽預覽與植物資料。</p><div><button onClick={retry}>重新載入</button><button onClick={stop}>回到預覽</button></div></div>}
     {playing&&<div className="plant-film-caption"><strong>{plant.stages[frame].label}</strong><span>生長影格 · {frame+1} / 5</span><div className="plant-film-track" role="progressbar" aria-label="動畫播放進度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(elapsed*100)}><i style={{transform:`scaleX(${elapsed})`}}/></div><small>{warmCount===5?'五個階段的 3D 已準備好':`3D 準備中 · ${warmCount} / 5 個階段`}</small><button onClick={()=>setPlaying(false)}>{modelReady?'直接操作 3D':'略過動畫，選擇階段'}</button></div>}
     {ready&&<span className="plant-refining" role="status">{status==='refining'?'細節逐步展開中…':status==='refine-error'?'細節暫未載入，可繼續操作或重選精細度':shown.includes('-lite')?'輕量 3D':shown.includes('-detail')?'精細特寫':'細緻 3D'}</span>}
     {ready&&<button className="plant-stop" onClick={stop}>收起 3D</button>}
     <span className="plant-image-caption">{playing?'約 6.5 秒，走過五個生長姿態':ready?'拖曳旋轉 · 雙指縮放':'植物形態靜態影格'}</span>
    </div>
    <div className="plant-view-controls" aria-label="模型觀察工具">
     <div><button disabled={!ready} onClick={()=>viewer.current?.view('front')}>正面</button><button disabled={!ready} onClick={()=>viewer.current?.view('back')}>葉背</button><button disabled={!ready} onClick={()=>viewer.current?.view('side')}>側面</button></div>
     <div><button disabled={!ready} aria-label="放大模型" onClick={()=>viewer.current?.zoom(.78)}>＋</button><button disabled={!ready} aria-label="縮小模型" onClick={()=>viewer.current?.zoom(1.28)}>－</button></div>
     <div><button aria-pressed={dark} onClick={()=>setDark(!dark)}>{dark?'淺色背景':'深色背景'}</button><button disabled={!ready} aria-pressed={wire} onClick={()=>setWire(!wire)}>網格</button><button disabled={!ready} aria-pressed={backlit} onClick={()=>setBacklit(!backlit)}>逆光</button><button disabled={!ready} aria-pressed={rotating} onClick={()=>setRotating(!rotating)}>{rotating?'停止旋轉':'慢慢轉'}</button></div>
    </div>
    <p className="plant-live" role="status" aria-live="polite">{playing?`先看${plant.name}的生長姿態，3D 同時準備中。`:ready?`${plant.name}・${mode==='macro'?'器官特寫':plant.stages[stage].label}，可以開始觀察。`:active&&status==='loading'?'模型載入中，可先閱讀下方介紹。':'預覽模式，可隨時回到 3D。'}</p>
    <div className="plant-modes" aria-label="觀察範圍"><button aria-pressed={mode==='macro'} onClick={()=>{setPlaying(false);setMode('macro');setZoomed(false);setShown('');const u=new URL(location.href);u.searchParams.delete('stage');u.searchParams.set('mode','macro');history.replaceState(null,'',u);}}>葉與花果特寫</button><button aria-pressed={mode==='whole'} onClick={()=>selectStage(stage)}>全株生長</button></div>
    <div className="plant-stages" aria-label={`${plant.name}的生長狀態`}>{plant.stages.map((s,i)=><button key={s.label} aria-pressed={mode==='whole'&&onStage===i} onClick={()=>selectStage(i)}><small>0{i+1}{warmed.includes(s.lite.file)?' · 3D':''}</small>{s.label}</button>)}</div>
    <div className="plant-film-replay"><button onClick={()=>{setMode('whole');setFrame(0);setElapsed(0);setReplay(n=>n+1);setPlaying(true);}}>重播生長動畫</button><span>動畫為五個觀察姿態，並非等長生長時間。</span></div>

   </div>
   <div className="plant-info">
    <p className="kicker">OBSERVE / 慢慢看</p><h2>{mode==='macro'?'靠近一點，看見細節。':plant.stages[onStage].label}</h2><p className="plant-focus">{focus[plant.id]}</p><p className="plant-note">{plant.note}</p>
    <label className="plant-quality">觀察細節<select value={quality} onChange={e=>{setQuality(e.target.value as typeof quality);setZoomed(false);}}><option value="auto">自動・快速操作，放大看細節</option><option value="lite">輕量・省流量（{mb(base.lite.bytes)}）</option><option value="balanced">細緻・全貌與紋理（{mb(base.bytes)}）</option>{mode==='macro'&&<option value="detail">精細・葉面近看（{mb(plant.detail.bytes)}）</option>}</select></label>
    <p className="plant-small">{mode==='macro'?'放大特寫時自動補載精細紋理；也可自行選擇。':'五階段先以輕量 3D 準備，放大時再補載細節。葉片近看可切換「葉與花果特寫」。'}省流量或慢速連線時保留輕量模型。</p>
    <div className="plant-actions"><a href={assetURL(downloadAsset.file)} download={`${plant.id}-${mode==='macro'?'macro':onStage+1}.glb`}>下載此模型 GLB <span>{mb(downloadAsset.bytes)}</span></a>{mode==='whole'&&<a className="plant-svg" href={assetURL(`svg/${plant.id}_${String(onStage+1).padStart(2,'0')}.svg`)} download>下載此狀態 SVG</a>}<button disabled={!ready||snapshotting} onClick={snapshot}>{snapshotting?'正在儲存…':'儲存目前視角 PNG'}</button></div>
    <p className="plant-small">可用於支援 glTF 的線上設計與三維軟體。<br/>模型為美術重建，保留實際 XYZ 座標。</p>
    <button className="plant-reference-thumb" onClick={()=>setReferences(true)} aria-label="查看參考照片"><img src={assetURL(plant.photos[stage%plant.photos.length].file)} alt={`${plant.name}的形態參考照片`} width={360} height={220} loading="lazy"/><small>{plant.photos[stage%plant.photos.length].author} · {plant.photos[stage%plant.photos.length].license}</small></button>
   </div>
  </div>
  <div className="plant-sources"><button className="plant-sources-toggle" aria-expanded={references} aria-controls="plant-reference-content" onClick={()=>setReferences(!references)}><span><small>REFERENCE / 對照著看</small><strong>{plant.name}的參考照片與資料</strong></span><b aria-hidden="true">{references?'－':'＋'}</b></button>
   {references&&<div id="plant-reference-content"><p>照片來自不同地區，保留作者與授權。展示圖僅縮小尺寸並轉為 WebP；模型材質另行製作。</p><div className="plant-reference-grid">{plant.photos.map(p=><figure key={p.file}><a href={p.source} target="_blank" rel="noopener noreferrer"><img src={assetURL(p.file)} alt={p.note||p.title} loading="lazy" width={360} height={270}/></a><figcaption><strong>{p.type==='illustration'?'植物圖示':p.note}</strong><span>{p.author}</span><a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a> · <a href={p.source} target="_blank" rel="noopener noreferrer">原圖與來源 ↗</a></figcaption></figure>)}</div><a className="underlined-link" href={urls[plant.id].url} target="_blank" rel="noopener noreferrer">{urls[plant.id].title} ↗</a></div>}
  </div>
 </section>
}
