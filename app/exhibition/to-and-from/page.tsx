import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../site-shell";
import { sitePath } from "../../site-path";
import { chapters, materials } from "../../content";
import { Credits, Gallery, Garden, People } from "./sections";
import s from "./exhibit.module.css";

export const metadata: Metadata = {
  title: "往返策展｜TO AND FROM",
  description: "從三幅人物掛幅走近日南，進入線上展廳，再種下自己的命定植物。日南稻站《往・返》開館策展。",
  alternates: { canonical: "https://www.rinancommons.com/exhibition/to-and-from" },
  openGraph: { title: "往・返｜日南稻站開館策展", description: "看人物故事、走進線上展廳，在日南種下自己的植物。", url: "https://www.rinancommons.com/exhibition/to-and-from", images: [{url:"https://www.rinancommons.com/exhibit/gallery-1200.webp", width:1200, height:750, alt:"日南稻站線上互動展廳"}] },
};

export default function ExhibitionPage() {
  return (
    <main className={`exhibition-page ${s.page}`} id="top">
      <SiteHeader active="exhibition" />

      <div className={s.wrap}>
      <section className={s.intro} id="content">
        <p className={s.kicker}>TO AND FROM / 日南稻站開館策展</p>
        <h1>往<span>・</span>返</h1>
        <p>在日南，有人留下，有人遠行，也有人第一次在這裡落腳。從三個人的故事出發，走進稻站的線上展廳；最後，種下一株屬於自己的植物，把你的故事也留在這裡。</p>
        <nav aria-label="本頁三個策展入口" className={s.waypoints}>
          <a href="#people"><small>01</small>人物故事 ↓</a><a href="#online-gallery"><small>02</small>線上展廳 ↓</a><a href="#living-wall"><small>03</small>種下日南 ↓</a>
        </nav>
      </section>
      <People/><Gallery/><Garden/>
      <section className={s.band} aria-labelledby="chapters-title">
        <p className={s.kicker}>CONTEXT / 策展脈絡</p><h2 id="chapters-title">讀懂往返的四個章節</h2>
        <div className={s.chapters}>
        {chapters.map((chapter) => (
          <article key={chapter.number} id={`chapter-${chapter.id}`}>
            <p className={s.kicker}>{chapter.number} / {chapter.english}</p><h3>{chapter.title}</h3>
            <strong>{chapter.summary}</strong><p>{chapter.text}</p>
          </article>
        ))}
        </div>
      </section></div>

      <section className="next-route exhibition-motion" id="motion-2026" aria-labelledby="motion-2026-title">
        <div className="motion-intro">
          <span>MOTION・年度行動紀錄</span>
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

      <div className={s.wrap}><section className={s.band}>
        <p className={s.kicker}>INSIDE / 延伸閱讀</p><h2>更多策展線索</h2>
        <div className={s.materials}>
          {materials.map(({title, text}, index) => (
            <article key={title}><span className={s.kicker}>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section><Credits/></div>

      <SiteFooter note="往返 TO AND FROM・策展與年度行動持續更新" />
    </main>
  );
}
