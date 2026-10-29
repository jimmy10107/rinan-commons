"use client";
import { useState } from "react";
import { sitePath } from "./site-path";

const lineup = [
  ["17:00–17:40", "震樂堂 ft. 日南慈德宮哨角團"],
  ["18:00–18:30", "劉阿昌與打幫你樂團"],
  ["18:45–19:15", "萬芳 One-Fang"],
  ["19:35–20:05", "黃宇寒 Han"],
  ["20:20–21:00", "拍謝少年 ft. 孟春排舞班"],
] as const;

/** Latest confirmed concert timetable shown as a dismissible floating notice. */
export function EntryMedia() {
  const [expanded, setExpanded] = useState(true);
  return <aside className="event-notice-float" aria-label="走傱日南 2026 10月31日演出公告">
    {expanded ? <section className="event-notice-card" aria-labelledby="event-notice-title">
      <header className="event-notice-head">
        <div><span>LINE UP / 2026.10.31 SAT.</span><h2 id="event-notice-title">走傱日南 2026<br />最新節目表</h2></div>
        <button type="button" aria-label="收合活動公告" className="event-notice-close" onClick={() => setExpanded(false)}>×</button>
      </header>
      <p>走傱市集｜10/31（六）16:30–21:00<br />音樂演出｜17:00–21:00<br />日南車站旁廣場</p>
      <div className="event-lineup-list">
        {lineup.map(([time, performer]) => <div className="event-lineup-row" key={time}><time>{time}</time><strong>{performer}</strong></div>)}
      </div>
      <p>在往返之間，認識日南。邀請你一起來走傱！</p>
      <a className="event-notice-action" href={sitePath("/motion2026/#1025")}>查看完整活動資訊 ↗</a>
    </section> : <button className="event-notice-reopen" type="button" aria-label="展開最新節目表" onClick={() => setExpanded(true)}>
      <strong>走傱市集｜10/31（六）16:30–21:00</strong><span>音樂演出 17:00–21:00｜五組音樂演出</span>
    </button>}
  </aside>;
}
