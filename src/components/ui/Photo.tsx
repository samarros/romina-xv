import type { ImgHTMLAttributes } from 'react';
import type { galleryPhotos } from '../../data/gallery';

type Props = ImgHTMLAttributes<HTMLImageElement> & { photo: typeof galleryPhotos[number]; sizes: string; enabled?: boolean };
export function Photo({ photo, sizes, enabled = true, ...props }: Props) {
  return <picture>
    {enabled && photo.sources.map(source => <source key={source.type} {...source} sizes={sizes} />)}
    <img src={enabled ? photo.src : undefined} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" decoding="async" {...props} />
  </picture>;
}
