import type {Metadata} from 'next';
import {SiteHeader,SiteFooter} from '../site-shell';
import {MapExplorer} from '../map-explorer';
import {sitePath} from '../site-path';
export const metadata:Metadata={title:'從稻站出發，走進日南九里｜九里互動地圖',description:'把日南稻站的故事、護照據點與活動場域放回九里地圖。看故事、找地點、選路線，從地圖繼續閱讀或開啟導航前往。'};
export default function ExplorePage(){return <main className="commons-page map-page" id="top"><SiteHeader active="explore"/><section className="editorial-section rinan-map-section" id="content"><MapExplorer primary/><p className="source-note">里界與統計沿用提供的 2021 年地圖資料。</p><a className="solid-link" href={sitePath('/visit/')}>到訪導航與交通方式 ↗</a></section><SiteFooter note="從稻站出發，慢慢認識日南。"/></main>;}
