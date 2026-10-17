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
      ...(a.cover ? { images: [{ url: a.cover.src, width: a.cover.width, height: a.cover.height, alt: a.cover.alt }] } : {}) },
  };
}
export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = articles.find(a => a.slug === slug);
  if (!a) notFound();
  const people = a.category === '人物故事';
  return <main className="commons-page" id="top"><SiteHeader active="stories" />
    <article className={`reading-page ${people ? 'people-story' : ''}`} id="content">
      <a className="underlined-link" href={sitePath(`/stories/${people ? '?category=people' : ''}`)}>← {people ? '人物故事' : '地方筆記'}</a>
      <header><p className="kicker">{a.category} / 約 {a.readingMinutes} 分鐘</p><h1>{a.title}</h1><p className="article-deck">{a.summary}</p></header>
      {a.cover ? <figure className="people-cover"><StoryPhoto photo={a.cover} priority /><figcaption>{a.cover.alt}<span>{a.imageCredit}</span></figcaption></figure> : a.image && <figure><ResponsivePhoto src={a.image} alt={a.imageAlt} priority sizes="(max-width: 760px) calc(100vw - 44px), 1000px" /><figcaption><a href={photoSource}>影像來源：臺中市文化資產處</a></figcaption></figure>}
      <div className={people ? 'people-narrative' : 'article-body'}>
        {a.sections.map((section, i) => <Fragment key={`${a.id}-${i}`}>
          <section className={people ? 'people-paragraph' : undefined}>{section.heading && <h2>{section.heading}</h2>}<p>{section.text}</p></section>
          {!!section.images?.length && <StoryGallery photos={section.images} />}
        </Fragment>)}
        <aside className="article-source"><strong>{people ? '關於這篇故事' : '資料來源'}</strong><p>{a.sourceUrl ? <a href={a.sourceUrl} target="_blank" rel="noreferrer">{a.sourceLabel} ↗</a> : a.sourceLabel}</p><small>整理更新：{a.updatedAt}</small></aside>
      </div>
      <nav className="article-next" aria-label={people ? '走傱的日南人系列' : '延伸閱讀'}><span className="kicker">{people ? '繼續讀・走傱的日南人' : '繼續認識日南'}</span>
        {articles.filter(other => other.slug !== slug && (!people || other.category === '人物故事')).map(other => <a key={other.id} href={sitePath(`/stories/${other.slug}/`)}>{other.title} ↗</a>)}
        <a href={sitePath('/stories/')}>所有地方筆記 ↗</a>
      </nav>
    </article><SiteFooter note="從一段故事，走進日南的生活。" />
  </main>;
}
