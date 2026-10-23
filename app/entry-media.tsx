"use client";
import { useState } from "react";
import { sitePath } from "./site-path";

/** Replaces the floating video and theme song until the event status is confirmed. */
export function EntryMedia() {
  const [expanded, setExpanded] = useState(true);
  return <aside className="event-notice-float" aria-label="走傱日南2026活動異動公告">
    {expanded ? <section className="event-notice-card" aria-labelledby="event-notice-title">
      <header className="event-notice-head">
        <div><span>IMPORTANT UPDATE / 2026.10.24</span><h2 id="event-notice-title">走傱日南 2026<br />活動異動公告</h2></div>
        <button type="button" aria-label="收合活動異動公告" className="event-notice-close" onClick={() => setExpanded(false)}>×</button>
      </header>
      <p>受颱風及天候影響，考量交通往返與參與人員安全，活動安排調整如下：</p>
      <div className="event-notice-item"><strong>10/24（六）｜確定延期</strong><p>原訂當日活動不依原時程舉行。新的活動日期及節目安排將另行公告。</p></div>
      <div className="event-notice-item pending"><strong>10/25（日）｜尚待確認</strong><p>仍在討論中，將視天候及現場安全狀況評估是否調整，請勿將原節目表視為已確認。</p></div>
      <p>最新消息以日南稻站官方網站及社群公告為準，感謝大家的理解與配合。</p>
      <a className="event-notice-action" href={sitePath("/motion2026/")}>查看活動最新資訊 ↗</a>
    </section> : <button className="event-notice-reopen" type="button" aria-label="展開活動異動公告" onClick={() => setExpanded(true)}>
      <strong>活動異動公告</strong><span>10/24 延期・10/25 待確認</span>
    </button>}
  </aside>;
}
