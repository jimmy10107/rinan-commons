"use client";

import { useState } from "react";
import { sitePath } from "../site-path";

type View = "1024" | "1025" | "local";

const musicTeams = [
  "拍謝少年 ft. 日南孟春排舞班",
  "震樂堂 ft. 日南慈德宮哨角團",
  "黃宇寒 Han",
  "劉阿昌 & 打幫你樂團",
  "沈文程 ft. 日南小馬老師",
];

const placeGroups = [
  {
    title: "日南周邊",
    places: [
      ["日南車站", "https://maps.app.goo.gl/HNQpY3hKnP5kuRAs7"],
      ["日南稻站", "https://maps.app.goo.gl/VD6aVDVXgYVA7n9S6"],
      ["九張犁聚落", "https://www.google.com/maps/search/?api=1&query=%E4%B9%9D%E5%BC%B5%E7%8A%81%20%E5%A4%A7%E7%94%B2"],
      ["九張犁鹹菜醃桶", "https://maps.app.goo.gl/gFoP5rhF9VQpLLyYA"],
      ["日南冷泉", "https://www.google.com/maps/search/?api=1&query=%E6%97%A5%E5%8D%97%E5%86%B7%E6%B3%89%20%E5%A4%A7%E7%94%B2"],
      ["松柏漁港", "https://www.google.com/maps/search/?api=1&query=%E6%9D%BE%E6%9F%8F%E6%BC%81%E6%B8%AF%20%E5%A4%A7%E7%94%B2"],
      ["慈德宮", "https://www.google.com/maps/search/?api=1&query=%E6%85%88%E5%BE%B7%E5%AE%AE%20%E6%97%A5%E5%8D%97%20%E5%A4%A7%E7%94%B2"],
      ["建興宮", "https://maps.app.goo.gl/sAawGo8cPvHSgXPDA"],
      ["小精靈迷宮", "https://www.google.com/maps/search/?api=1&query=%E5%B0%8F%E7%B2%BE%E9%9D%88%E8%BF%B7%E5%AE%AE%20%E5%B9%B8%E7%A6%8F%E9%87%8C%20%E5%A4%A7%E7%94%B2"],
      ["李安妮向日葵農場", "https://www.google.com/maps/search/?api=1&query=%E6%9D%8E%E5%AE%89%E5%A6%AE%E5%90%91%E6%97%A5%E8%91%B5%E8%BE%B2%E5%A0%B4"],
      ["有馬家休閒馬場", "https://www.google.com/maps/search/?api=1&query=%E6%9C%89%E9%A6%AC%E5%AE%B6%E4%BC%91%E9%96%92%E9%A6%AC%E5%A0%B4"],
    ],
  },
];

const marketPlan = [
  { category: "手作藝術", seats: 2, theme: "手作選物・地方創作" },
  { category: "餐飲", seats: 12, theme: "異國小吃・在地米食・夜市風味" },
  { category: "農漁特產", seats: 2, theme: "在地農產・漁港風物" },
  { category: "特製甜點", seats: 4, theme: "芋頭風味・手作烘焙" },
];

const guidanceOrganizations = [
  { name: "國家發展委員會", logo: "/partners/ndc.png", href: "https://www.ndc.gov.tw/", textMark: "" },
  { name: "交通部觀光署", logo: "/partners/tourism-administration.jpg", href: "https://admin.taiwan.net.tw/Organize/Articles?a=199", textMark: "" },
  { name: "文化部", logo: "", href: "https://www.moc.gov.tw/cp.aspx?n=209", textMark: "文化部" },
  { name: "國立彰化生活美學館", logo: "/partners/chcsec.jpg", href: "https://www.chcsec.gov.tw/cp.aspx?n=4030", textMark: "" },
];

const organizers = [
  { name: "日南稻站", logo: "/partners/rinan-commons.jpg", href: "/", textMark: "" },
  { name: "松柏港產業觀光發展協會", logo: "/partners/songbo.jpg", href: "https://www.facebook.com/profile.php?id=100057676351107", textMark: "" },
  { name: "臺鐵公司 臺中運務段", logo: "/partners/taiwan-railways-logo.jpg", href: "https://www.railway.gov.tw/", textMark: "" },
];

const marketSeatCount = marketPlan.reduce((total, group) => total + group.seats, 0);

