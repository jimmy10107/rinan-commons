import type {Metadata} from 'next';
import {SiteHeader,SiteFooter} from '../site-shell';
import {MapExplorer} from '../map-explorer';
import {sitePath} from '../site-path';
export const metadata:Metadata={title:'從九里，看日南｜九里互動地圖',description:'查看日南九里邊界、切換底圖，點選里名定位，探索日南生活圈。'};
export default function ExplorePage(){return <main className="commons-page cis-theme map-page" id="top"><SiteHeader active="explore"/><section className="editorial-section rinan-map-section" id="content"><MapExplorer primary/><p className="source-note">里界與統計沿用提供的 2021 年地圖資料。</p><a className="solid-link" href={sitePath('/visit/')}>到訪導航與交通方式 ↗</a></section><SiteFooter note="從九里，看日南。"/></main>;}
