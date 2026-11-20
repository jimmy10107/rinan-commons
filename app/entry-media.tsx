"use client";

import { useEffect, useState } from "react";
import { Quiz } from "./exhibition/to-and-from/quiz";

type MediaView = "film" | "song" | "quiz" | null;

const filmId = "_ydtsZWwZJk";
const songId = "UjBET5cz8gE";
const seenKey = "rinan-entry-film-seen-v1";

/** A dismissible floating media player for the Rinan Commons film and theme song. */
export function EntryMedia({ autoOpen = true }: { autoOpen?: boolean }) {
  const [view, setView] = useState<MediaView>(null);
  const [ready, setReady] = useState(false);
  const [filmAutoplay, setFilmAutoplay] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    setFilmAutoplay(!reduceMotion && !saveData);
    if (!autoOpen) {
      // Keep the map clear while leaving both media launchers available.
      // Suppressing this preview must not consume the existing seen marker.
      setView(null);
      setReady(true);
      return;
    }
    try {
      if (!window.sessionStorage.getItem(seenKey)) {
        window.sessionStorage.setItem(seenKey, "1");
        setView("film");
      }
    } catch {
      // The launcher remains available when private browsing blocks session storage.
    }
    setReady(true);
  }, [autoOpen]);

  if (!ready || hidden) return null;

  const id = view === "song" ? songId : filmId;
  const title = view === "song" ? "〈走傱日南 2026 主題曲〉" : "《走傱日南2026》日南形象影片";
  const autoplay = view === "song" || filmAutoplay;
  const videoUrl = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&autoplay=${autoplay ? "1" : "0"}&mute=${view === "film" ? "1" : "0"}`;

  return <aside className="entry-media" aria-label="日南小測驗與影音">
    {view ? <div className="entry-media-panel">
      <div className="entry-media-head">
        <div><span>RINAN / 認識日南</span><strong>{view === "quiz" ? "日南到站小測驗" : view === "film" ? "先看一眼日南" : "讓主題曲陪你走傱"}</strong></div>
        <button type="button" className="entry-media-close" aria-label="關閉影音視窗" onClick={() => setView(null)}>×</button>
      </div>
      {view === "quiz" ? <Quiz floating/> : <><button className="entry-quiz-action entry-quiz-action-inline" type="button" onClick={()=>setView("quiz")}><span>完成 8 題，帶走到站紀念章</span><small>約 2–3 分鐘・答完再選擇是否用 LINE 領實體章</small></button><div className="entry-media-screen">
        <iframe key={view} title={title} src={videoUrl} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <p className="entry-media-note">{view === "film" ? "形象影片預設靜音；點播放器可調整聲音。" : "主題曲會在播放器載入後播放；若瀏覽器阻擋自動播放，請再按一次播放。"}</p>
      </>}
      <div className="entry-media-switch" aria-label="切換影音">
        <button type="button" aria-pressed={view === "film"} onClick={() => setView("film")}>形象影片</button>
        <button type="button" aria-pressed={view === "song"} onClick={() => setView("song")}>主題曲</button>
        {view !== "quiz"&&<a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">另開 YouTube ↗</a>}
      </div>
    </div> : <div className="entry-media-launchers">
      <div className="entry-quiz-promo">
        <span className="entry-quiz-eyebrow">到站互動・約 2–3 分鐘</span>
        <strong>你搭上車了嗎？</strong>
        <p>答 8 題認識日南，立即下載紀念章；想領實體章，再用 LINE 驗證即可。</p>
        <ol aria-label="活動流程"><li>答題</li><li>存紀念章</li><li>LINE 領實體章</li></ol>
        <button type="button" className="entry-quiz-action" onClick={()=>setView("quiz")}>開始挑戰日南 8 題</button>
      </div>
      <div className="entry-media-secondary">
        <button type="button" onClick={() => setView("song")}>♫ 聽主題曲</button>
        <button type="button" onClick={() => setView("film")}>▶ 看形象影片</button>
      </div>
      <button type="button" className="entry-media-dismiss" aria-label="關閉影音工具" title="關閉影音工具" onClick={() => setHidden(true)}>×</button>
    </div>}
  </aside>;
}
