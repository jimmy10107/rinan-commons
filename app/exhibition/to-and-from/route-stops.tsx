import { sitePath } from '../../site-path';
import { makerUrl } from './exhibit-data';
import s from './exhibit.module.css';

function ExhibitPhoto({file,alt,width,height,caption}:{file:string;alt:string;width:number;height:number;caption:string}) {
  const src=sitePath('/exhibit/'+file+'.webp');
  return <figure className={s.routePhoto}>
    <a href={src} aria-label={'放大圖片：'+alt}><img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async"/></a>
    <figcaption>{caption}</figcaption>
  </figure>;
}

export function Passage() {
  return <section className={s.band} id="underpass" aria-labelledby="passage-title">
    <p className={s.kicker}>從車站出發 / 攝影</p><h2 id="passage-title">在地下道，停下來看一張照片。</h2>
    <p className={s.lede}>日南車站地下道原是趕車時匆匆走過的一段路。這次把照片放在這裡，邀請你放慢腳步：哪一幕像自己的日常？又有哪一幕，是住在日南也不曾留意的風景？</p>
  </section>;
}

export function OutdoorMaps() {
  return <section className={s.band} id="outdoor-maps" aria-labelledby="maps-title">
    <p className={s.kicker}>走出地下道 / 戶外地圖</p><h2 id="maps-title">先看日南九里，再看車站周邊。</h2>
    <p className={s.lede}>在稻站外牆前，先找出日南車站。把目光放遠，九里的田野、聚落與海岸連成一片；再看周邊地圖，選一個地名，當作今天想走到的地方。</p>
    <div className={s.mapSpread}>
      <ExhibitPhoto file="outdoor" width={1050} height={788} alt="日南稻站外牆上的地方導覽圖" caption="站在稻站外，讀一張日南的地圖。"/>
      <ExhibitPhoto file="guide" width={1200} height={600} alt="日南九里地方導覽圖及右上角周邊位置圖" caption="點圖可放大，對照九里與周邊的位置。"/>
    </div>
    <div className={s.actions}><a className={s.textLink} href={sitePath('/explore/')}>開啟九里互動地圖</a><a className={s.textLink} href={sitePath('/visit/')}>查周邊地點與交通</a></div>
    <p className={s.fine}>圖版與現場紀錄出自<a href={makerUrl}>大作創意作品頁</a>。</p>
  </section>;
}

export function HistoryPanels() {
  return <section className={s.band} id="history-panels" aria-labelledby="history-title">
    <p className={s.kicker}>走進稻站 / 地方文史展板</p><h2 id="history-title">沿著時間軸，回看日南。</h2>
    <p className={s.lede}>剛才在地圖上找到的地方，放到不同年代，曾是什麼模樣？展板把地圖、照片和地方紀事排在同一條時間軸上。可以先挑一張感興趣的圖，再順著旁邊的文字往前、往後讀。</p>
    <ExhibitPhoto file="panels" width={1050} height={788} alt="稻站室內的地方歷史時間軸展板，牆上並列史料照片與地圖" caption="日南地方時間軸展板｜史料與圖說：日南稻站團隊；資訊編排：大作創意。"/>
  </section>;
}
