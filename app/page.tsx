import { ResponsivePhoto } from './responsive-photo';
import { SiteFooter, SiteHeader } from './site-shell';
import { sitePath } from './site-path';
import { articles, site } from './content';
import { StoryPhoto } from './stories/story-photo';
import { compareStories } from './stories/story-order';

export default function HomePage() {
  return <main className="commons-page" id="top">
    <SiteHeader active="home" />
    <section className="commons-hero" id="content">
      <div className="hero-editorial">
        <p className="kicker">臺中・海線・日南 <span>RINAN COMMONS</span></p>
        <h1>在往返之間，<br /><em>認識日南。</em></h1>
        <p className="hero-deck">車站旁，一個可以停下來休息的地方。</p>
        <a className="solid-link" href={sitePath('/about/')}>走進日南稻站 <span aria-hidden="true">↗</span></a>
        <div className="hero-footnote"><span>從這裡出發，也從這裡回來。</span><span>海線・日南車站旁</span></div>
      </div>
      <figure className="hero-photo"><ResponsivePhoto src="/images/commons-exterior-1200.webp" alt="日南稻站外側的舊守橋營房、休息平台與植栽" width={1200} height={900} priority /><figcaption>日南稻站外側｜舊守橋營房與休息平台</figcaption></figure>
    </section>
    <a className="announcement" href={sitePath('/passport/#events')}><span className="announcement-label">最新活動公告</span><strong>11.16<small>（一）</small><br /><small>11.21（六）</small></strong><span>十一月，來稻站坐坐 <small>日南印相製作｜《走傱的日南人》紀錄片交流會</small></span><b>查看兩場活動 <span aria-hidden="true">↗</span></b></a>
    <nav className="start-here" aria-label="快速找到想看的內容"><a href={sitePath('/explore/')}><span>01 / 九里地圖</span><strong>從九里，看日南</strong><b aria-hidden="true">↗</b></a><a href={sitePath('/passport/#events')}><span>02 / 活動</span><strong>十一月稻站活動</strong><b aria-hidden="true">↗</b></a><a href={sitePath('/visit/')}><span>03 / 交通</span><strong>搭火車，來日南</strong><b aria-hidden="true">↗</b></a></nav>
    <section className="editorial-section home-introduction">
      <div className="section-mast"><p className="kicker">01 / 一個地方的入口</p><span>ABOUT THE COMMONS</span></div>
      <div className="introduction-grid"><h2>下了火車，<br />還有好多日南。</h2><div><p>木造車站、田野與聚落，海邊的風、工業區裡的日常，還有廟口延續的信仰。每天為生活走傱的人，讓熟悉的日南，也有你還沒遇見的樣子。</p><p>這裡原本是關著的舊軍營，曾是一般人不能自由踏入的禁區。現在，我們把門慢慢打開，讓地方故事、展覽與交流走進來，也讓離開、回來、留下與初次抵達的人，有一個可以相遇的地方。</p><a className="underlined-link" href={sitePath('/about/#place')}>空間的故事與願景 ↗</a></div></div>
    </section>
    <section className="editorial-section current-section">
      <div className="section-mast"><p className="kicker">02 / 近期活動</p><span>WHAT&apos;S ON</span></div>
      <div className="feature-pair">
        <a href={sitePath('/passport/#events')} className="event-feature home-events-feature"><div className="feature-meta"><span>最新活動公告</span><span>2026.11</span></div><p className="feature-english">NOVEMBER<br />AT THE COMMONS</p><h2>十一月稻站活動<span>2026</span></h2><div className="home-event-list"><article><time dateTime="2026-11-16T19:00:00+08:00">11.16（一）19:00</time><h3>快閃活動｜日南印相製作</h3><p>把手機裡最日南的照片，留在一張印相裡。</p></article><article><time dateTime="2026-11-21T19:00:00+08:00">11.21（六）19:00</time><h3>《走傱的日南人》紀錄片交流會</h3><p>從人物與地方故事出發，聊聊每個人記憶中的日南。</p></article></div><p className="registration-status">地點｜日南稻站</p><b>查看活動與走傱護照資訊 ↗</b></a>
        <a href={sitePath('/exhibition/to-and-from/')} className="exhibit-feature"><div className="feature-meta"><span>日南稻站開館展</span><span>TO AND FROM</span></div><div className="exhibit-title">往<span>・</span>返</div><p className="chapter-inline">往 / 走傱 / 返 / 生根</p><p>離開之後，怎麼看見家鄉？<br />在人的往返裡，閱讀日南。</p><b>進入展覽・閱讀手冊 ↗</b></a>
      </div>
    </section>
    <section className="editorial-section journal-section">
      <div className="section-mast"><p className="kicker">03 / 慢慢讀日南</p><a href={sitePath('/stories/')} className="underlined-link">地方筆記 ↗</a></div>
      <div className="story-teasers">{[...articles].sort(compareStories).map((article,index)=><a href={sitePath(`/stories/${article.slug}/`)} key={article.id} className="story-teaser">{article.cover ? <StoryPhoto photo={article.cover} sizes="(max-width: 760px) calc(100vw - 46px), 640px" /> : article.image ? <ResponsivePhoto src={article.image} alt={article.imageAlt} width={640} height={420} /> : <div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br />休息一下。</strong><small>日南稻站</small></div>}<div className="teaser-copy"><p className="kicker">{article.category} <span>約 {article.readingMinutes} 分鐘・0{index+1}</span></p><h3>{article.title}</h3><p>{article.summary}</p><span className="read-story">閱讀筆記 ↗</span></div></a>)}</div>
    </section>
    <section className="visit-invitation"><p className="kicker">下一站，日南。</p><h2>來坐一下。</h2><div><p>{site.address}<br />{site.opening}</p><a className="solid-link light" href={sitePath('/visit/')}>安排到訪 <span>↗</span></a></div></section>
    <SiteFooter note="在往返之間，認識日南。" />
  </main>;
}
