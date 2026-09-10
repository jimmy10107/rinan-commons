import type { Metadata } from 'next';
import { SiteHeader,SiteFooter } from '../site-shell';
import { articles } from '../content';
import { StoryIndex } from './story-index';
export const metadata:Metadata={title:'地方筆記',description:'從鐵道、空間與日常，慢慢讀日南。'};
export default function StoriesPage(){return <main className="commons-page" id="top"><SiteHeader active="stories"/><header className="page-intro" id="content"><p className="kicker">JOURNAL / 地方筆記</p><h1>熟悉的地方，<br />再多認識一點。</h1><p>把走過的地方、聽見的故事，慢慢整理在這裡。</p></header><StoryIndex articles={articles}/><SiteFooter note="日南的故事，持續整理中。"/></main>}
