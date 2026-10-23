import { sitePath } from "../../site-path";
import { marketHtml } from "./market-html";
import { site } from "../../content";
import { CopyrightLine } from "../../site-shell";
import MarketDialogs from "./market-dialogs";

export default function MarketPageLayout({ preview = false }: { preview?: boolean }) {
  return (
    <main className="market-page" id="top" style={{ background: "#F7F4EC" }}>
      <header className="site-header motion-header">
        <a className="site-brand site-brand-mark" href={sitePath("/motion2026/")} aria-label="走傱日南 2026 活動首頁">
          <span className="site-brand-logo site-brand-logo-primary"><img src={sitePath("/images/rinan-commons-primary-logo.png")} alt="" width="1200" height="1200" /></span>
        </a>
        <nav className="site-navigation" aria-label="網站主要導覽">
          <a href={sitePath("/")}>日南稻站首頁</a>
          <a href={sitePath("/motion2026/")}>走傱日南 2026</a>
          <a className="active" href={sitePath(preview ? "/motion2026/market-preview/" : "/motion2026/market/")} aria-current="page">走傱市集{preview ? "（預覽）" : ""}</a>
        </nav>
      </header>

      <section className="market-status-inline" aria-label="走傱市集延期公告"><strong>10/24（六）走傱市集確定延期</strong><p>原訂市集不依 10/24 時程舉行；10/25（日）相關活動仍視天候及安全狀況評估，尚待確認。新的日期及活動安排將另行公告。</p></section>
      <div dangerouslySetInnerHTML={{ __html: marketHtml.replaceAll("__BASE__", sitePath("")) }} />
      <MarketDialogs />

      <footer className="site-footer motion-footer">
        <div className="footer-identity"><strong>日南稻站 Rinan Commons</strong><span>{site.address}</span></div>
        <div className="footer-meta">
          <small><a href={sitePath("/motion2026/")} style={{ color: "inherit" }}>回到走傱日南 2026 活動頁</a>・攤位內容以最終公告為準</small>
          <nav className="social-links" aria-label="日南稻站社群連結">
            <a href="https://www.instagram.com/rinan.commons" target="_blank" rel="noreferrer" aria-label="Instagram"><svg aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle className="social-dot" cx="17.5" cy="6.5" r="1" /></svg></a>
            <a href="https://www.facebook.com/rinan.commons?locale=zh_TW" target="_blank" rel="noreferrer" aria-label="Facebook"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14.5 21v-8h2.8l.4-3h-3.2V8.1c0-.9.3-1.6 1.7-1.6H18V3.8c-.3 0-1.4-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H8.5v3h2.8v8h3.2Z" /></svg></a>
          </nav>
        </div>
        <CopyrightLine />
      </footer>
    </main>
  );
}
