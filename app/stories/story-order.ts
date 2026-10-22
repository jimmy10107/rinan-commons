import type { StoryArticle } from './story-types';

/** Feature people first, then keep each group in editorial/date order. */
export function compareStories(a: StoryArticle, b: StoryArticle) {
  const peoplePriority = Number(b.category === '人物故事') - Number(a.category === '人物故事');
  return peoplePriority || b.updatedAt.localeCompare(a.updatedAt) || (a.seriesNumber || 0) - (b.seriesNumber || 0);
}
