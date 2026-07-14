import gsap from 'gsap';

export const fadeInUp = (elements: gsap.TweenTarget, stagger = 0.1, duration = 0.6) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration, stagger, ease: 'power3.out' }
  );
};

export const staggerCards = (cards: gsap.TweenTarget) => {
  gsap.fromTo(
    cards,
    { opacity: 0, y: 40, scale: 0.95 },
    { opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out' }
  );
};

export const slideDown = (element: gsap.TweenTarget) => {
  gsap.fromTo(
    element,
    { opacity: 0, y: -20 },
    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
  );
};

export const expandCollapse = (element: gsap.TweenTarget, expanded: boolean) => {
  gsap.to(element, { width: expanded ? 260 : 80, duration: 0.4, ease: 'power2.inOut' });
};

export const dropdownToggle = (submenu: HTMLElement | null, arrow: HTMLElement | null, open: boolean) => {
  if (!submenu) return;
  if (open) {
    gsap.set(submenu, { height: 'auto', display: 'block' });
    const fullHeight = submenu.scrollHeight;
    gsap.fromTo(
      submenu,
      { height: 0, opacity: 0 },
      { height: fullHeight, opacity: 1, duration: 0.35, ease: 'power2.out' }
    );
  } else {
    gsap.to(submenu, {
      height: 0, opacity: 0, duration: 0.25, ease: 'power2.in',
      onComplete: () => {
        gsap.set(submenu, { display: 'none' });
      },
    });
  }

  if (arrow) {
    gsap.to(arrow, { rotation: open ? 180 : 0, duration: 0.3, ease: 'power2.inOut' });
  }
};

export const fadeInSections = (elements: gsap.TweenTarget) => {
  gsap.fromTo(
    elements,
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: 'power2.out' }
  );
};

export const hoverScale = (element: gsap.TweenTarget) => {
  gsap.to(element, { scale: 1.03, duration: 0.3, ease: 'power2.out' });
};

export const hoverScaleReset = (element: gsap.TweenTarget) => {
  gsap.to(element, { scale: 1, duration: 0.3, ease: 'power2.out' });
};