export default function Motion2026Page() {
  const [view, setView] = useState<View>("1024");
  const switchView = (next: View) => {
    setView(next);
    scrollTo({ top: 180, behavior: "smooth" });
  };

  return (
    <main className="event-page" id="top">
      <EventHeader />
      <div className="passport-note"><b>提醒</b> 紙本護照才是蓋章與兌換依據，網站不提供線上集章。</div>
      <header className="event-bar"><strong>走傱日南 2026</strong><span>10.24—25</span></header>

      <section className="welcome event-welcome" id="content">
        <p className="eyebrow">2026 RINAN IN MOTION</p>
        <h1>在往返之間，<br />認識日南。</h1>
      </section>

      <nav className="view-tabs" aria-label="主要資訊分類">
        <button className={view === "1024" ? "active" : ""} onClick={() => setView("1024")} aria-pressed={view === "1024"}><span>10/24</span><strong>生命・文化的走傱</strong></button>
        <button className={view === "1025" ? "active" : ""} onClick={() => setView("1025")} aria-pressed={view === "1025"}><span>10/25</span><strong>身體的走傱</strong></button>
        <button className={view === "local" ? "active" : ""} onClick={() => setView("local")} aria-pressed={view === "local"}><span>日南</span><strong>店家・地圖・合作</strong></button>
      </nav>

      <section className="content-panel" aria-live="polite">
        {view === "1024" && <DayOne />}
        {view === "1025" && <DayTwo />}
        {view === "local" && <LocalInfo />}
      </section>

      <EventFooter />
      <nav className="bottom-tabs" aria-label="手機快速切換">
        <button className={view === "1024" ? "active" : ""} onClick={() => switchView("1024")}><span>24</span>10/24</button>
        <button className={view === "1025" ? "active" : ""} onClick={() => switchView("1025")}><span>25</span>10/25</button>
        <button className={view === "local" ? "active" : ""} onClick={() => switchView("local")}><span>日</span>日南資訊</button>
      </nav>
    </main>
  );
}

function DayOne() {
  return <>
    <div className="panel-heading"><span>10.24・星期六</span><h2>生命與文化的走傱</h2><p>午後從日南稻站展開，傍晚移動到日南車站旁廣場。</p></div>
    <section className="journey-card life-card">
      <div className="journey-time"><span>14:00</span><i>—</i><span>16:30</span></div>
      <div className="journey-content">
        <div className="journey-place"><p>日南稻站</p><a href="https://maps.app.goo.gl/rqn2Kyadki89xDgg6" target="_blank" rel="noreferrer">地點導航 <span aria-hidden="true">↗</span></a></div>
        <h3>生命的走傱</h3>
        <div className="event-tags"><span>開幕式</span><span>《走傱的日南人》紀錄片首映</span><span>宮崎日南策展對話</span></div>
      </div>
    </section>
    <section className="journey-card culture-card">
      <div className="journey-time"><span>17:00</span><i>—</i><span>21:30</span></div>
      <div className="journey-content">
        <div className="journey-place"><p>日南車站旁廣場</p><a href="https://maps.app.goo.gl/NoN8DrkZRdcLhcoW6" target="_blank" rel="noreferrer">地點導航 <span aria-hidden="true">↗</span></a></div>
        <h3>文化的走傱</h3><div className="event-tags"><span>音樂演出</span><span>走傱市集</span></div>
        <div className="lineup"><small>演出陣容</small>{musicTeams.map((team) => <strong key={team}>{team}</strong>)}</div>
      </div>
    </section>
    <section className="market-plan" aria-labelledby="market-title">
      <header className="market-heading"><span className="card-icon">市</span><div><small>10/24・走傱市集</small><h3 id="market-title">邀約席次配置</h3><p>預計邀約 {marketSeatCount} 席，依四類內容分區呈現。</p></div></header>
      <div className="market-config" aria-label="走傱市集邀約席次配置">{marketPlan.map((group, index) => <div key={group.category}><span>0{index + 1}</span><strong>{group.category}</strong><em>{group.seats} 席</em><small>{group.theme}</small></div>)}</div>
      <p className="market-note"><strong>完整名單敬請期待。</strong><span>活動內容以最終公告為準。</span></p>
    </section>
  </>;
}

