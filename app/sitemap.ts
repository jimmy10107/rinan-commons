import type { MetadataRoute } from 'next';
import { articles } from './content';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://jimmy10107.github.io/rinan-commons';
  const paths = ['/', '/about/', '/stories/', '/visit/', '/walk/2026/', '/exhibition/to-and-from/', ...articles.map(a => `/stories/${a.slug}/`)];
  return paths.map(path => ({ url: `${base}${path}` }));
}
