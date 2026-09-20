import type {Metadata} from 'next';
import {SiteHeader,SiteFooter} from '../site-shell';
import {sitePath} from '../site-path';
import PlantExplorer from './plant-explorer';
import './plants.css';

export const metadata:Metadata={title:'日南植物形態室',description:'從芋葉的細脈到稻穗的低垂，近看木麻黃、水稻、芋頭、臺灣欒樹、甜根子草與構樹的三維模型，探索生長與季節變化。',alternates:{canonical:'https://jimmy10107.github.io/rinan-commons/plants/'},openGraph:{title:'日南植物形態室｜日南稻站',description:'從日南的田、海風與河床，靠近一株植物。',images:[{url:'https://jimmy10107.github.io/rinan-commons/plants/previews/taro-960.webp',width:960,height:960,alt:'芋頭三維模型的葉面特寫'}]}};
export default function PlantsPage(){return <div className="commons-site plants-page" id="top">
  <SiteHeader active="plants"/>
  <main id="content">
    <div className="plant-intro"><div><p className="kicker">RINAN BOTANICAL STUDIES / 06</p><h1>日南植物形態室</h1></div><p>從日南的田、海風與河床，靠近一株植物。<br/>六種植物・三十種姿態，從全株看到葉脈。</p></div>
    <PlantExplorer/>
    <section className="plant-reading" aria-labelledby="plant-reading-title"><p className="kicker">從近看，回到地方</p><h2 id="plant-reading-title">看見變化，也保留差異。</h2><div><p>幼苗、展葉、開花、結實，各有自己的步調。這裡的五個狀態是觀察入口，並不代表相同的時間長度；成熟、落葉，也不一定是枯萎。</p><p>模型依植物資料與照片作美術重建，材質包含生成紋理。參考照片來自不同地區，並非日南同一株植物的連續紀錄。形態與品種差異，仍需要回到實株觀察。</p></div><a className="underlined-link" href={sitePath('/exhibition/to-and-from/')}>走進《往・返》展覽 ↗</a></section>
  </main><SiteFooter note="在葉與穗之間，慢慢認識日南。"/>
</div>}
