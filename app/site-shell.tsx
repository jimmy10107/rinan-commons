import { MobileMenu } from './mobile-menu';
import { sitePath } from './site-path';
import { site } from './content';
export type SiteSection = 'home' | 'about' | 'stories' | 'walk' | 'exhibition' | 'visit' | 'explore';
const navigation = [
  ['about','關於稻站','/about/'], ['stories','地方筆記','/stories/'],
  ['exhibition','往・返展覽','/exhibition/to-and-from/'], ['walk','走傱日南 2026','/walk/2026/'], ['explore','九里互動地圖','/explore/'], ['visit','到訪交通','/visit/'],
] as const;
export function SiteHeader({ active }: { active: SiteSection }) {
  const links = navigation.map(([id,label,path])=><a key={id} className={active===id?'active':''} href={sitePath(path)} aria-current={active===id?'page':undefined}>{label}</a>);
  return <><a className="skip-link" href="#content">跳至主要內容</a><header className="site-header">
    <a className="site-brand" href={sitePath('/')} aria-label="日南稻站首頁"><span className="site-brand-logo"><img src={sitePath('/partners/rinan-commons.jpg')} alt="" width="86" height="52" /></span><span><strong>日南稻站</strong><small>RINAN COMMONS</small></span></a>
    <nav className="site-navigation" aria-label="網站主要導覽">{links}</nav>
    <MobileMenu items={navigation} active={active} />
  </header></>;
}
export function SiteFooter({ note }: { note: string }) {
  return <footer className="commons-footer"><div className="footer-top"><a href={sitePath('/')}><strong>日南稻站</strong><span>RINAN COMMONS</span></a><p>{note}</p><a href="#top" className="to-top">回到頁首 ↑</a></div><div className="footer-bottom"><p>{site.address}<br />{site.opening}</p><nav aria-label="頁尾導覽"><a href={sitePath('/about/')}>關於稻站</a><a href={sitePath('/explore/')}>九里互動地圖</a><a href={sitePath('/visit/')}>到訪交通</a><a href={sitePath('/exhibition/to-and-from/')}>展覽手冊</a></nav><small>© {new Date().getFullYear()} 日南稻站 Rinan Commons</small></div></footer>;
}
