import data from './generated/content.json';

export const site = data.settings[0];
export const chapters = data.chapters;
export const materials = data.materials;
export const articles = data.articles;
export const spaceUses = data.spaceUses;
export const programs = data.programs;
export const places = data.places;
export const organizations = data.organizations;
export const vendors: { id: string; name: string; category: string; theme: string; status: string; note?: string }[] = data.vendors;
export const photoSource = 'https://www.tchac.taichung.gov.tw/building?pid=22&uid=33';
