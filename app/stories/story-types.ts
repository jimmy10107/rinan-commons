export type StoryPhotoData = {
  src: string;
  alt: string;
  width: number;
  height: number;
  variants: { src: string; width: number }[];
  credit?: string;
  sourceUrl?: string;
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
  sources?: { label: string; url: string }[];
  sections: { heading: string; text: string; images?: StoryPhotoData[]; links?: { label: string; href: string }[] }[];
};
