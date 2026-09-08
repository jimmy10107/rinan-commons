import { sitePath } from "./site-path";

export type SiteSection = "home" | "walk" | "exhibition";

export function SiteHeader({ active }: { active: SiteSection }) {
  return (
    <header className="site-header">
      <a className="site-brand" href={sitePath("/")} aria-label="日南稻站首頁">
        <span className="site-brand-logo"><img src={sitePath("/partners/rinan-commons.jpg")} alt="" /></span>
        <span><strong>日南稻站</strong><small>RINAN COMMONS</small></span>
      </a>
      <nav className="site-navigation" aria-label="網站主要導覽">
        <a className={active === "home" ? "active" : ""} href={sitePath("/")} aria-current={active === "home" ? "page" : undefined}>空間</a>
        <a className={active === "walk" ? "active" : ""} href={sitePath("/walk/2026/")} aria-current={active === "walk" ? "page" : undefined}>走傱日南 2026</a>
        <a className={active === "exhibition" ? "active" : ""} href={sitePath("/exhibition/to-and-from/")} aria-current={active === "exhibition" ? "page" : undefined}>往・返</a>
      </nav>
    </header>
  );
}

export function SiteFooter({ note }: { note: string }) {
  return (
    <footer className="site-footer">
      <strong>日南稻站 Rinan Commons</strong>
      <span>437 臺中市大甲區孟春里中山路二段 1 號對面</span>
      <small>{note}</small>
    </footer>
  );
}
