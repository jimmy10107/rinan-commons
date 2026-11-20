'use client';
import { usePathname } from 'next/navigation';
import { EntryMedia } from './entry-media';
import PlantPreloader from './plants/site-preloader';

export function AmbientTools() {
  const path = usePathname() || '';
  if (/\/exhibition\/to-and-from\/?$/.test(path)) return <EntryMedia/>;
  return <><EntryMedia autoOpen={!/\/explore\/?$/.test(path)}/><PlantPreloader/></>;
}
