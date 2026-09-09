import { SiteFooter, SiteHeader } from "./site-shell";
import { sitePath } from "./site-path";

const spaceUses = [
  {
    number: "01",
    title: "地方文化策展",
    text: "從鐵道、農業、產業與人物出發，慢慢整理日南的生活與記憶。",
  },
  {
    number: "02",
    title: "風土米食",
    text: "從地方生活與在地農產開始，認識土地、耕作，也認識一個地方。",
  },
  {
    number: "03",
    title: "青年交流",
    text: "讓返鄉、留鄉與第一次來到日南的人，可以在這裡相遇、聊天與合作。",
  },
  {
    number: "04",
    title: "旅遊與單車驛站",
    text: "在車站旁坐一下、休息一下，再從這裡往聚落、田野與海線出發。",
  },
];

export default function HomePage() {
  return (
    <main className="home-page" id="top">
      <SiteHeader active="home" />

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">RINAN COMMONS・日南車站旁</p>
          <h1>在往返之間，<br />認識日南。</h1>
          <p className="home-intro">一個可以看展、坐一下、認識地方，也能再往日南裡走的文化據點。</p>
          <div className="home-actions">
            <a className="primary-action" href={sitePath("/walk/2026/")}>走傱日南 2026 <span>↗</span></a>
            <a className="text-action" href="#space">認識這個空間 ↓</a>
          </div>
        </div>
        <aside className="station-note" aria-label="日南稻站位置">
          <span>STOP 01</span>
          <strong>日南車站旁</strong>
          <p>437 臺中市大甲區孟春里<br />中山路二段 1 號對面</p>
          <a href="https://www.google.com/maps/search/?api=1&query=24.37778%2C120.65444" target="_blank" rel="noreferrer">開啟導航 ↗</a>
        </aside>
      </section>

      <section className="home-story" id="space">
        <div className="section-label"><span>ABOUT</span><b>關於日南稻站</b></div>
        <div className="story-copy">
          <h2>稻站是走進日南<br />最溫柔的農村入口。</h2>
          <div>
            <p>日南稻站位在日南車站旁。我們整理臺鐵原有的閒置空間，保留舊有尺度，讓它重新成為人可以停留的地方。</p>
            <p>這裡從稻米開始，慢慢談日南的農業、鐵道、產業、信仰與生活。你可以先坐一下、看看展，也可以從這裡再往地方裡走。</p>
          </div>
        </div>
      </section>

      <section className="space-uses" aria-labelledby="space-uses-title">
        <header className="section-heading">
          <div className="section-label"><span>COMMONS</span><b>一個空間，四種使用</b></div>
          <h2 id="space-uses-title">讓停留成為<br />認識地方的開始。</h2>
        </header>
        <div className="use-grid">
          {spaceUses.map((item) => (
            <article key={item.number}>
              <span>{item.number}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-entries" aria-labelledby="entries-title">
        <header className="section-heading compact">
          <div className="section-label"><span>NOW</span><b>目前進行中</b></div>
          <h2 id="entries-title">從這裡，繼續往日南裡走。</h2>
        </header>
        <div className="entry-grid">
          <a className="entry-card walk-entry" href={sitePath("/walk/2026/")}>
            <span>2026.10.24—25</span>
            <div><small>RINAN IN MOTION</small><h3>走傱日南 2026</h3><p>市集、音樂、影像與走讀，一起認識日南與海線的生活。</p></div>
            <b>查看活動資訊 ↗</b>
          </a>
          <a className="entry-card exhibition-entry" href={sitePath("/exhibition/to-and-from/")}>
            <span>TO AND FROM</span>
            <div><small>EXHIBITION</small><h3>往・返</h3><p>從出發、走傱、回望到生根，閱讀日南持續發生的往返。</p></div>
            <b>閱讀展覽手冊 ↗</b>
          </a>
        </div>
      </section>

      <SiteFooter note="從這裡出發，也從這裡回來。" />
    </main>
  );
}
