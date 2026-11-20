"use client";

import {useEffect, useState} from "react";
import {Quiz} from "./exhibition/to-and-from/quiz";

/** A site-wide, dismissible entry point for the Rinan eight-question game. */
export function EntryMedia({autoOpen: _autoOpen = true}: {autoOpen?: boolean}) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (hidden) return null;

  return <aside className={`entry-media entry-quiz-only${open ? " is-open" : ""}`} aria-label="日南到站互動問答">
    {open ? <div className="entry-media-panel">
      <div className="entry-media-head">
        <div><span>RINAN QUIZ / 到站互動</span><strong>日南到站小測驗</strong></div>
        <button type="button" className="entry-media-close" aria-label="收起互動問答" onClick={() => setOpen(false)}>×</button>
      </div>
      <Quiz floating/>
    </div> : <div className="entry-media-launchers entry-quiz-card" role="group" aria-label="開始日南八題互動問答">
      <button type="button" className="entry-quiz-card-main" onClick={() => setOpen(true)}>
        <span className="entry-quiz-eyebrow">到站互動・約 2–3 分鐘</span>
        <strong>你搭上車了嗎？</strong>
        <p>答 8 題認識日南，完成後立即下載到站紀念章。</p>
        <ol aria-label="活動流程"><li>答題</li><li>存紀念章</li><li>LINE 領實體章</li></ol>
        <span className="entry-quiz-action">開始挑戰日南 8 題</span>
      </button>
      <button type="button" className="entry-media-dismiss" aria-label="關閉互動問答入口" title="關閉互動問答入口" onClick={() => setHidden(true)}>×</button>
    </div>}
  </aside>;
}
