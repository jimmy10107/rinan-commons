"use client";

import { useState } from "react";
import { SiteFooter, SiteHeader } from "../../site-shell";
import { sitePath } from "../../site-path";

type View = "1024" | "1025" | "local";

const musicTeams = [
  "拍謝少年 ft. 日南孟春排舞班",
  "震樂堂 ft. 日南慈德宮哨角團",
  "黃宇寒 Han",
  "劉阿昌 & 打幫你樂團",
  "沈文程 ft. 日南小馬老師",
];

const places = [
  ["日南車站", "日南車站 台中大甲"], ["日南稻站", "日南車站 台中大甲"],
  ["九張犁聚落", "九張犁 大甲"], ["日南冷泉", "日南冷泉 大甲"],
  ["大甲幼獅工業區", "大甲幼獅工業區"], ["松柏漁港", "松柏漁港 大甲"],
  ["慈德宮", "慈德宮 日南 大甲"], ["九張犁公園", "九張犁公園 大甲"],
];

const plannedMarket = [
  {
    category: "手作藝術",
    theme: "手作・地方創作",
    vendors: [
      { name: "東Room", status: "已確認" },
      { name: "拾光伍參柒", status: "邀請中" },
    ],
  },
  {
    category: "餐飲",
    theme: "跨國飲食・米食・夜市日常",
    vendors: [
      { name: "泰國攤位｜娜翎の窩 Thai Narin", status: "已確認" },
      { name: "越南攤位", status: "邀請中" },
      { name: "宮崎縣人會", status: "已確認", note: "牛肉串燒、日南酒、套圈圈" },
      { name: "崩八食堂 X Play Me", status: "已確認", note: "香腸" },
      { name: "原味豆腐", status: "邀請中", note: "豆花" },
      { name: "椛檸製所", status: "邀請中", note: "芋頭可麗露、芋頭塔、巴斯克" },
      { name: "3Ｑ米食", status: "邀請中", note: "客家米食" },
      { name: "幸福里謝家米食", status: "邀請中" },
      { name: "爆米香", status: "邀請中", note: "店家待確認" },
      { name: "山腳下飯糰", status: "邀請中" },
      { name: "大甲宜吉蔥油餅", status: "邀請中" },
      { name: "煦苑紅豆餅", status: "邀請中" },
      { name: "夜市熱門攤位", status: "邀請中", note: "實際攤商名稱待確認" },
      { name: "夜市青年創業攤位", status: "邀請中", note: "實際攤商名稱待確認" },
      { name: "夜市特色攤位", status: "邀請中", note: "實際攤商名稱待確認" },
      { name: "東明國小家長會長推薦攤位", status: "邀請中" },
    ],
  },
  {
    category: "農漁特產",
    theme: "大甲・日南・松柏港物產",
    vendors: [
      { name: "大甲直売所", status: "邀請中" },
      { name: "大甲區農會", status: "邀請中" },
      { name: "松柏港觀光發展協會", status: "邀請中" },
    ],
  },
  {
    category: "倡議",
    theme: "單車・海線地方行動",
    vendors: [
      { name: "日中", status: "邀請中" },
      { name: "嗨風裏", status: "邀請中" },
    ],
  },
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

export default function Walk2026Page() {
  const [view, setView] = useState<View>("1024");
  const switchView = (next: View) => { setView(next); scrollTo({ top: 180, behavior: "smooth" }); };

  return (
    <main className="event-page" id="top">
      <SiteHeader active="walk" />
      <div className="passport-note"><b>提醒</b> 紙本護照才是蓋章與兌換依據，網站不提供線上集章。</div>
      <header className="event-bar"><strong>走傱日南 2026</strong><span>10.24—25</span></header>

      <section className="welcome event-welcome">
        <p className="eyebrow">2026 RINAN IN MOTION</p>
        <h1>在往返之間，<br />認識日南。</h1>
      </section>

      <nav className="view-tabs" aria-label="主要資訊分類">
        <button className={view === "1024" ? "active" : ""} onClick={() => setView("1024")} aria-pressed={view === "1024"}><span>10/24</span><strong>生命・文化的走傱</strong></button>
        <button className={view === "1025" ? "active" : ""} onClick={() => setView("1025")} aria-pressed={view === "1025"}><span>10/25</span><strong>身體的走傱</strong></button>
        <button className={view === "local" ? "active" : ""} onClick={() => setView("local")} aria-pressed={view === "local"}><span>日南</span><strong>店家・地圖・手冊</strong></button>
      </nav>

      <section className="content-panel" aria-live="polite">
        {view === "1024" && <DayOne />}{view === "1025" && <DayTwo />}{view === "local" && <LocalInfo />}
      </section>

      <section className="registration-panel registration-standalone" aria-labelledby="registration-title">
        <span>REGISTRATION</span>
        <div><h3 id="registration-title">走傱報名</h3><p>報名方式、集合地點與行前資訊，將在正式確認後由此頁統一更新。</p></div>
        <b>報名連結準備中</b>
      </section>

      <SiteFooter note="活動內容以最終公告為準・資料版本 2026.09.03" />
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
      <div className="journey-content"><p>日南稻站</p><h3>生命的走傱</h3><div className="event-tags"><span>開幕式</span><span>《走傱的日南人》紀錄片首映</span><span>宮崎日南策展對話</span></div></div>
    </section>

    <section className="journey-card culture-card">
      <div className="journey-time"><span>17:00</span><i>—</i><span>21:30</span></div>
      <div className="journey-content"><p>日南車站旁廣場</p><h3>文化的走傱</h3><div className="event-tags"><span>音樂演出</span><span>走傱市集</span></div>
        <div className="lineup"><small>演出陣容</small>{musicTeams.map((team) => <strong key={team}>{team}</strong>)}<em>and more...</em></div>
      </div>
    </section>

    <section className="market-plan" aria-labelledby="market-title">
      <header className="market-heading"><span className="card-icon">市</span><div><small>10/24・走傱市集</small><h3 id="market-title">預計攤位配置</h3><p><b>預計</b><b>邀請中</b> 共 23 組規劃席次</p></div></header>
      <div className="market-config" aria-label="預計攤位種類與席次">{plannedMarket.map((group, index) => <div key={group.category}><span>0{index + 1}</span><strong>{group.category}</strong><em>{group.vendors.length} 席</em><small>{group.theme}</small></div>)}</div>
      <p className="market-note">此為目前預計配置，實際攤數、區位與出席名單仍在邀請確認中，將依最新公告更新。</p>
      <details className="vendor-details">
        <summary><span>查看預計單位與品項</span><i>＋</i></summary>
        <div className="vendor-groups">{plannedMarket.map((group) => <section className="vendor-group" key={group.category}><h4>{group.category}<small>{group.vendors.length} 席</small></h4><div className="vendor-list">{group.vendors.map((vendor) => <article key={vendor.name}><div><strong>{vendor.name}</strong>{vendor.note && <small>{vendor.note}</small>}</div><b className={vendor.status === "已確認" ? "confirmed" : "inviting"}>{vendor.status}</b></article>)}</div></section>)}</div>
      </details>
    </section>
  </>;
}

function DayTwo() {
  return <>
    <div className="panel-heading"><span>10.25・星期日</span><h2>身體的走傱</h2><p>用身體移動，走進日南各處。</p></div>
    <section className="journey-card body-card">
      <div className="journey-time all-day"><span>全天</span></div>
      <div className="journey-content"><p>日南各處</p><h3>身體的走傱</h3><div className="event-tags large"><span>單車走讀</span><span>鐵道環境劇場</span><span>台日文化交流</span></div></div>
    </section>
  </>;
}

function LocalInfo() {
  return <>
    <div className="panel-heading"><span>EXPLORE RINAN</span><h2>日南在地資訊</h2><p>店家、地點、策展內容與支持名單集中在這裡。</p></div>
    <details className="info-card" open>
      <summary><span className="card-icon">店</span><div><small>PASSPORT PARTNERS</small><strong>串聯店家</strong><em>查看護照據點</em></div><i>＋</i></summary>
      <div className="card-body"><div className="passport-grid"><span className="red">紅 3<small>美食</small></span><span className="green">綠 3<small>選物</small></span><span className="blue">藍 6<small>據點</small></span><span className="black">黑 3<small>活動</small></span></div><p className="pending-text">共 15 格，集滿 10 格可兌換。正式店名、地址、營業時間與蓋章方式，待書面確認後更新。</p></div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">圖</span><div><small>LOCAL MAP</small><strong>日南觀光地圖</strong><em>開啟地點導航</em></div><i>＋</i></summary>
      <div className="card-body place-links">{places.map(([name, query]) => <a key={name} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} target="_blank" rel="noreferrer"><strong>{name}</strong><span>導航 ↗</span></a>)}</div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">冊</span><div><small>TO AND FROM</small><strong>《往・返》展覽手冊</strong><em>閱讀四個章節</em></div><i>＋</i></summary>
      <div className="card-body chapter-grid"><div><b>TO｜往</b><p>出發、鐵道與離開。</p></div><div><b>MOTION｜走傱</b><p>移動、勞動與生活。</p></div><div><b>RETURN｜返</b><p>記憶、回望與回家。</p></div><div><b>GROUND｜生根</b><p>參與、留下與未來。</p></div></div>
      <div className="details-route-link"><a href={sitePath("/exhibition/to-and-from/")}>進入展覽手冊頁 ↗</a></div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">名</span><div><small>ORGANIZATIONS</small><strong>指導・主辦單位</strong><em>依正式順序查看</em></div><i>＋</i></summary>
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
          <span className="organization-logo">
            {item.logo ? <img src={item.logo} alt="" loading="lazy" /> : <b className="text-logo">{item.textMark}</b>}
          </span>
          <strong>{item.name}</strong>
          {item.href && <small>官方連結 ↗</small>}
        </>;
        return item.href
          ? <a key={item.name} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>{contents}</a>
          : <div key={item.name}>{contents}</div>;
      })}
    </div>
  </section>;
}
