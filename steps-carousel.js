(() => {
  const mobileQuery = window.matchMedia('(max-width: 820px)');
  const carouselStates = new WeakMap();

  const updateUi = (embla, prev, next, dots) => {
    const index = embla.selectedScrollSnap();
    prev.disabled = !embla.canScrollPrev();
    next.disabled = !embla.canScrollNext();
    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === index;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
    });
  };

  const mountCarousel = (carousel) => {
    if (carouselStates.has(carousel) || !window.EmblaCarousel) return;

    const viewport = carousel.querySelector('.steps-carousel__viewport');
    const prev = carousel.querySelector('.steps-carousel__arrow--prev');
    const next = carousel.querySelector('.steps-carousel__arrow--next');
    const dots = Array.from(carousel.querySelectorAll('.steps-carousel__dot'));
    if (!viewport || !prev || !next) return;

    const embla = window.EmblaCarousel(viewport, {
      align: 'start',
      containScroll: 'trimSnaps',
      dragFree: false,
      duration: 22,
      loop: false,
      skipSnaps: false,
      slidesToScroll: 1,
      watchDrag: true,
    });

    const onSelect = () => updateUi(embla, prev, next, dots);
    const onPrev = () => embla.scrollPrev();
    const onNext = () => embla.scrollNext();

    prev.addEventListener('click', onPrev);
    next.addEventListener('click', onNext);
    const dotHandlers = dots.map((dot, index) => {
      const handler = () => embla.scrollTo(index)
      dot.addEventListener('click', handler)
      return handler
    });

    embla.on('init', onSelect);
    embla.on('reInit', onSelect);
    embla.on('select', onSelect);
    embla.scrollTo(0, true);
    onSelect();

    carouselStates.set(carousel, {
      embla,
      prev,
      next,
      dots,
      dotHandlers,
      onPrev,
      onNext,
      onSelect,
    });
  };

  const unmountCarousel = (carousel) => {
    const state = carouselStates.get(carousel);
    if (!state) return;

    state.prev.removeEventListener('click', state.onPrev);
    state.next.removeEventListener('click', state.onNext);
    state.dots.forEach((dot, index) => {
      dot.removeEventListener('click', state.dotHandlers[index]);
    });
    state.embla.off('init', state.onSelect);
    state.embla.off('reInit', state.onSelect);
    state.embla.off('select', state.onSelect);
    state.embla.destroy();
    carouselStates.delete(carousel);

    state.dots.forEach((dot, index) => {
      const isActive = index === 0;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
    });
    state.prev.disabled = true;
    state.next.disabled = false;
  };

  const syncCarousels = () => {
    const carousels = document.querySelectorAll('.steps-carousel');
    carousels.forEach((carousel) => {
      if (mobileQuery.matches) {
        mountCarousel(carousel);
      } else {
        unmountCarousel(carousel);
      }
    });
  };

  mobileQuery.addEventListener('change', syncCarousels);
  window.addEventListener('pageshow', syncCarousels);
  window.addEventListener('load', syncCarousels);
  syncCarousels();
})();
