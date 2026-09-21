import type { MetadataRoute } from 'next';
import { articles } from './content';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.rinancommons.com';
  const paths = ['/', '/about/', '/stories/', '/visit/', '/explore/', '/plants/', '/motion2026/', '/walk/2026/', '/exhibition/to-and-from/', ...articles.map(a => `/stories/${a.slug}/`)];
  return paths.map(path => ({ url: `${base}${path}` }));
}
