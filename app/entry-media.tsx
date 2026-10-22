"use client";

import { useEffect, useState } from "react";

type MediaView = "film" | "song" | null;

const filmId = "_ydtsZWwZJk";
const songId = "UjBET5cz8gE";
const seenKey = "rinan-entry-film-seen-v1";

/** Only one visible YouTube player exists at a time; closing the panel stops it. */
export function EntryMedia() {
  const [view, setView] = useState<MediaView>(null);
  const [ready, setReady] = useState(false);
  const [filmAutoplay, setFilmAutoplay] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    setFilmAutoplay(!reduceMotion && !saveData);
    try {
      if (!window.sessionStorage.getItem(seenKey)) {
        window.sessionStorage.setItem(seenKey, "1");
        setView("film");
      }
    } catch {
      // The launcher still works when private browsing blocks session storage.
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  const id = view === "song" ? songId : filmId;
  const title = view === "song" ? "〈走傱日南 2026 主題曲〉" : "《走傱日南2026》日南形象影片";
  const autoplay = view === "song" || filmAutoplay;
  const videoUrl = `https://www.youtube-nocookie.com/embed/${id}?playsinline=1&rel=0&autoplay=${autoplay ? "1" : "0"}&mute=${view === "film" ? "1" : "0"}`;

  return <aside className="entry-media" aria-label="日南稻站影音">
    {view ? <div className="entry-media-panel">
      <div className="entry-media-head">
        <div><span>RINAN / 聽見日南</span><strong>{view === "film" ? "先看一眼日南" : "讓主題曲陪你走傱"}</strong></div>
        <button type="button" className="entry-media-close" aria-label="關閉影音視窗" onClick={() => setView(null)}>×</button>
      </div>
      <div className="entry-media-screen">
        <iframe key={view} title={title} src={videoUrl} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />
      </div>
      <p className="entry-media-note">{view === "film" ? "宣傳片預設靜音；點播放器可調整聲音。" : "按下播放主題曲；若瀏覽器阻擋自動播放，請在播放器內再按一次播放。"}</p>
      <div className="entry-media-switch" aria-label="切換影音">
        <button type="button" aria-pressed={view === "film"} onClick={() => setView("film")}>形象影片</button>
        <button type="button" aria-pressed={view === "song"} onClick={() => setView("song")}>主題曲</button>
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer">另開 YouTube ↗</a>
      </div>
    </div> : <div className="entry-media-launchers">
      <button type="button" onClick={() => setView("song")}>♫ 聽主題曲</button>
      <button type="button" onClick={() => setView("film")}>▶ 看宣傳片</button>
    </div>}
  </aside>;
}
