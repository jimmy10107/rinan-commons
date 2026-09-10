import { SiteFooter, SiteHeader } from './site-shell';
import { sitePath } from './site-path';
import { articles, site, photoSource } from './content';

export default function HomePage() {
  return <main className="commons-page" id="top">
    <SiteHeader active="home" />
    <section className="commons-hero" id="content">
      <div className="hero-editorial">
        <p className="kicker">臺中・海線・日南 <span>RINAN COMMONS</span></p>
        <h1>在往返之間，<br /><em>認識日南。</em></h1>
        <p className="hero-deck">車站旁，留一個可以停下來的地方。<br />看看展、坐一下，再往日南裡走。</p>
        <a className="solid-link" href={sitePath('/about/')}>走進日南稻站 <span aria-hidden="true">↗</span></a>
        <div className="hero-footnote"><span>從這裡出發，也從這裡回來。</span><span>24°22′ N · 120°39′ E</span></div>
      </div>
      <figure className="hero-photo"><img src={sitePath('/images/rinan-station.jpg')} alt="日南車站的木造站房、月台與鐵軌" fetchPriority="high" width="1200" height="800" /><figcaption>日南車站｜日常往返的地方 <a href={photoSource} target="_blank" rel="noreferrer">影像來源：臺中市文化資產處</a></figcaption></figure>
    </section>
    <a className="announcement" href={sitePath('/walk/2026/')}><span className="announcement-label">下一次相遇</span><strong>10.24 — 25</strong><span>走傱日南 2026 <small>開幕・音樂・市集・走讀</small></span><b>查看活動 <span aria-hidden="true">↗</span></b></a>
    <section className="editorial-section home-introduction">
      <div className="section-mast"><p className="kicker">01 / 一個地方的入口</p><span>ABOUT THE COMMONS</span></div>
      <div className="introduction-grid"><h2>下了火車，<br />還有好多日南。</h2><div><p>木造車站、田野、聚落，和每天為生活走傱的人。熟悉的日南，也有你還沒遇見的樣子。</p><p>我們整理車站旁的舊空間，把地方故事、展覽與交流慢慢帶進來。讓離開、回來、留下與初次抵達的人，有一個可以相遇的地方。</p><a className="underlined-link" href={sitePath('/about/')}>空間的故事與願景 ↗</a></div></div>
    </section>
    <section className="editorial-section current-section">
      <div className="section-mast"><p className="kicker">02 / 在日南，正在發生</p><span>WHAT'S ON</span></div>
      <div className="feature-pair">
        <a href={sitePath('/walk/2026/')} className="event-feature"><div className="feature-meta"><span>年度活動</span><span>2026.10.24—25</span></div><p className="feature-english">RINAN<br />IN MOTION</p><h2>走傱日南<span>2026</span></h2><p>午後看影像，傍晚聽音樂。<br />跟著走讀，把日南走進生活。</p><b>節目、時間與報名資訊 ↗</b></a>
        <a href={sitePath('/exhibition/to-and-from/')} className="exhibit-feature"><div className="feature-meta"><span>日南稻站開館展</span><span>TO AND FROM</span></div><div className="exhibit-title">往<span>・</span>返</div><p className="chapter-inline">往 / 走傱 / 返 / 生根</p><p>離開之後，怎麼看見家鄉？<br />在人的往返裡，閱讀日南。</p><b>進入展覽・閱讀手冊 ↗</b></a>
      </div>
    </section>
    <section className="editorial-section journal-section">
      <div className="section-mast"><p className="kicker">03 / 慢慢讀日南</p><a href={sitePath('/stories/')} className="underlined-link">地方筆記 ↗</a></div>
      <div className="story-teasers">{articles.map((article,index)=><a href={sitePath(`/stories/${article.slug}/`)} key={article.id} className="story-teaser">{article.image ? <img src={sitePath(article.image)} alt={article.imageAlt} width="640" height="420" loading="lazy" /> : <div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br />休息一下。</strong><small>日南稻站</small></div>}<div className="teaser-copy"><p className="kicker">{article.category} <span>0{index+1}</span></p><h3>{article.title}</h3><p>{article.summary}</p><span className="read-story">閱讀筆記 ↗</span></div></a>)}</div>
    </section>
    <section className="visit-invitation"><p className="kicker">下一站，日南。</p><h2>來坐一下。</h2><div><p>{site.address}<br />{site.opening}</p><a className="solid-link light" href={sitePath('/visit/')}>安排到訪 <span>↗</span></a></div></section>
    <SiteFooter note="在往返之間，認識日南。" />
  </main>;
}
