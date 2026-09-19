import Link from 'next/link';
import { ResponsivePhoto } from './responsive-photo';
import { SiteFooter, SiteHeader } from './site-shell';
import { sitePath } from './site-path';
import { articles, site, photoSource } from './content';

export default function HomePage() {
  return <main className="commons-page cis-theme" id="top">
    <SiteHeader active="home" />
    <section className="commons-hero" id="content">
      <div className="hero-editorial">
        <p className="kicker">臺中・海線・日南 <span>RINAN COMMONS</span></p>
        <h1>在往返之間，<br /><em>認識日南。</em></h1>
        <p className="hero-deck">車站旁，一個可以停下來休息的地方！<br />看看展、坐一下，再往日南裡走。</p>
        <Link className="solid-link" href={'/about/'}>走進日南稻站 <span aria-hidden="true">→</span></Link>
        <div className="hero-footnote"><span>從這裡出發，也從這裡回來。</span><span>海線・日南車站旁</span></div>
      </div>
      <figure className="hero-photo"><ResponsivePhoto src="/images/rinan-station.jpg" alt="日南車站的木造站房、月台與鐵軌" priority sizes="(max-width: 760px) calc(100vw - 40px), (max-width: 1200px) 48vw, 650px" /><figcaption>日南車站｜日常往返的地方 <a href={photoSource} target="_blank" rel="noreferrer">影像來源：臺中市文化資產處</a></figcaption></figure>
    </section>
    <Link className="announcement" href={'/walk/2026/'}><span className="announcement-label">下一次相遇</span><strong>10.24 — 25</strong><span>走傱日南 2026 <small>開幕・音樂・市集・走讀</small></span><b>查看活動 <span aria-hidden="true">→</span></b></Link>
    <nav className="start-here" aria-label="快速找到想看的內容"><Link href={'/about/'}><span>01 / 認識稻站</span><strong>這裡是什麼地方？</strong><b aria-hidden="true">→</b></Link><Link href={'/exhibition/to-and-from/'}><span>02 / 看一場展</span><strong>往・返，閱讀日南</strong><b aria-hidden="true">→</b></Link><Link href={'/visit/'}><span>03 / 準備出發</span><strong>搭火車，來日南</strong><b aria-hidden="true">→</b></Link></nav>
    <section className="editorial-section home-introduction">
      <div className="section-mast"><p className="kicker">01 / 一個地方的入口</p><span>ABOUT THE COMMONS</span></div>
      <div className="introduction-grid"><h2>下了火車，<br />還有好多日南。</h2><div><p>木造車站、田野、聚落，和每天為生活走傱的人。熟悉的日南，也有你還沒遇見的樣子。</p><p>我們整理車站旁的舊空間，把地方故事、展覽與交流慢慢帶進來。讓離開、回來、留下與初次抵達的人，有一個可以相遇的地方。</p><Link className="underlined-link" href={'/about/'}>空間的故事與願景 →</Link></div></div>
    </section>
    <section className="editorial-section current-section">
      <div className="section-mast"><p className="kicker">02 / 在日南，正在發生</p><span>WHAT'S ON</span></div>
      <div className="feature-pair">
        <Link href={'/walk/2026/'} className="event-feature"><div className="feature-meta"><span>年度活動</span><span>2026.10.24—25</span></div><p className="feature-english">10.24 <span>—</span> 10.25</p><h2>走傱日南<span>2026</span></h2><p>午後看影像，傍晚聽音樂。<br />跟著走讀，把日南走進生活。</p><b>節目、時間與報名資訊 →</b></Link>
        <Link href={'/exhibition/to-and-from/'} className="exhibit-feature"><div className="feature-meta"><span>日南稻站開館展</span><span>TO AND FROM</span></div><div className="exhibit-title">往<span>・</span>返</div><p className="chapter-inline">往 / 走傱 / 返 / 生根</p><p>離開之後，怎麼看見家鄉？<br />在人的往返裡，閱讀日南。</p><b>進入展覽・閱讀手冊 →</b></Link>
      </div>
    </section>
    <section className="editorial-section journal-section">
      <div className="section-mast"><p className="kicker">03 / 慢慢讀日南</p><Link href={'/stories/'} className="underlined-link">地方筆記 →</Link></div>
      <div className="story-teasers">{articles.map((article,index)=><Link href={`/stories/${article.slug}/`} key={article.id} className="story-teaser">{article.image ? <ResponsivePhoto src={article.image} alt={article.imageAlt} width={640} height={420} /> : <div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br />休息一下。</strong><small>日南稻站</small></div>}<div className="teaser-copy"><p className="kicker">{article.category} <span>0{index+1}</span></p><h3>{article.title}</h3><p>{article.summary}</p><span className="read-story">閱讀筆記 → <small>約 {article.readingMinutes} 分鐘</small></span></div></Link>)}</div>
    </section>
    <section className="visit-invitation"><p className="kicker">下一站，日南。</p><h2>來坐一下。</h2><div><p>{site.address}<br />{site.opening}</p><Link className="solid-link light" href={'/visit/'}>安排到訪 <span>→</span></Link></div></section>
    <SiteFooter note="在往返之間，認識日南。" />
  </main>;
}
