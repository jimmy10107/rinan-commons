'use client';
import { useEffect, useState } from 'react';
import { ResponsivePhoto } from '../responsive-photo';
import { sitePath } from '../site-path';
import { StoryPhoto } from './story-photo';
import type { StoryArticle } from './story-types';

const categoryIds: Record<string, string> = { '全部': '', '鐵道文史': 'railway', '空間日常': 'everyday', '人物故事': 'people' };
export function StoryIndex({ articles }: { articles: StoryArticle[] }) {
  const [category, setCategory] = useState('全部');
  const [query, setQuery] = useState('');
  const categories = ['全部', ...new Set(articles.map(a => a.category))];
  useEffect(() => {
    const readCategory = () => {
      const id = new URLSearchParams(window.location.search).get('category');
      setCategory(Object.keys(categoryIds).find(key => categoryIds[key] === id) || '全部');
    };
    readCategory();
    window.addEventListener('popstate', readCategory);
    return () => window.removeEventListener('popstate', readCategory);
  }, []);
  function selectCategory(next: string) {
    setCategory(next);
    const url = new URL(window.location.href);
    if (categoryIds[next]) url.searchParams.set('category', categoryIds[next]);
    else url.searchParams.delete('category');
    window.history.pushState(null, '', url);
  }
  const visible = [...articles]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || (a.seriesNumber || 0) - (b.seriesNumber || 0))
    .filter(a => (category === '全部' || a.category === category) && `${a.title} ${a.summary} ${a.category} ${a.sections.map(s => s.text).join(' ')}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <section className="editorial-section journal-index">
    <div className="journal-controls">
      <div className="filter-buttons" aria-label="筆記分類">{categories.map(c => <button key={c} type="button" onClick={() => selectCategory(c)} aria-pressed={c === category}>{c}</button>)}</div>
      <label className="journal-search"><span>搜尋筆記</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="標題、人物、關鍵字" /></label>
    </div>
    {category === '人物故事' && <div className="people-series-intro"><p className="kicker">PEOPLE OF RINAN</p><h2>走傱的日南人</h2><p>在往返之間，認識日南的人與生活。</p></div>}
    {category === '鐵道文史' && <div className="people-series-intro"><p className="kicker">RAILWAY / HISTORY</p><h2>從日南車站，讀懂地方的往返</h2><p>沿著木造站房與海線鐵道，認識日南的歷史和今天的生活。</p></div>}
    {category === '空間日常' && <div className="people-series-intro"><p className="kicker">SPACE / EVERYDAY</p><h2>在日南，留一點停下來的時間</h2><p>從舊營房重新打開的門，到田野、展覽與人們的相遇。</p></div>}
    <p className="result-count" role="status">{visible.length} 篇筆記</p>
    <div className="journal-results">{visible.map((a, i) => <a key={a.id} className="journal-result" href={sitePath(`/stories/${a.slug}/`)}>
      {a.cover ? <StoryPhoto photo={a.cover} priority={i === 0} sizes="(max-width: 760px) calc(100vw - 44px), 480px" /> : a.image ? <ResponsivePhoto src={a.image} alt={a.imageAlt} width={640} height={420} /> : <div className="type-cover" aria-hidden="true"><span>COMMONS / NOTES</span><strong>坐一下，<br />休息一下。</strong></div>}
      <div><p className="kicker">{a.category} / 約 {a.readingMinutes} 分鐘</p><h2>{a.title}</h2><p>{a.summary}</p><span className="underlined-link">閱讀{a.category === '人物故事' ? '故事' : '筆記'} ↗</span></div>
    </a>)}</div>
    {!visible.length && <div className="empty-results"><h2>還沒有符合的筆記。</h2><p>換個關鍵字，或看看所有內容。</p><button className="solid-link" onClick={() => { selectCategory('全部'); setQuery(''); }}>顯示全部筆記</button></div>}
  </section>;
}
