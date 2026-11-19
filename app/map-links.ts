import mapData from '../public/maps/places.json';
import { sitePath } from './site-path';

type MapLink = { label: string; href: string; kind: string };
type MapPlace = {
  id: string;
  name: string;
  address: string;
  summary: string;
  aliases?: string[];
  sourceUrls?: string[];
  links: MapLink[];
};

const places = mapData.places as MapPlace[];

export function mapPlaceHref(id: string) {
  return sitePath(`/explore/?place=${encodeURIComponent(id)}`);
}

export function mapPlaceForName(name: string) {
  return places.find(place => place.name === name || place.aliases?.includes(name));
}

export function mapPlacesForStory(slug: string) {
  const path = `/stories/${slug}`;
  return places.filter(place => place.links.some(link =>
    link.kind === 'story' && link.href.split(/[?#]/)[0].replace(/\/$/, '') === path,
  ));
}
