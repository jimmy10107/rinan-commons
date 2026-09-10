"use client";

import { useState } from "react";
import { SiteFooter, SiteHeader } from "../../site-shell";
import { sitePath } from "../../site-path";
import { site, vendors, organizations, places, programs, chapters } from "../../content";

type View = "1024" | "1025" | "local";

const plannedMarket = ['手作藝術', '餐飲', '農漁特產', '倡議'].map(category => ({category, vendors: vendors.filter(v => v.category === category)}));
const guidanceOrganizations = organizations.filter(o => o.role === 'guidance');
const organizers = organizations.filter(o => o.role === 'organizer');

export default function Walk2026Page() {
  const [view, setView] = useState<View>("1024");
  const switchView = (next: View) => { setView(next); scrollTo({ top: 180, behavior: "smooth" }); };

  return (
    <main className="event-page" id="top">
      <SiteHeader active="walk" />
      <div className="passport-note"><b>提醒</b> 紙本護照才是蓋章與兌換依據，網站不提供線上集章。</div>
      <header className="event-bar"><strong>走傱日南 2026</strong><span>10.24—25</span></header>

      <section className="welcome event-welcome" id="content">
        <p className="eyebrow">2026 RINAN IN MOTION</p>
        <h1>走傱日南 <em>2026</em></h1><p className="event-tagline">在往返之間，認識日南。</p><p className="event-date-large">10.24 <span>—</span> 10.25</p>
      </section>

      <nav className="view-tabs" aria-label="主要資訊分類">
        <button className={view === "1024" ? "active" : ""} onClick={() => setView("1024")} aria-pressed={view === "1024"}><span>10/24</span><strong>生命・文化的走傱</strong></button>
        <button className={view === "1025" ? "active" : ""} onClick={() => setView("1025")} aria-pressed={view === "1025"}><span>10/25</span><strong>身體的走傱</strong></button>
        <button className={view === "local" ? "active" : ""} onClick={() => setView("local")} aria-pressed={view === "local"}><span>日南</span><strong>店家・地圖・手冊</strong></button>
      </nav>

      <section className="content-panel" aria-live="polite">
        {view === "1024" && <DayOne />}{view === "1025" && <DayTwo />}{view === "local" && <LocalInfo />}
      </section>

      <section id="registration" className="registration-panel registration-standalone" aria-labelledby="registration-title">
        <span>REGISTRATION</span>
        <div><h3 id="registration-title">走傱報名</h3><p>報名方式、集合地點與行前資訊，將在正式確認後由此頁統一更新。</p></div>
        {site.registrationUrl ? <a className="solid-link light" href={site.registrationUrl} target="_blank" rel="noreferrer">前往報名 ↗</a> : <b>報名連結準備中</b>}
      </section>

      <div className="event-visit-link"><a className="underlined-link" href={sitePath("/visit/")}>交通方式・安排到訪 ↗</a></div><SiteFooter note="活動內容以最終公告為準。" />
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

    {programs.filter(p=>p.day === '2026-10-24').map(program=><section key={program.id} className="journey-card life-card"><div className="journey-time"><span>{program.start}</span><i>—</i><span>{program.end}</span></div><div className="journey-content"><p>{program.location}</p><h3>{program.title}</h3><div className="event-tags">{program.tags.map(tag=><span key={tag}>{tag}</span>)}</div>{program.start==='17:00'&&<p className="lineup-note">演出陣容與個別時段將依正式公告更新。</p>}</div></section>)}

    <section className="market-plan" aria-labelledby="market-title">
      <header className="market-heading"><span className="card-icon">市</span><div><small>10/24・走傱市集</small><h3 id="market-title">走傱市集</h3><p>手作、飲食、物產與地方行動</p></div></header>
      <div className="market-config" aria-label="預計攤位種類與席次">{plannedMarket.map((group, index) => <div key={group.category}><span>0{index + 1}</span><strong>{group.category}</strong><small>{group.vendors.length ? `${group.vendors.length} 組已確認` : "陸續公布"}</small></div>)}</div>
      <p className="market-note">名單持續更新；實際攤數、品項與區位以最終公告為準。</p>
      <details className="vendor-details">
        <summary><span>查看已確認攤商與品項</span><i>＋</i></summary>
        <div className="vendor-groups">{plannedMarket.filter(group=>group.vendors.length).map((group) => <section className="vendor-group" key={group.category}><h4>{group.category}<small>{group.vendors.length} 席</small></h4><div className="vendor-list">{group.vendors.map((vendor) => <article key={vendor.name}><div><strong>{vendor.name}</strong>{vendor.note && <small>{vendor.note}</small>}</div><b className={vendor.status === "已確認" ? "confirmed" : "inviting"}>{vendor.status}</b></article>)}</div></section>)}</div>
      </details>
    </section>
  </>;
}

function DayTwo() {
  return <>
    <div className="panel-heading"><span>10.25・星期日</span><h2>身體的走傱</h2><p>用身體移動，走進日南各處。</p></div>
    {programs.filter(p=>p.day === '2026-10-25').map(program=><section key={program.id} className="journey-card body-card"><div className="journey-time all-day"><span>{program.start}</span></div><div className="journey-content"><p>{program.location}</p><h3>{program.title}</h3><div className="event-tags large">{program.tags.map(tag=><span key={tag}>{tag}</span>)}</div><p className="lineup-note">集合地點與行前資訊以報名確認信為準。</p></div></section>)}
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
      <div className="card-body place-links">{places.map((place) => <a key={place.id} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.query)}`} target="_blank" rel="noreferrer"><strong>{place.name}</strong><span>導航 ↗</span></a>)}</div>
    </details>
    <details className="info-card">
      <summary><span className="card-icon">冊</span><div><small>TO AND FROM</small><strong>《往・返》展覽手冊</strong><em>閱讀四個章節</em></div><i>＋</i></summary>
      <div className="card-body chapter-grid">{chapters.map(ch=><div key={ch.id}><b>{ch.english}｜{ch.title}</b><p>{ch.summary}</p></div>)}</div>
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
            {item.logo ? <img src={sitePath(item.logo)} alt="" loading="lazy" /> : <b className="text-logo">{item.textMark}</b>}
          </span>
          <strong>{item.name}</strong>
          {item.href && <small>官方連結 ↗</small>}
        </>;
        return item.href
          ? <a key={item.name} href={item.href.startsWith("/") ? sitePath(item.href) : item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noreferrer" : undefined}>{contents}</a>
          : <div key={item.name}>{contents}</div>;
      })}
    </div>
  </section>;
}
