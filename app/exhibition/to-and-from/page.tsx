import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../site-shell";
import { sitePath } from "../../site-path";
import { chapters, materials } from "../../content";

export const metadata: Metadata = {
  title: "往返策展｜TO AND FROM",
  description: "從往、走傱、返到生根，閱讀日南的人、土地、移動與生活；走進走傱日南 2026 的年度行動。",
};

export default function ExhibitionPage() {
  return (
    <main className="exhibition-page" id="top">
      <SiteHeader active="exhibition" />

      <section className="exhibition-hero" id="content">
        <div>
          <p className="eyebrow">TO AND FROM・日南稻站開館策展</p>
          <h1>往<span>・</span>返</h1>
        </div>
        <p>出發、走傱、回望與生根。從人的移動，閱讀土地與生活；在一次次往返之間，重新認識日南。</p>
      </section>

      <nav className="chapter-nav" aria-label="策展章節">{chapters.map(ch=><a href={`#chapter-${ch.id}`} key={ch.id}>{ch.english} <strong>{ch.title}</strong></a>)}</nav>
      <section className="chapter-list" aria-label="策展四個章節">
        {chapters.map((chapter) => (
          <article key={chapter.number} id={`chapter-${chapter.id}`}>
            <span className="chapter-number">{chapter.number}</span>
            <div className="chapter-name"><small>{chapter.english}</small><h2>{chapter.title}</h2></div>
            <div className="chapter-copy"><strong>{chapter.summary}</strong><p>{chapter.text}</p></div>
          </article>
        ))}
      </section>

      <section className="next-route exhibition-motion" id="motion-2026" aria-labelledby="motion-2026-title">
        <div className="motion-intro">
          <span>MOTION・年度行動</span>
          <p className="motion-year">2026</p>
          <h2 id="motion-2026-title">走傱日南</h2>
          <p>「往返」不只停在展場。2026 年，我們把人物、鐵路、地方生活與共同創作帶進走讀、市集、音樂、影像和現場相遇，讓策展成為一場持續發生的地方行動。</p>
        </div>
        <div>
          <div className="motion-programs" aria-label="走傱日南 2026 活動摘要">
            <article><time dateTime="2026-10-25">10.25（日）</time><div><h3>開幕系列活動</h3><p>單車走讀、日南稻站開幕、紀錄片首映、人物對談、臺日策展交流與鐵道環境劇場。</p></div></article>
            <article><time dateTime="2026-10-31">10.31（六）</time><div><h3>音樂演出・走傱市集</h3><p>在日南車站旁，讓地方店家、創作者、表演者與居民共同完成一晚的公共現場。</p></div></article>
          </div>
          <div className="motion-actions"><a href={sitePath("/motion2026/")}>查看 2026 完整活動紀錄 ↗</a><a href={sitePath("/motion2026/market/")}>查看走傱市集品牌 ↗</a></div>
        </div>
      </section>

      <section className="exhibition-about">
        <header className="section-heading">
          <div className="section-label"><span>INSIDE</span><b>策展內容</b></div>
          <h2>從幾條線索，<br />慢慢走近日南。</h2>
        </header>
        <div className="material-list">
          {materials.map(({title, text}, index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <SiteFooter note="往返 TO AND FROM・策展與年度行動持續更新" />
    </main>
  );
}
