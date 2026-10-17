import type { Metadata } from 'next';
import { SiteHeader,SiteFooter } from '../site-shell';
import { articles } from '../content';
import { StoryIndex } from './story-index';
import './stories.css';
export const metadata:Metadata={title:'地方筆記｜日南車站、空間日常與人物故事',description:'認識臺中大甲日南：閱讀日南車站的鐵道文史、日南稻站的空間日常，以及走傱的日南人人物故事。從圖文出發，安排一趟海線地方小旅行。',alternates:{canonical:'https://www.rinancommons.com/stories/'}};
export default function StoriesPage(){return <main className="commons-page" id="top"><SiteHeader active="stories"/><header className="page-intro" id="content"><p className="kicker">JOURNAL / 地方筆記</p><h1>熟悉的地方，<br />再多認識一點。</h1><p>把走過的地方、聽見的故事，慢慢整理在這裡。</p></header><StoryIndex articles={articles}/><SiteFooter note="日南的故事，持續整理中。"/></main>}
