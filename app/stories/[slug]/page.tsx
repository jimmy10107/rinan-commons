import { Fragment } from 'react';
import { ResponsivePhoto } from '../../responsive-photo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { articles, photoSource } from '../../content';
import { sitePath } from '../../site-path';
import { SiteHeader, SiteFooter } from '../../site-shell';
import { StoryPhoto, StoryGallery } from '../story-photo';
import '../stories.css';

export const dynamicParams = false;
export function generateStaticParams() { return articles.map(a => ({ slug: a.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = articles.find(a => a.slug === slug);
  if (!a) return {};
  const url = `https://www.rinancommons.com/stories/${a.slug}/`;
  return { title: a.title, description: a.summary, alternates: { canonical: url },
    openGraph: { type: 'article', locale: 'zh_TW', siteName: '日南稻站 Rinan Commons', title: a.title, description: a.summary, url,
      modifiedTime: a.updatedAt,
      ...(a.cover ? { images: [{ url: a.cover.src, width: a.cover.width, height: a.cover.height, alt: a.cover.alt }] } : {}) },
    twitter: { card: 'summary_large_image', title: a.title, description: a.summary, ...(a.cover ? { images: [a.cover.src] } : {}) },
  };
}
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find(a => a.slug === slug);
  if (!a) notFound();
  const people = a.category === '人物故事';
  const categoryId = people ? 'people' : a.category === '鐵道文史' ? 'railway' : 'everyday';
  const url = `https://www.rinancommons.com/stories/${a.slug}/`;
  const schema = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'BlogPosting', '@id': `${url}#article`, headline: a.title, description: a.summary,
      mainEntityOfPage: url, url, inLanguage: 'zh-Hant', articleSection: a.category, dateModified: a.updatedAt,
      author: { '@type': 'Organization', name: '日南稻站', url: 'https://www.rinancommons.com/about/' },
      publisher: { '@type': 'Organization', name: '日南稻站 Rinan Commons', url: 'https://www.rinancommons.com/' },
      ...(a.cover ? { image: [new URL(a.cover.src, 'https://www.rinancommons.com').href] } : {}),
    },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: '日南稻站', item: 'https://www.rinancommons.com/' },
      { '@type': 'ListItem', position: 2, name: '地方筆記', item: 'https://www.rinancommons.com/stories/' },
      { '@type': 'ListItem', position: 3, name: a.title, item: url },
    ] },
  ] };
  return <main className="commons-page" id="top"><SiteHeader active="stories" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <article className={`reading-page illustrated-story ${people ? 'people-story' : 'journal-story'}`} id="content">
      <a className="underlined-link" href={sitePath(`/stories/?category=${categoryId}`)}>← {a.category}</a>
      <header><p className="kicker">{a.category} / 約 {a.readingMinutes} 分鐘</p><h1>{a.title}</h1><p className="article-deck">{a.summary}</p><p className="article-byline">日南稻站・編輯整理 <span>更新於 <time dateTime={a.updatedAt}>{a.updatedAt}</time></span></p></header>
      {a.cover ? <figure className={`people-cover ${a.cover.height > a.cover.width ? 'portrait-cover' : ''}`}><StoryPhoto photo={a.cover} priority /><figcaption>{a.cover.alt}<span>{a.cover.sourceUrl ? <a href={a.cover.sourceUrl} target="_blank" rel="noreferrer">{a.imageCredit} ↗</a> : a.imageCredit}</span></figcaption></figure> : a.image && <figure><ResponsivePhoto src={a.image} alt={a.imageAlt} priority sizes="(max-width: 760px) calc(100vw - 44px), 1000px" /><figcaption><a href={photoSource}>影像來源：臺中市文化資產處</a></figcaption></figure>}
      {!people && <nav className="article-toc" aria-label="本篇內容"><strong>本篇內容</strong><ol>{a.sections.map((section, i) => <li key={i}><a href={`#section-${i + 1}`}>{section.heading}</a></li>)}</ol></nav>}
      <div className={people ? 'people-narrative' : 'journal-narrative'}>
        {a.sections.map((section, i) => <Fragment key={`${a.id}-${i}`}>
          <section id={`section-${i + 1}`} className={people ? 'people-paragraph' : 'journal-paragraph'}>{section.heading && <h2>{section.heading}</h2>}<p>{section.text}</p>
            {!!section.links?.length && <ul className="article-links">{section.links.map(link => <li key={link.href}><a href={link.href.startsWith('/') ? sitePath(link.href) : link.href}>{link.label} ↗</a></li>)}</ul>}
          </section>
          {!!section.images?.length && <StoryGallery photos={section.images} />}
        </Fragment>)}
        <aside className="article-source"><strong>{people ? '關於這篇故事' : '資料來源與延伸閱讀'}</strong><p>{a.sourceUrl ? <a href={a.sourceUrl} target="_blank" rel="noreferrer">{a.sourceLabel} ↗</a> : a.sourceLabel}</p>
          {!!a.sources?.length && <ul>{a.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label} ↗</a></li>)}</ul>}
          <small>整理更新：{a.updatedAt}</small></aside>
      </div>
      <nav className="article-next" aria-label={people ? '走傱的日南人系列' : '延伸閱讀'}><span className="kicker">{people ? '繼續讀・走傱的日南人' : '繼續認識日南'}</span>
        {articles.filter(other => other.slug !== slug && (!people || other.category === '人物故事')).map(other => <a key={other.id} href={sitePath(`/stories/${other.slug}/`)}>{other.title} ↗</a>)}
        <a href={sitePath('/stories/')}>所有地方筆記 ↗</a>
      </nav>
    </article><SiteFooter note="從一段故事，走進日南的生活。" />
  </main>;
}
