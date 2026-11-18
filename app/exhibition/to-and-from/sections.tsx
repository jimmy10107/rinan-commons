import { sitePath } from '../../site-path';
import { galleryUrl, makerUrl, people, plantUrl, wallUrl } from './exhibit-data';
import { WallView } from './wall-view';
import s from './exhibit.module.css';

const ext = {target: '_blank', rel: 'noopener noreferrer'};
const asset = (id: string, width: number) => sitePath('/exhibit/' + id + '-' + width + '.webp');
const srcset = (id: string, widths: number[]) => widths.map(w => asset(id,w) + ' ' + w + 'w').join(', ');
export function People() {
  return <section id="people" aria-labelledby="people-title" className={s.band}>
    <p className={s.kicker}>01 / 人物故事</p><h2 id="people-title">走傱的日南人</h2>
    <p className={s.lede}>有人留在田裡，有人遠行後回來，也有人從遠方來到日南。從三幅掛幅與人物專訪，讀讀他們怎麼回答同一個問題：哪裡是家？</p>
    <div className={s.people}>{people.map(p => <article key={p.id} className={s.person}>
      <img src={asset(p.id,360)} srcSet={srcset(p.id,[360,600,900])} sizes="(min-width: 800px) 270px, (max-width: 365px) 200px, 132px" width={360} height={720} alt={p.theme + '・' + p.name + '人物掛幅'} loading="lazy" decoding="async" />
      <div><p className={s.kicker}>{p.theme} / {p.en}</p><h3>{p.name}</h3><p className={s.role}>{p.role}</p><p>{p.summary}</p>
        <a className={s.textLink} aria-label={'閱讀' + p.name + '的人物專訪'} href={sitePath('/stories/' + p.slug + '/')}>閱讀人物專訪 →</a>
        <details><summary>閱讀掛幅文字</summary><p>{p.en}｜{p.role}・{p.name}</p><strong>{p.title}</strong><p>{p.subtitle}</p><a href={p.url} {...ext}>{p.resource} ↗</a></details>
      </div></article>)}</div>
    <p className={s.credit}>三幅人物布條版面設計｜宮田寅成 Miyada Toranari<br/>輸出製作｜大作創意</p>
  </section>;
}
export function Gallery() {
  return <section id="online-gallery" aria-labelledby="gallery-title" className={s.band}>
    <div className={s.gallery}><div><p className={s.kicker}>02 / 線上展廳</p><h2 id="gallery-title">線上互動展廳</h2>
      <p>走進以日南稻站展件構成的線上空間。從地方地圖、時間軸到人物掛幅，你可以自己選一條路線，慢慢看。</p>
      <p className={s.credit}>線上互動展廳製作｜大作創意・黃保翔</p><a className={s.textLink} href={makerUrl} {...ext}>認識這次的設計與製作 ↗</a></div>
      <figure><a className={s.galleryLink} href={galleryUrl} {...ext}><img alt="展廳預覽：地方地圖、時間軸與懸掛的人物布條" width={1200} height={750} src={asset('gallery',640)} srcSet={srcset('gallery',[640,1200])} sizes="(min-width: 800px) 55vw, 92vw" loading="lazy" decoding="async"/>
        <span>日南稻站線上互動展廳<strong>進入展廳 ↗</strong></span></a></figure>
    </div></section>;
}
export function Garden() {
  return <section id="living-wall" aria-labelledby="garden-title" className={s.band}>
    <p className={s.kicker}>03 / 一起參與</p><h2 id="garden-title">種下日南，日南生根</h2>
    <p className={s.lede}>一起種下日南吧！🌱 在雲端找到你的命定植物，把它種進大家的花園。等有一天來到日南稻站，也可以在現場的植生牆找找屬於你的那一株。</p>
    <div className={s.actions}><a className={s.primary} href={plantUrl}>開始種下日南</a><a className={s.textLink} href={wallUrl} {...ext}>找找我的植物 ↗</a></div>
    <WallView/>
    <div className={s.instructions}><details><summary>怎麼種下？查看 5 步驟</summary>
      <p>日南這片土地，孕育著豐富的能量，也長出幾種特色鮮明的植物。邀請你透過小小的互動，找到自己的命定植物。一起種下植物，也為日南稻站添一份成長的養分。</p>
      <p>歡迎來到現場種植，看著自己的植物飛入日南稻站的大花園！也可以先在雲端種下，等有一天走進台中日南，再到稻站的植生牆上，找找屬於你的那一株。🌿</p>
      <ol><li>掃描 QR Code 或點選「開始種下日南」。</li><li>填寫名字或綽號，完成互動。</li><li>找到你的命定植物。</li><li>按下「種下」，到植生牆找找自己的植物。</li><li>分享給朋友，邀請更多人一起種下日南！</li></ol><p>在往返之間，認識日南。歡迎到台中日南的空間交流！</p></details>
      <details><summary>改用其他手機掃描</summary><img src={sitePath('/exhibit/planting-qr.svg')} width="190" height="190" loading="lazy" alt="用手機掃描，開啟 LINE 種植入口"/><p><a href={plantUrl}>直接開啟種植連結 →</a></p></details></div>
  </section>;
}
export function Credits() {
  return <section id="credits" aria-labelledby="credits-title" className={s.band}><p className={s.kicker}>COLOPHON / 製作名錄</p><h2 id="credits-title">創作與設計</h2>
    <dl className={s.credits}>
      <div><dt>線上互動展廳製作</dt><dd>大作創意・黃保翔 <a href={makerUrl} {...ext}>製作介紹 ↗</a></dd></div>
      <div><dt>「走傱日南」標準字設計</dt><dd>王皓正 <a href="https://www.instagram.com/bobwang888/" {...ext}>Instagram ↗</a><a href="mailto:BobWang.design@gmail.com">Email</a></dd></div>
      <div><dt>稻站介紹珍珠板、三幅人物布條版面設計</dt><dd>宮田寅成 Miyada Toranari <a href="https://www.instagram.com/tiggersuccess/" {...ext}>Instagram ↗</a><a href="mailto:miyator1802@gmail.com">Email</a></dd></div>
    </dl></section>;
}
