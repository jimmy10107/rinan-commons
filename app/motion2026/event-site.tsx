"use client";

import { useEffect, useRef, useState } from "react";
import { chapters, organizations, placeMapUrl, places, programs, site, vendors } from "../content";
import { sitePath } from "../site-path";

type View = "1024" | "1025" | "local";
const plazaMap = "https://maps.app.goo.gl/NoN8DrkZRdcLhcoW6";
const stationMap = "https://maps.app.goo.gl/HNQpY3hKnP5kuRAs7";
const vendorCategories = ["手作藝術", "餐飲", "農漁特產", "倡議"];

export default function EventSite() {
  const [view, setView] = useState<View>("1024");
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const sync = () => { const hash = location.hash.slice(1); setView(hash === "1025" || hash === "local" ? hash : "1024"); };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const switchView = (next: View) => {
    setView(next);
    if (location.hash !== `#${next}`) history.pushState(null, "", `#${next}`);
    requestAnimationFrame(() => panel.current?.scrollIntoView({ block: "start", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }));
  };

  return <main className="event-page" id="top">
    <EventHeader />
    <a className="event-home-float" href={sitePath("/")} aria-label="返回日南稻站首頁">← <span>日南稻站首頁</span></a>
    <div className="passport-note"><b>提醒</b> 紙本護照才是蓋章與兌換依據，網站不提供線上集章。</div>
    <header className="event-bar"><strong>走傱日南 2026</strong><span>10.24（六）—10.25（日）</span></header>
    <section className="welcome event-welcome" id="content">
      <p className="eyebrow">2026 RINAN IN MOTION</p>
      <h1>在往返之間，<br />認識日南。</h1>
      <p className="event-date-large">10.24 <span>—</span> 10.25</p>
      <div className="event-quick-actions"><a href="#event-program">查看節目 ↓</a><a href={site.mapUrl} target="_blank" rel="noreferrer">稻站導航 ↗</a></div>
    </section>
    <nav className="view-tabs" aria-label="主要資訊分類">
      <button className={view === "1024" ? "active" : ""} onClick={() => switchView("1024")} aria-controls="event-program" aria-pressed={view === "1024"}><span>10/24・六</span><strong>生命・文化的走傱</strong></button>
      <button className={view === "1025" ? "active" : ""} onClick={() => switchView("1025")} aria-controls="event-program" aria-pressed={view === "1025"}><span>10/25・日</span><strong>身體的走傱</strong></button>
      <button className={view === "local" ? "active" : ""} onClick={() => switchView("local")} aria-controls="event-program" aria-pressed={view === "local"}><span>來到日南</span><strong>地圖・實用資訊</strong></button>
    </nav>
    <section ref={panel} id="event-program" className="content-panel" tabIndex={-1} aria-live="polite" aria-label={view === "1024" ? "10月24日節目" : view === "1025" ? "10月25日節目" : "日南在地資訊"}>
      {view === "1024" && <DayOne />}{view === "1025" && <DayTwo />}{view === "local" && <LocalInfo />}
    </section>
    <section id="registration" className="registration-panel registration-standalone" aria-labelledby="registration-title"><span>REGISTRATION</span><div><h3 id="registration-title">走傱報名</h3><p>報名已截止。請依各節目現場公告與邀請資訊參與；活動內容以最終公告為準。</p></div><b>報名已截止</b></section>
    <div className="event-visit-link"><a className="underlined-link" href={sitePath("/visit/")}>交通方式・安排到訪 ↗</a><br /><a className="underlined-link" href={sitePath("/explore/")}>探索日南九里地圖 ↗</a></div>
    <EventFooter />
  </main>;
}

