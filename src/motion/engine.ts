import { gsap, ScrollTrigger, SplitText } from './runtime';
import type { MotionGroups } from './policy';

// Solo controla presentación dentro de la raíz recibida. No altera datos ni Embla.
export function createMotion(root: HTMLElement, groups: MotionGroups, desktop: boolean, playIntro: boolean) {
  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];
  const loops: gsap.core.Tween[] = [];
  const reveals = new Map<HTMLElement, gsap.core.Animation[]>();
  const prepareSection = new Map<HTMLElement, () => void>();
  let disposed = false;
  const preparationObserver = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(entries => {
    if (disposed) return;
    for (const entry of entries) if (entry.isIntersecting) {
      prepareSection.get(entry.target as HTMLElement)?.();
      preparationObserver?.unobserve(entry.target);
    }
  }, { rootMargin: '160px 0px' });
  const q = <T extends Element = HTMLElement>(selector: string) => Array.from(root.querySelectorAll<T>(selector));
  function track(animation: gsap.core.Tween | gsap.core.Timeline) {
    if (animation.scrollTrigger) triggers.push(animation.scrollTrigger);
    return animation;
  }
  function reveal(targets: Element[], section: HTMLElement, vars: gsap.TweenVars = {}) {
    if (!targets.length) return;
    const tween = track(gsap.from(targets, { opacity: .85, y: desktop ? 16 : 10, duration: .65, stagger: .07, ease: 'power2.out', ...vars,
      clearProps: 'transform,opacity', scrollTrigger: { trigger: section, start: 'top 90%', once: true },
    }));
    reveals.set(section, [...(reveals.get(section) ?? []), tween]);
  }
  let intro: gsap.core.Timeline | undefined;
  const context = gsap.context(() => {}, root);
  try { context.add(() => {
    root.dataset.motionContexts = '1';
    const hero = root.querySelector<HTMLElement>('#inicio')!;
    root.dataset.introState = groups.intro && playIntro ? 'running' : 'done';
    if (groups.intro && playIntro && window.scrollY < hero.offsetHeight) {
      const names = q<HTMLElement>('[data-animation="hero-name"] > span');
      const words = names.flatMap(name => { const split = SplitText.create(name, { type: 'words', tag: 'span', aria: 'none' }); splits.push(split); return split.words; });
      intro = gsap.timeline({ id: 'romina-intro', defaults: { ease: 'power2.out' }, onComplete: () => { root.dataset.introState = 'done'; } });
      intro.from(q('[data-layer="hero-background"]'), { opacity: .3, duration: .5 }, 0)
        .from(q('[data-animation="hero-photo"]'), { opacity: 0, y: 8, duration: .85, clearProps: 'transform,opacity' }, .1)
        .from(q('[data-motion="crown"]'), { opacity: 0, y: 8, duration: .45 }, .5)
        .from(q('[data-motion="occasion"]'), { opacity: 0, y: 8, duration: .5 }, .7)
        .from(words, { opacity: 0, y: 10, duration: .65, stagger: .1, clearProps: 'transform,opacity' }, .95)
        .from(q('[data-motion="hero-message"]'), { opacity: .4, duration: .5 }, 1.3)
        .from(q('#fecha'), { opacity: 0, y: 6, duration: .5 }, 1.65)
        .from(q('[data-animation="ornaments"]'), { opacity: 0, duration: .6 }, 1.9)
        .from(q('[data-motion="continue"]'), { opacity: .4, y: -4, duration: .3 }, 2.3);
    } else root.dataset.introState = 'done';

    if (groups.parallax) {
      track(gsap.to(q('[data-animation="hero-photo"] img'), { y: -8, scale: 1.025, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .5 } }));
      track(gsap.to(q('[data-layer="hero-background"]'), { y: 8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .7 } }));
      track(gsap.to(q('#inicio [data-layer="flowers"]'), { y: -6, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .7 } }));
      track(gsap.to(q('#inicio [data-layer="sparkle"]'), { y: -12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .8 } }));
    }
    if (groups.reveals) {
      for (const section of q<HTMLElement>('main section:not(#inicio), footer')) {
        let prepared = false;
        const prepare = () => {
          if (prepared) return;
          prepared = true;
          context.add(() => {
        const titleTargets = section.querySelectorAll<HTMLElement>('[data-motion-title]');
        titleTargets.forEach(title => {
          const split = SplitText.create(title, { type: 'words', tag: 'span', aria: 'none' }); splits.push(split);
          reveal(split.words, section, { y: 9, stagger: .045 });
        });
        if (section.id === 'historia') reveal(Array.from(section.querySelectorAll('[data-motion="story-message"] p, [data-motion="family"] > div')), section);
        else if (section.id === 'galeria') reveal(Array.from(section.querySelectorAll('[data-motion="gallery-viewport"]')), section, { y: 0 });
        else if (section.id === 'itinerario') reveal(Array.from(section.querySelectorAll('[data-animation="timeline-card"]')), section, { stagger: .16 });
        else if (section.id === 'cierre') {
          const text = section.querySelector<HTMLElement>('p')!;
          const split = SplitText.create(text, { type: 'words', tag: 'span', aria: 'none' }); splits.push(split);
          reveal(split.words, section, { y: 6, stagger: .025, duration: .55 });
          reveal(Array.from(section.querySelectorAll('[data-motion="closing-monogram"], [data-layer="closing-flowers"], [data-motion="closing-sparkle"]')), section, { y: 5, stagger: .06 });
        } else reveal(Array.from(section.querySelectorAll('article, [data-motion="rsvp-actions"]')), section, { y: 12, stagger: .1 });
          });
          root.dataset.motionTriggers = String(triggers.length);
        };
        prepareSection.set(section, prepare);
        if (!preparationObserver || section.getBoundingClientRect().top < innerHeight + 160) prepare();
        else preparationObserver.observe(section);
      }
      const line = root.querySelector<SVGPathElement>('[data-animation="timeline-path"]');
      if (line) {
        const length = line.getTotalLength();
        track(gsap.fromTo(line, { strokeDasharray: length, strokeDashoffset: length }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: root.querySelector('#itinerario'), start: 'top 85%', end: 'bottom 55%', scrub: .3 } }));
      }
    }
    if (groups.particles) {
      q<HTMLElement>('[data-motion-particle]').forEach((petal, index) => {
        const owner = petal.closest<HTMLElement>('[data-particle-field]')!;
        const travel = Math.min(owner.clientHeight * .32, 160);
        const closing = !!owner.closest('footer');
        const loop = gsap.fromTo(petal, { y: -14, x: 0, rotation: -12, opacity: 0 }, { y: travel, x: (index % 2 ? 1 : -1) * 12, rotation: 18, opacity: .55, duration: closing ? 7 : 10 + index % 4, repeat: closing ? 0 : -1, repeatDelay: 2, delay: index * .75, ease: 'sine.inOut', yoyo: !closing, paused: true });
        loops.push(loop);
        triggers.push(ScrollTrigger.create({ trigger: owner, start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive && !document.hidden ? loop.play() : loop.pause() }));
      });
    }
    if (groups.ornaments) {
      q<SVGElement>('[data-layer="butterfly"], [data-motion="ambient-flower"]').forEach((element, index) => {
        const loop = gsap.to(element, { rotation: '+=2', x: index % 2 ? -2 : 2, duration: 6 + index, ease: 'sine.inOut', repeat: -1, yoyo: true, paused: true });
        loops.push(loop);
        triggers.push(ScrollTrigger.create({ trigger: element.closest('section, footer')!, start: 'top bottom', end: 'bottom top', onToggle: self => self.isActive && !document.hidden ? loop.play() : loop.pause() }));
      });
    }
  }); } catch (error) { disposed = true; preparationObserver?.disconnect(); context.revert(); splits.forEach(split => split.revert()); throw error; }
  root.dataset.motionTriggers = String(triggers.length);
  function finishSection(target: Element | null) {
    if (!target) return;
    if (target.closest('#inicio')) { intro?.progress(1); root.dataset.introState = 'done'; }
    const section = target.closest<HTMLElement>('section, footer');
    if (section) prepareSection.get(section)?.();
    if (section) reveals.get(section)?.forEach(animation => animation.progress(1).pause());
  }
  function click(event: MouseEvent) {
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (anchor) finishSection(root.querySelector(anchor.getAttribute('href')!));
  }
  function focus(event: FocusEvent) { finishSection(event.target as Element); }
  function visibility() {
    loops.forEach(loop => {
      const element = loop.targets()[0] as Element;
      const owner = element.closest('section, footer');
      if (document.hidden || !owner || !ScrollTrigger.isInViewport(owner)) loop.pause(); else loop.play();
    });
    if (document.hidden && intro?.isActive()) intro.progress(1);
  }
  root.addEventListener('click', click, true);
  root.addEventListener('focusin', focus);
  document.addEventListener('visibilitychange', visibility);
  ScrollTrigger.refresh();
  visibility();
  return {
    dispose() {
      disposed = true; preparationObserver?.disconnect();
      root.removeEventListener('click', click, true); root.removeEventListener('focusin', focus); document.removeEventListener('visibilitychange', visibility);
      context.revert(); splits.forEach(split => split.revert());
      root.dataset.motionContexts = '0'; root.dataset.motionTriggers = '0'; root.dataset.introState = 'done';
    },
  };
}
