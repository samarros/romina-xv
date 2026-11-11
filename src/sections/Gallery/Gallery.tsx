import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseEmblaCarouselType } from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { galleryPhotos } from '../../data/gallery';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Photo } from '../../components/ui/Photo';
import { Lightbox } from '../../features/gallery/Lightbox';
import styles from './Gallery.module.css';
import { useMotionAccent } from '../../motion/useMotionAccent';
import { useMotion } from '../../motion/MotionProvider';

export function Gallery() {
  const { enabled } = useMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const [api, setApi] = useState<UseEmblaCarouselType[1]>();
  const [Controller, setController] = useState<typeof import('./CarouselController').default | null>(null);
  const [controllerError, setControllerError] = useState(false);
  const pendingNavigation = useRef<('previous' | 'next' | number)[]>([]);
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(7);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const [imagesReady, setImagesReady] = useState(false);
  useEffect(() => {
    if (!('IntersectionObserver' in window)) { setImagesReady(true); return; }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setImagesReady(true); observer.disconnect(); }
    }, { rootMargin: '400px 0px' });
    if (galleryRef.current) observer.observe(galleryRef.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!imagesReady) return;
    let cancelled = false;
    import('./CarouselController').then(module => { if (!cancelled) setController(() => module.default); })
      .catch(() => { if (!cancelled) { pendingNavigation.current = []; setControllerError(true); } });
    return () => { cancelled = true; };
  }, [imagesReady]);
  useMotionAccent(galleryRef, 'gallery', selected, imagesReady);
  const reduced = () => !enabled || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function navigate(action: 'previous' | 'next' | number) {
    if (!api) { if (!controllerError) { pendingNavigation.current.push(action); setImagesReady(true); } return; }
    if (action === 'previous') api.scrollPrev(reduced());
    else if (action === 'next') api.scrollNext(reduced());
    else api.scrollTo(action, reduced());
  }
  useEffect(() => {
    if (!api) return;
    const onSelect = () => { setSelected(api.selectedScrollSnap()); setSnapCount(api.scrollSnapList().length); };
    onSelect();
    api.on('select', onSelect).on('reInit', onSelect);
    pendingNavigation.current.splice(0).forEach(navigate);
    return () => { api.off('select', onSelect).off('reInit', onSelect); };
  }, [api]);
  const close = useCallback(() => setOpenIndex(null), []);
  return <>
    <section ref={galleryRef} id="galeria" className={styles.section} aria-labelledby="gallery-title" tabIndex={-1} data-animation="gallery" data-carousel-state={api ? 'ready' : controllerError ? 'fallback' : imagesReady ? 'loading' : 'waiting'}>
      {Controller && <Controller viewport={viewportRef.current} onReady={setApi} />}
      <SectionHeading id="gallery-title">Galería de momentos</SectionHeading>
      <div role="region" aria-roledescription="carrusel" aria-label="Siete fotografías de Romina" aria-busy={imagesReady && !api && !controllerError} className={styles.carousel}
        onKeyDown={e => { if (controllerError) return; if (e.key === 'ArrowLeft') { e.preventDefault(); navigate('previous'); } if (e.key === 'ArrowRight') { e.preventDefault(); navigate('next'); } }}>
        <button type="button" disabled={controllerError} className={styles.arrow} onClick={() => navigate('previous')} aria-label="Fotografía anterior"><ChevronLeft aria-hidden="true" /></button>
        <div role="group" className={styles.viewport} style={controllerError ? { overflowX: 'auto' } : undefined} data-motion="gallery-viewport" ref={viewportRef} tabIndex={0} aria-label="Fotografías; usa las flechas del teclado para desplazarte">
          <div className={styles.track}>
            {galleryPhotos.map((photo, index) => <div className={styles.slide} key={photo.id} role="group" aria-roledescription="diapositiva" aria-label={`${index + 1} de 7`} data-animation="gallery-card">
              <button className={styles.photoButton} data-gallery-photo="" data-active={selected === index} type="button" aria-label={`Ampliar fotografía ${index + 1}: ${photo.alt}`} onClick={e => { triggerRef.current = e.currentTarget; setOpenIndex(index); }}>
                <Photo photo={photo} enabled={imagesReady} sizes="(min-width: 1024px) 230px, (min-width: 640px) 240px, calc(100vw - 145px)" />
                <span className={styles.expand}><Expand aria-hidden="true" /><span>Ampliar fotografía</span></span>
              </button>
            </div>)}
          </div>
        </div>
        <button type="button" disabled={controllerError} className={styles.arrow} onClick={() => navigate('next')} aria-label="Fotografía siguiente"><ChevronRight aria-hidden="true" /></button>
      </div>
      <div role="group" className={styles.dots} aria-label="Posición de la galería">{Array.from({ length: snapCount }, (_, index) => <button disabled={controllerError} key={index} type="button" aria-label={`Ir a fotografía ${index + 1}`} aria-pressed={selected === index} onClick={() => navigate(index)}><span /></button>)}</div>
      {controllerError && <p role="status">No se pudo activar el carrusel. Puedes desplazar las fotografías y ampliarlas.</p>}
      <p className={styles.status} aria-live="polite">Fotografía {selected + 1} de {galleryPhotos.length} · Toca una imagen para ampliarla</p>
    </section>
    {openIndex !== null && <Lightbox photo={galleryPhotos[openIndex]} index={openIndex} total={galleryPhotos.length} returnFocus={triggerRef.current} onClose={close} onPrevious={() => setOpenIndex((openIndex + 6) % 7)} onNext={() => setOpenIndex((openIndex + 1) % 7)} />}
  </>;
}
