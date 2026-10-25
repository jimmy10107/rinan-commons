"use client";
import { useState } from "react";
import { sitePath } from "./site-path";

/** Latest activity announcement shown as a dismissible floating notice. */
export function EntryMedia() {
  const [expanded, setExpanded] = useState(true);
  return <aside className="event-notice-float" aria-label="走傱日南2026最新活動公告">
    {expanded ? <section className="event-notice-card" aria-labelledby="event-notice-title">
      <header className="event-notice-head">
        <div><span>IMPORTANT UPDATE / 2026.10.25</span><h2 id="event-notice-title">走傱日南 2026<br />最新活動時刻表</h2></div>
        <button type="button" aria-label="收合活動公告" className="event-notice-close" onClick={() => setExpanded(false)}>×</button>
      </header>
      <p>因應薔琵颱風影響，活動改以兩個日期繼續發生，最新安排如下：</p>
      <div className="event-notice-item"><strong>10/25（日）｜開幕系列活動</strong><p>單車走讀、日南稻站開幕、人物影像、臺日策展對話與鐵道環境劇場。</p></div>
      <div className="event-notice-item pending"><strong>10/31（六）｜音樂演出・走傱市集</strong><p>17:00–21:00 於日南車站旁廣場舉行，演出資訊將陸續更新公告。</p></div>
      <p>謝謝大家在風雨後重新調整腳步，最新消息以日南稻站官方網站及社群公告為準。</p>
      <a className="event-notice-action" href={sitePath("/motion2026/")}>查看最新活動時刻表 ↗</a>
    </section> : <button className="event-notice-reopen" type="button" aria-label="展開最新活動公告" onClick={() => setExpanded(true)}>
      <strong>最新活動公告</strong><span>10/25 開幕・10/31 市集</span>
    </button>}
  </aside>;
}