function DayTwo() {
  return <>
    <div className="panel-heading"><span>10.25・星期日</span><h2>身體的走傱</h2><p>用身體移動，走進日南各處。</p></div>
    <section className="journey-card body-card">
      <div className="journey-time all-day"><span>全天</span></div>
      <div className="journey-content"><div className="journey-place"><p>日南各處</p></div><h3>身體的走傱</h3><div className="event-tags large"><span>單車走讀</span><span>山城藝造X鐵道環境劇場</span><span>台日文化交流</span></div></div>
    </section>
  </>;
}

function LocalInfo() {
  return <>
    <div className="panel-heading"><span>EXPLORE RINAN</span><h2>日南在地資訊</h2><p>店家、地點與活動合作資訊集中在這裡。</p></div>
    <details className="info-card" open>
      <summary><span className="card-icon">店</span><div><small>PASSPORT PARTNERS</small><strong>串聯店家</strong><em>查看護照據點</em></div><i>＋</i></summary>
      <div className="card-body"><div className="passport-grid"><span className="red">紅 3<small>美食</small></span><span className="green">綠 3<small>選物</small></span><span className="blue">藍 6<small>據點</small></span><span className="black">黑 3<small>活動</small></span></div><p className="passport-copy">共 15 格，集滿 10 格可兌換。正式店名、地址、營業時間與蓋章方式，請索取紙本進行集章。</p></div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">圖</span><div><small>LOCAL MAP</small><strong>日南觀光地圖</strong><em>開啟地點導航</em></div><i>＋</i></summary>
      <div className="card-body place-groups">{placeGroups.map((group) => <section key={group.title}><h4>{group.title}</h4><div className="place-links">{group.places.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer"><strong>{name}</strong><span>導航 ↗</span></a>)}</div></section>)}</div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">名</span><div><small>ORGANIZATIONS</small><strong>指導・主辦單位</strong></div><i>＋</i></summary>
      <div className="card-body organization-credits">
        <OrganizationSection label="指導單位" english="GUIDANCE" items={guidanceOrganizations} />
        <OrganizationSection label="主辦單位" english="ORGANIZERS" items={organizers} organizer />
      </div>
    </details>
  </>;
}

function OrganizationSection({ label, english, items, organizer = false }: { label: string; english: string; items: typeof guidanceOrganizations; organizer?: boolean }) {
  return <section className="credit-section">
    <header><span>{english}</span><h4>{label}</h4></header>
    <div className={`organization-grid${organizer ? " organizers" : ""}`}>
      {items.map((item, index) => {
        const contents = <>
          <span className="organization-order">{String(index + 1).padStart(2, "0")}</span>
          <span className="organization-logo">{item.logo ? <img src={sitePath(item.logo)} alt="" loading="lazy" /> : <b className="text-logo">{item.textMark}</b>}</span>
          <strong>{item.name}</strong>
          {item.href && <small>官方連結 ↗</small>}
        </>;
        const href = item.href.startsWith("/") ? sitePath(item.href) : item.href;
        return <a key={item.name} href={href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>{contents}</a>;
      })}
    </div>
  </section>;
}

function EventHeader() {
  return <header className="site-header motion-header">
    <a className="site-brand" href={sitePath("/motion2026/")} aria-label="走傱日南 2026 活動首頁">
      <span className="site-brand-logo"><img src={sitePath("/partners/rinan-commons.jpg")} alt="" /></span>
      <span><strong>日南稻站</strong><small>RINAN COMMONS</small></span>
    </a>
    <nav className="site-navigation" aria-label="網站主要導覽"><a className="active" href={sitePath("/motion2026/")} aria-current="page">走傱日南 2026</a></nav>
  </header>;
}

function EventFooter() {
  return <footer className="site-footer motion-footer">
    <div className="footer-identity"><strong>日南稻站 Rinan Commons</strong><span>437 臺中市大甲區孟春里中山路二段 1 號對面</span></div>
    <div className="footer-meta"><small>活動內容以最終公告為準</small><nav className="social-links" aria-label="日南稻站社群連結">
      <a href="https://www.instagram.com/rinan.commons" target="_blank" rel="noreferrer" aria-label="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-dot" cx="17.5" cy="6.5" r="1" /></svg></a>
      <a href="https://www.facebook.com/rinan.commons?locale=zh_TW" target="_blank" rel="noreferrer" aria-label="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.6 1.7-1.6H18V3.8c-.3 0-1.4-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H8.5v3h2.8v8h3.2Z" /></svg></a>
    </nav></div>
  </footer>;
}
