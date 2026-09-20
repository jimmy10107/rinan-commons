'use client';
import {useEffect,useRef,useState} from 'react';
import assets from './assets.json';
import {sitePath} from '../site-path';
import type {PlantViewer} from './renderer';

type State='idle'|'loading'|'ready'|'error';
const places:Record<string,string>={casuarina:'海風裡的枝梢',rice:'田間的稻穗',taro:'舒展的盾形葉',koelreuteria:'換季的樹色',saccharum:'河床的銀白穗',broussonetia:'路旁的葉與果'};
const focus:Record<string,string>={casuarina:'細看綠色小枝的節段，再找找木質果序上的裂口。',rice:'沿著分枝往下看，穀粒各自掛在細梗上。',taro:'從葉面中央往外看，細脈順著彎曲的葉面展開。',koelreuteria:'近看三瓣蒴果的紙質表面，再回到複葉的排列。',saccharum:'靠近銀白花序，看看分枝間細細的長毛。',broussonetia:'比較葉面的粗糙感，以及熟果上密集的橙紅突起。'};
const urls:Record<string,{title:string,url:string}>={casuarina:{title:'NParks｜Casuarina equisetifolia',url:'https://www.nparks.gov.sg/florafaunaweb/flora/2/7/2793'},rice:{title:'Julius Kühn-Institut｜BBCH 生育期圖譜',url:'https://www.julius-kuehn.de/media/Veroeffentlichungen/bbch%20epaper%20en/page.pdf'},taro:{title:'NC State Extension｜Colocasia esculenta',url:'https://plants.ces.ncsu.edu/plants/colocasia-esculenta/'},koelreuteria:{title:'中央研究院｜數位典藏植物資料',url:'https://digiarch.sinica.edu.tw/content/subject/resource_content.jsp?id=442'},saccharum:{title:'中國植物志｜甜根子草',url:'https://db.kib.ac.cn/CNFlora/SearchResult.aspx?cpni=CPNI-233-12069'},broussonetia:{title:'NC State Extension｜Broussonetia papyrifera',url:'https://plants.ces.ncsu.edu/plants/broussonetia-papyrifera/'}};
const assetURL=(file:string)=>sitePath('/plants/'+file);
const mb=(bytes:number)=>(bytes/1048576).toFixed(1)+' MB';
export default function PlantExplorer(){
 const [index,setIndex]=useState(2),[stage,setStage]=useState(2),[mode,setMode]=useState<'macro'|'whole'>('macro'),[quality,setQuality]=useState<'balanced'|'detail'>('balanced');
 const [active,setActive]=useState(false),[status,setStatus]=useState<State>('idle'),[rotating,setRotating]=useState(false),[backlit,setBacklit]=useState(false),[references,setReferences]=useState(false),[snapshotting,setSnapshotting]=useState(false);
 const host=useRef<HTMLDivElement>(null),viewer=useRef<PlantViewer|null>(null);
 const plant=assets[index],asset=mode==='macro'?(quality==='detail'?plant.detail:plant.organ):plant.stages[stage];
 const url=assetURL(asset.file),latestURL=useRef(url);latestURL.current=url;
 const poster=mode==='macro'?assetURL(`previews/${plant.id}-960.webp`):assetURL(plant.stages[stage].preview);
 useEffect(()=>{
  const params=new URLSearchParams(location.search),i=assets.findIndex(p=>p.id===params.get('plant'));if(i>=0)setIndex(i);
  const s=Number(params.get('stage'));if(params.has('stage')&&Number.isInteger(s)&&s>=1&&s<=5){setStage(s-1);setMode('whole');}
 },[]);
 useEffect(()=>{
  if(!active)return;let stopped=false;setStatus('loading');
  import('./renderer').then(({createPlantViewer})=>{if(stopped||!host.current)return;const instance=createPlantViewer(host.current,state=>{if(!stopped)setStatus(state);});viewer.current=instance;void instance.load(latestURL.current);}).catch(()=>{if(!stopped)setStatus('error');});
  return ()=>{stopped=true;viewer.current?.destroy();viewer.current=null;};
 },[active]);
 useEffect(()=>{if(active&&viewer.current)void viewer.current.load(url);},[url,active]);
 useEffect(()=>{viewer.current?.rotate(rotating);},[rotating,status]);
 useEffect(()=>{viewer.current?.backlight(backlit);},[backlit,status]);
 function select(i:number){setIndex(i);setMode('macro');setStage(2);setRotating(false);setBacklit(false);setReferences(false);setQuality('balanced');const u=new URL(location.href);u.searchParams.set('plant',assets[i].id);u.searchParams.delete('stage');history.replaceState(null,'',u);}
 function selectStage(s:number){setStage(s);setMode('whole');setRotating(false);const u=new URL(location.href);u.searchParams.set('plant',plant.id);u.searchParams.set('stage',String(s+1));history.replaceState(null,'',u);}
 function stop(){setActive(false);setStatus('idle');setRotating(false);setBacklit(false);}
 function retry(){stop();requestAnimationFrame(()=>setActive(true));}
 async function snapshot(){if(!viewer.current)return;setSnapshotting(true);try{const blob=await viewer.current.snapshot();if(blob){const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=plant.id+'-3D.png';a.click();setTimeout(()=>URL.revokeObjectURL(u),5000);}}finally{setSnapshotting(false);}}
 const ready=active&&status==='ready';
 return <section className="plant-observatory" aria-label="植物模型探索">
  <div className="plant-picker" aria-label="選擇植物">{assets.map((p,i)=><button key={p.id} className={i===index?'selected':''} aria-pressed={i===index} onClick={()=>select(i)}><span className="plant-picker-number">0{i+1}</span><span>{p.name}</span><small>{places[p.id]}</small></button>)}</div>
  <div className="plant-workbench">
   <div className="plant-visual-column">
    <div className="plant-scene" data-state={status}>
     <div ref={host} className="plant-canvas-host" hidden={!active||status==='error'}/>
     {!ready&&<img className="plant-poster" src={poster} srcSet={mode==='macro'?`${assetURL(`previews/${plant.id}-480.webp`)} 480w, ${poster} 960w`:undefined} sizes="(max-width:760px) 100vw, 65vw" alt={`${plant.name}｜${mode==='macro'?'器官特寫':plant.stages[stage].label}的三維模型渲染預覽`} width={960} height={960} fetchPriority="high"/>}
     <div className="plant-scene-label"><span>{mode==='macro'?'CLOSE-UP / 器官特寫':'GROWTH / 全株生長'}</span><strong>{plant.name}</strong><small>{plant.latin}</small></div>
     {!active&&<div className="plant-start"><button onClick={()=>setActive(true)}><span aria-hidden="true">◌</span> 啟動 3D・旋轉看看</button><p>載入這一株，約 {mb(asset.bytes)}</p></div>}
     {active&&status==='loading'&&<div className="plant-loading" role="status"><span className="plant-spinner" aria-hidden="true"/>正在準備這株植物…<button onClick={stop}>先看預覽</button></div>}
     {active&&status==='error'&&<div className="plant-loading" role="alert"><p>暫時無法開啟 3D，仍可瀏覽預覽與植物資料。</p><div><button onClick={retry}>重新載入</button><button onClick={stop}>回到預覽</button></div></div>}
     {ready&&<button className="plant-stop" onClick={stop}>收起 3D</button>}
     <span className="plant-image-caption">{ready?'拖曳旋轉 · 雙指縮放':'3D 模型渲染預覽'}</span>
    </div>
    <div className="plant-view-controls" aria-label="模型觀察工具">
     <div><button disabled={!ready} onClick={()=>viewer.current?.view('front')}>正面</button><button disabled={!ready} onClick={()=>viewer.current?.view('back')}>葉背</button><button disabled={!ready} onClick={()=>viewer.current?.view('side')}>側面</button></div>
     <div><button disabled={!ready} aria-label="放大模型" onClick={()=>viewer.current?.zoom(.78)}>＋</button><button disabled={!ready} aria-label="縮小模型" onClick={()=>viewer.current?.zoom(1.28)}>－</button></div>
     <div><button disabled={!ready} aria-pressed={backlit} onClick={()=>setBacklit(!backlit)}>逆光</button><button disabled={!ready} aria-pressed={rotating} onClick={()=>setRotating(!rotating)}>{rotating?'停止旋轉':'慢慢轉'}</button></div>
    </div>
    <p className="plant-live" role="status" aria-live="polite">{ready?`${plant.name}・${mode==='macro'?'器官特寫':plant.stages[stage].label}，可以開始觀察。`:active&&status==='loading'?'模型載入中，可先閱讀下方介紹。':'先看預覽，想靠近時再啟動 3D。'}</p>
    <div className="plant-modes" aria-label="觀察範圍"><button aria-pressed={mode==='macro'} onClick={()=>{setMode('macro');const u=new URL(location.href);u.searchParams.delete('stage');history.replaceState(null,'',u);}}>器官特寫</button><button aria-pressed={mode==='whole'} onClick={()=>selectStage(stage)}>全株生長</button></div>
    <div className="plant-stages" aria-label={`${plant.name}的生長狀態`}>{plant.stages.map((s,i)=><button key={s.label} aria-pressed={mode==='whole'&&stage===i} onClick={()=>selectStage(i)}><small>0{i+1}</small>{s.label}</button>)}</div>
    <p className="plant-stage-help">點選階段，看全株的變化。各階段並非等長時間。</p>

   </div>
   <div className="plant-info">
    <p className="kicker">OBSERVE / 慢慢看</p><h2>{mode==='macro'?'靠近一點，看見細節。':plant.stages[stage].label}</h2><p className="plant-focus">{focus[plant.id]}</p><p className="plant-note">{plant.note}</p>
    {mode==='macro'&&<label className="plant-quality">觀察細節<select value={quality} onChange={e=>setQuality(e.target.value as 'balanced'|'detail')}><option value="balanced">流暢・適合手機（{mb(plant.organ.bytes)}）</option><option value="detail">精細・放大觀察（{mb(plant.detail.bytes)}）</option></select></label>}
    <div className="plant-actions"><a href={assetURL(asset.file)} download={`${plant.id}-${mode==='macro'?'macro':stage+1}.glb`}>下載此模型 GLB <span>{mb(asset.bytes)}</span></a><button disabled={!ready||snapshotting} onClick={snapshot}>{snapshotting?'正在儲存…':'儲存目前視角 PNG'}</button></div>
    <p className="plant-small">可用於支援 glTF 的線上設計與三維軟體。<br/>模型為美術重建，保留實際 XYZ 座標。</p>
   </div>
  </div>
  <div className="plant-sources"><button className="plant-sources-toggle" aria-expanded={references} aria-controls="plant-reference-content" onClick={()=>setReferences(!references)}><span><small>REFERENCE / 對照著看</small><strong>{plant.name}的參考照片與資料</strong></span><b aria-hidden="true">{references?'－':'＋'}</b></button>
   {references&&<div id="plant-reference-content"><p>照片來自不同地區，保留作者與授權。展示圖僅縮小尺寸並轉為 WebP；模型材質另行製作。</p><div className="plant-reference-grid">{plant.photos.map(p=><figure key={p.file}><a href={p.source} target="_blank" rel="noopener noreferrer"><img src={assetURL(p.file)} alt={p.note||p.title} loading="lazy" width={360} height={270}/></a><figcaption><strong>{p.type==='illustration'?'植物圖示':p.note}</strong><span>{p.author}</span><a href={p.licenseUrl} target="_blank" rel="noopener noreferrer">{p.license}</a> · <a href={p.source} target="_blank" rel="noopener noreferrer">原圖與來源 ↗</a></figcaption></figure>)}</div><a className="underlined-link" href={urls[plant.id].url} target="_blank" rel="noopener noreferrer">{urls[plant.id].title} ↗</a></div>}
  </div>
 </section>
}
