export type StoryPhotoData = {
  src: string;
  alt: string;
  width: number;
  height: number;
  variants: { src: string; width: number }[];
};

export type StoryArticle = {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  image: string;
  imageAlt: string;
  readingMinutes: number;
  updatedAt: string;
  sourceLabel: string;
  sourceUrl: string;
  imageCredit?: string;
  cover?: StoryPhotoData;
  seriesNumber?: number;
  personName?: string;
  sections: { heading: string; text: string; images?: StoryPhotoData[] }[];
};