function Timeline({ day }: { day: "2026-10-24" | "2026-10-25" }) {
  return <div className="event-timeline">{programs.filter(p => p.day === day).map(program => {
    const map = program.location.includes("車站旁廣場") ? plazaMap : program.location.includes("車站集合") ? stationMap : site.mapUrl;
    return <section key={program.id} className={`journey-card ${day === "2026-10-24" ? "life-card" : "body-card"}`}>
      <div className="journey-time"><span>{program.start}</span><i>—</i><span>{program.end}</span></div>
      <div className="journey-content"><div className="journey-place"><p>{program.location}</p><a href={map} target="_blank" rel="noreferrer">地點導航 ↗</a></div><h3>{program.title}</h3>{program.tags.length > 0 && <div className="event-tags">{program.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}</div>
    </section>;
  })}</div>;
}

function DayOne() {
  return <><div className="panel-heading"><span>10.24・星期六</span><h2>生命・文化的走傱</h2><p>14:00 由日南稻站開幕，17:00 起於日南車站旁廣場有音樂與走傱市集。</p></div><Timeline day="2026-10-24" />
    <section className="market-plan" aria-labelledby="market-title"><header className="market-heading"><span className="card-icon">市</span><div><small>10/24・17:00–21:30</small><h3 id="market-title">走傱市集</h3><p>已公開 11 組攤商；實際品項與區位以現場公告為準。</p></div></header>
      <div className="market-config">{vendorCategories.map((category, index) => { const group = vendors.filter(v => v.category === category); return group.length ? <div key={category}><span>0{index + 1}</span><strong>{category}</strong><small>{group.length} 組</small></div> : null; })}</div>
      <details className="vendor-details"><summary><span>查看已公開攤商</span><i>＋</i></summary><div className="vendor-groups">{vendorCategories.map(category => { const group = vendors.filter(v => v.category === category); return group.length ? <section className="vendor-group" key={category}><h4>{category}<small>{group.length} 組</small></h4><div className="vendor-list">{group.map(v => <article key={v.id}><div><strong>{v.name}</strong>{v.note && <small>{v.note}</small>}</div></article>)}</div></section> : null; })}</div></details>
    </section>
  </>;
}

function DayTwo() { return <><div className="panel-heading"><span>10.25・星期日</span><h2>身體的走傱</h2><p>早上單車走讀，午後影像與劇場；晚間交流晚宴採邀請制。</p></div><Timeline day="2026-10-25" /></>; }

function LocalInfo() { return <><div className="panel-heading"><span>EXPLORE RINAN</span><h2>日南在地資訊</h2><p>導航、展覽與合作單位，從這裡繼續往地方走。</p></div>
  <details className="info-card" open><summary><span className="card-icon">圖</span><div><small>LOCAL MAP</small><strong>日南觀光地圖</strong><em>開啟地點導航</em></div><i>＋</i></summary><div className="card-body place-links">{places.map(place => <a key={place.id} href={placeMapUrl(place)} target="_blank" rel="noreferrer"><strong>{place.name}</strong><span>導航 ↗</span></a>)}</div></details>
  <details className="info-card"><summary><span className="card-icon">冊</span><div><small>TO AND FROM</small><strong>《往・返》展覽</strong><em>閱讀四個章節</em></div><i>＋</i></summary><div className="card-body chapter-grid">{chapters.map(ch => <div key={ch.id}><b>{ch.english}｜{ch.title}</b><p>{ch.summary}</p></div>)}</div><div className="details-route-link"><a href={sitePath("/exhibition/to-and-from/")}>進入展覽頁 ↗</a></div></details>
  <details className="info-card"><summary><span className="card-icon">名</span><div><small>ORGANIZATIONS</small><strong>指導・主辦單位</strong><em>依正式順序查看</em></div><i>＋</i></summary><div className="card-body organization-credits"><OrganizationSection role="guidance" title="指導單位" /><OrganizationSection role="organizer" title="主辦單位" /></div></details>
  </>; }

function OrganizationSection({ role, title }: { role: "guidance" | "organizer"; title: string }) {
  return <section className="credit-section"><header><h4>{title}</h4></header><div className={`organization-grid${role === "organizer" ? " organizers" : ""}`}>{organizations.filter(o => o.role === role).map((o, index) => <a key={o.id} href={o.href.startsWith("/") ? sitePath(o.href) : o.href} target={o.href.startsWith("http") ? "_blank" : undefined} rel={o.href.startsWith("http") ? "noreferrer" : undefined}><span className="organization-order">{String(index + 1).padStart(2, "0")}</span><span className="organization-logo">{o.logo ? <img src={sitePath(o.logo)} alt="" loading="lazy" /> : <b className="text-logo">{o.textMark}</b>}</span><strong>{o.name}</strong><small>{o.href.includes("facebook.com") ? "Facebook 粉專 ↗" : "官方網站 ↗"}</small></a>)}</div></section>;
}

function EventHeader() { return <header className="site-header motion-header"><a className="site-brand site-brand-mark" href={sitePath("/")} aria-label="日南稻站首頁"><span className="site-brand-logo site-brand-logo-primary"><img src={sitePath("/images/rinan-commons-primary-logo.png")} alt="" width="1200" height="1200" /></span></a><nav className="site-navigation" aria-label="網站主要導覽"><a className="active" href={sitePath("/motion2026/")} aria-current="page">走傱日南 2026</a></nav></header>; }
function EventFooter() { return <footer className="site-footer motion-footer"><div className="footer-identity"><strong>日南稻站 Rinan Commons</strong><span>{site.address}</span></div><div className="footer-meta"><small>活動內容以最終公告為準</small><nav className="social-links" aria-label="日南稻站社群連結"><a href="https://www.instagram.com/rinan.commons/" target="_blank" rel="noreferrer">Instagram ↗</a><a href="https://www.facebook.com/rinan.commons/" target="_blank" rel="noreferrer">Facebook ↗</a></nav></div></footer>; }
