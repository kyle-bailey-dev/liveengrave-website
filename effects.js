(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileViewport = window.matchMedia('(max-width: 820px)').matches;

  if (!reduceMotion) {
    const revealTargets = [
      ...document.querySelectorAll('.section-heading, .story-panel, .data-band__item, .contact-section'),
      ...document.querySelectorAll('.story-panel__media, .mockup-panel, .hero-backdrop'),
    ];

    const staggerable = new Set(document.querySelectorAll('.data-band__item'));
    revealTargets.forEach((el, index) => {
      if (el.matches('.story-panel__media, .mockup-panel, .hero-backdrop')) {
        el.classList.add('reveal-image');
      } else {
        el.classList.add('reveal-on-scroll');
      }
      if (staggerable.has(el)) {
        el.style.transitionDelay = `${index % 3 * 90}ms`;
      }
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.18,
      rootMargin: '0px 0px -8% 0px',
    });

    revealTargets.forEach((el) => observer.observe(el));
  }

  if (reduceMotion || mobileViewport) return;

  const items = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!items.length) return;

  let ticking = false;

  const update = () => {
    const viewportH = window.innerHeight || 1;
    items.forEach((item) => {
      const speed = Number(item.getAttribute('data-parallax') || '0');
      const rect = item.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const progress = (center - viewportH / 2) / viewportH;
      const offset = Math.max(-32, Math.min(32, progress * speed * -180));
      item.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    });
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  update();
  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick);
})();
