import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';

// Mantener el marcado y las fotografías montados; diferir solo motor y mediciones.
export default function CarouselController({ viewport, onReady }: { viewport: HTMLElement | null; onReady: (api: UseEmblaCarouselType[1]) => void }) {
  const [setViewport, api] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 });
  useEffect(() => { setViewport(viewport); return () => setViewport(null); }, [viewport, setViewport]);
  useEffect(() => { onReady(api); }, [api, onReady]);
  return null;
}
