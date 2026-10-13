import type { Metadata } from "next";
import { sitePath } from "../../site-path";
import { marketHtml } from "./market-html";

// 預覽用隱藏頁：不在任何選單或 sitemap 中，且不被搜尋引擎收錄。
// 正式上線時把資料夾改名為 market、移除 robots 設定並加入 sitemap。
export const metadata: Metadata = {
  title: "走傱市集（預覽）",
  description: "走傱日南 2026 走傱市集｜10/24（六）17:00–21:30 日南車站旁廣場，場地配置圖與攤位介紹。",
  robots: { index: false, follow: false },
};

export default function MotionMarketPage() {
  return (
    <main className="market-page" id="top" style={{ background: "#F7F4EC" }}>
      <header className="site-header motion-header">
        <a className="site-brand site-brand-mark" href={sitePath("/motion2026/")} aria-label="走傱日南 2026 活動首頁">
          <span className="site-brand-logo site-brand-logo-primary"><img src={sitePath("/images/rinan-commons-primary-logo.png")} alt="" width="1200" height="1200" /></span>
        </a>
        <nav className="site-navigation" aria-label="網站主要導覽">
          <a href={sitePath("/motion2026/")}>走傱日南 2026</a>
          <a className="active" href={sitePath("/motion2026/market-preview/")} aria-current="page">走傱市集</a>
        </nav>
      </header>

      <div dangerouslySetInnerHTML={{ __html: marketHtml.replaceAll("__BASE__", sitePath("")) }} />

      <footer className="site-footer motion-footer">
        <div className="footer-identity"><strong>日南稻站 Rinan Commons</strong><span>437 臺中市大甲區孟春里中山路二段 1 號對面</span></div>
        <div className="footer-meta">
          <small><a href={sitePath("/motion2026/")} style={{ color: "inherit" }}>回到走傱日南 2026 活動頁</a>・攤位內容以最終公告為準</small>
          <nav className="social-links" aria-label="日南稻站社群連結">
            <a href="https://www.instagram.com/rinan.commons" target="_blank" rel="noreferrer" aria-label="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-dot" cx="17.5" cy="6.5" r="1" /></svg></a>
            <a href="https://www.facebook.com/rinan.commons?locale=zh_TW" target="_blank" rel="noreferrer" aria-label="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.6 1.7-1.6H18V3.8c-.3 0-1.4-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H8.5v3h2.8v8h3.2Z" /></svg></a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
