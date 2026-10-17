import { sitePath } from '../site-path';
import type { StoryPhotoData } from './story-types';

export function StoryPhoto({ photo, priority = false, sizes = '(max-width: 760px) calc(100vw - 44px), 1000px' }: {
  photo: StoryPhotoData; priority?: boolean; sizes?: string;
}) {
  return <picture>
    <img src={sitePath(photo.src)} srcSet={photo.variants.map(v => `${sitePath(v.src)} ${v.width}w`).join(', ')}
      sizes={sizes} width={photo.width} height={photo.height} alt={photo.alt}
      loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} decoding="async" />
  </picture>;
}

export function StoryGallery({ photos }: { photos: StoryPhotoData[] }) {
  return <div className={`people-gallery ${photos.length === 1 ? 'people-gallery-single' : ''}`}>
    {photos.map(photo => <figure key={photo.src} className={photo.height > photo.width ? 'portrait-photo' : ''}>
      <a href={sitePath(photo.src)} target="_blank" rel="noreferrer" aria-label={`放大照片（另開分頁）：${photo.alt}`}>
        <StoryPhoto photo={photo} sizes={photos.length === 1 ? undefined : '(max-width: 760px) calc(100vw - 44px), 490px'} />
      </a>
      <figcaption>{photo.alt}</figcaption>
    </figure>)}
  </div>;
}
