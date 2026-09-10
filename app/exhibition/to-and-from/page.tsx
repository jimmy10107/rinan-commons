import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../site-shell";
import { sitePath } from "../../site-path";
import { chapters, materials, site } from "../../content";

export const metadata: Metadata = {
  title: "往・返 TO AND FROM",
  description: "從往、走傱、返到生根，閱讀日南的人、土地、移動與生活。",
};

export default function ExhibitionPage() {
  return (
    <main className="exhibition-page" id="top">
      <SiteHeader active="exhibition" />

      <section className="exhibition-hero" id="content">
        <div>
          <p className="eyebrow">TO AND FROM・日南稻站開館展</p>
          <h1>往<span>・</span>返</h1>
        </div>
        <p>出發、走傱、回望與生根。從人的移動，閱讀土地與生活；在一次次往返之間，重新認識日南。</p>
      </section>

      <nav className="chapter-nav" aria-label="展覽章節">{chapters.map(ch=><a href={`#chapter-${ch.id}`} key={ch.id}>{ch.english} <strong>{ch.title}</strong></a>)}</nav>
      <section className="chapter-list" aria-label="展覽四個章節">
        {chapters.map((chapter) => (
          <article key={chapter.number} id={`chapter-${chapter.id}`}>
            <span className="chapter-number">{chapter.number}</span>
            <div className="chapter-name"><small>{chapter.english}</small><h2>{chapter.title}</h2></div>
            <div className="chapter-copy"><strong>{chapter.summary}</strong><p>{chapter.text}</p></div>
          </article>
        ))}
      </section>

      <section className="exhibition-about">
        <header className="section-heading">
          <div className="section-label"><span>INSIDE</span><b>展覽內容</b></div>
          <h2>從幾條線索，<br />慢慢走近日南。</h2>
        </header>
        <div className="material-list">
          {materials.map(({title, text}, index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="handbook-panel">
        <div><span>FULL HANDBOOK</span><h2>完整展覽手冊</h2><p>閱讀展覽論述、四個章節與現場內容。</p></div>
        <a href={site.handbookUrl} target="_blank" rel="noreferrer">開啟 PDF ↗</a>
      </section>

      <section className="next-route">
        <span>NEXT STOP</span>
        <h2>走傱日南 2026</h2>
        <p>從展覽走到市集、音樂、影像與走讀，繼續在往返之間認識日南。</p>
        <a href={sitePath("/walk/2026/")}>查看活動資訊 ↗</a>
      </section>

      <SiteFooter note="往返 TO AND FROM・資料將隨展覽進度更新" />
    </main>
  );
}
