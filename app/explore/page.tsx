import type {Metadata} from 'next';
import {SiteHeader,SiteFooter} from '../site-shell';
import {MapExplorer} from '../map-explorer';
import {sitePath} from '../site-path';
export const metadata:Metadata={title:'從稻站出發，走進日南九里｜九里互動地圖',description:'從日南車站旁的稻站出發，沿著九里地圖認識車站、田地、聚落與海岸，看看人們生活、工作與往返的日常。'};
export default function ExplorePage(){return <main className="commons-page map-page" id="top"><SiteHeader active="explore"/><section className="editorial-section rinan-map-section" id="content"><MapExplorer primary/><p className="source-note">里界與統計沿用提供的 2021 年地圖資料。</p><a className="solid-link" href={sitePath('/visit/')}>到訪導航與交通方式 ↗</a></section><SiteFooter note="從稻站出發，慢慢認識日南。"/></main>;}
