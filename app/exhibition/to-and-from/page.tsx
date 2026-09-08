import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../../site-shell";

export const metadata: Metadata = {
  title: "往・返 TO AND FROM",
  description: "從往、走傱、返到生根，閱讀日南的人、土地、移動與生活。",
};

const chapters = [
  {
    number: "01",
    english: "TO",
    title: "往",
    summary: "出發、鐵道與離開。",
    text: "人與物從日南往外，也在一次次移動裡，把遠方帶回地方。",
  },
  {
    number: "02",
    english: "MOTION",
    title: "走傱",
    summary: "移動、勞動與生活。",
    text: "田裡、工廠、聚落與車站，構成日南持續運轉的日常。",
  },
  {
    number: "03",
    english: "RETURN",
    title: "返",
    summary: "記憶、回望與回家。",
    text: "離開之後再看日南，熟悉的地方也有了新的距離與理解。",
  },
  {
    number: "04",
    english: "GROUND",
    title: "生根",
    summary: "參與、留下與未來。",
    text: "一粒米落回土地，關係在一次次相遇中，慢慢長出來。",
  },
];

const exhibitionMaterials = [
  ["鐵道與海線", "從車站、路線與運輸，理解日南如何與外界往返。"],
  ["一粒米", "從稻作與餐桌，走近土地、耕作與地方生活。"],
  ["日南的人", "透過人物影像與生命經驗，看見離開、回來與留下。"],
  ["生活的物件", "農具、產業物件與日常材料，留下地方運作的痕跡。"],
  ["共同種下", "讓新的文字、記憶與位置繼續長進日南的地圖。"],
];

export default function ExhibitionPage() {
  return (
    <main className="exhibition-page" id="top">
      <SiteHeader active="exhibition" />

      <section className="exhibition-hero">
        <div>
          <p className="eyebrow">TO AND FROM・日南稻站開館展</p>
          <h1>往<span>・</span>返</h1>
        </div>
        <p>一粒米先扎根土地，經過耕作、移動與走傱走向遠方，最後回到餐桌、生活與地方。</p>
      </section>

      <section className="chapter-list" aria-label="展覽四個章節">
        {chapters.map((chapter) => (
          <article key={chapter.number}>
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
          {exhibitionMaterials.map(([title, text], index) => (
            <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>

      <section className="handbook-panel">
        <div><span>FULL HANDBOOK</span><h2>完整展覽手冊</h2><p>閱讀展覽論述、四個章節與現場內容。</p></div>
        <a href="https://rinancommons.s.gy/pdf" target="_blank" rel="noreferrer">開啟 PDF ↗</a>
      </section>

      <section className="next-route">
        <span>NEXT STOP</span>
        <h2>走傱日南 2026</h2>
        <p>從展覽走到市集、音樂、影像與走讀，繼續在往返之間認識日南。</p>
        <a href="/walk/2026">查看活動資訊 ↗</a>
      </section>

      <SiteFooter note="往返 TO AND FROM・資料將隨展覽進度更新" />
    </main>
  );
}
