import { MobileMenu } from './mobile-menu';
import Link from 'next/link';
import { sitePath } from './site-path';
import { site } from './content';
export type SiteSection = 'home' | 'about' | 'stories' | 'walk' | 'market' | 'exhibition' | 'visit' | 'explore' | 'plants' | 'copyright';
const desktopNavigation = [
  ['about','關於稻站','/about/'], ['stories','地方筆記','/stories/'],
  ['exhibition','往・返展覽','/exhibition/to-and-from/'], ['explore','九里互動地圖','/explore/'], ['plants','日南植物形態室','/plants/'],
  ['walk','走傱日南 2026','/motion2026/'], ['market','市集介紹','/motion2026/market/'], ['visit','交通資訊','/visit/'],
] as const;
const mobileNavigation = [
  ['walk','走傱日南 2026','/motion2026/'], ['market','市集介紹','/motion2026/market/'], ['visit','交通資訊','/visit/'],
  ['home','首頁','/'], ['about','關於稻站','/about/'], ['stories','地方筆記','/stories/'],
  ['exhibition','往・返展覽','/exhibition/to-and-from/'], ['explore','九里互動地圖','/explore/'], ['plants','日南植物形態室','/plants/'],
] as const;
export function SiteHeader({ active }: { active: SiteSection }) {
  const links = desktopNavigation.map(([id,label,path])=><Link key={id} className={active===id?'active':''} href={path} aria-current={active===id?'page':undefined}>{label}</Link>);
  return <><a className="skip-link" href="#content">跳至主要內容</a><header className="site-header">
    <Link className="site-brand site-brand-mark" href="/" aria-label="日南稻站首頁"><span className="site-brand-logo site-brand-logo-primary"><img src={sitePath('/images/rinan-commons-primary-logo.png')} alt="" width="1200" height="1200" /></span></Link>
    <nav className="site-navigation" aria-label="網站主要導覽">{links}</nav>
    <MobileMenu items={mobileNavigation} active={active} />
  </header></>;
}
export function SiteFooter({ note }: { note: string }) {
  return <footer className="commons-footer"><div className="footer-top"><a href={sitePath('/')}><strong>日南稻站</strong><span>RINAN COMMONS</span></a><p>{note}</p><a href="#top" className="to-top">回到頁首 ↑</a></div><div className="footer-bottom"><p>{site.address}<br />{site.opening}</p><nav aria-label="頁尾導覽"><a href={sitePath('/about/')}>關於稻站</a><a href={sitePath('/explore/')}>九里互動地圖</a><a href={sitePath('/plants/')}>日南植物形態室</a><a href={sitePath('/visit/')}>到訪交通</a><a href={sitePath('/exhibition/to-and-from/')}>展覽手冊</a></nav></div><CopyrightLine /></footer>;
}
export function CopyrightLine() {
  return <small className="copyright-line">© 2026 <Link href="/">日南稻站 Rinan Commons</Link><span aria-hidden="true">｜</span><Link href="/copyright/">版權聲明</Link><span aria-hidden="true">｜</span>保留所有權利</small>;
}
