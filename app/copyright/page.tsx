import type { Metadata } from 'next';
import { SiteFooter, SiteHeader } from '../site-shell';

export const metadata: Metadata = {
  title: '版權聲明 Copyright Notice｜日南稻站',
  description: '日南稻站 Rinan Commons 網站內容、合作單位素材與引用授權說明。',
  alternates: { canonical: 'https://www.rinancommons.com/copyright/' },
};

export default function CopyrightPage() {
  return <main className="commons-page" id="top">
    <SiteHeader active="copyright" />
    <header className="page-intro" id="content">
      <p className="kicker">COPYRIGHT / 版權聲明</p>
      <h1>版權聲明 <span className="copyright-english">Copyright Notice</span></h1>
    </header>
    <section className="copyright-content editorial-section" aria-label="版權與授權說明">
      <p>本網站所刊載之文字、照片、影像、插圖、地圖、版面設計與標誌，除另有標示外，著作權均屬日南稻站 Rinan Commons 所有，或已取得權利人授權使用。</p>
      <p>合作單位、攤商與演出者所提供之名稱、標誌及照片，權利歸原權利人所有，本站僅於活動介紹範圍內使用。</p>
      <p>未經書面同意，請勿重製、改作、散布、公開傳輸或作商業使用。</p>
      <p>新聞報導、教學、評論等合理範圍內之引用，請註明出處「日南稻站 Rinan Commons」並附上原文網址。</p>
      <p>轉載、授權或媒體合作請洽：<a href="mailto:rinancommons@gmail.com">rinancommons@gmail.com</a></p>
      <p>活動資訊以官方公告為準。</p>
      <p className="copyright-updated">最後更新：2026 年 10 月</p>
    </section>
    <SiteFooter note="在往返之間，認識日南。" />
  </main>;
}
