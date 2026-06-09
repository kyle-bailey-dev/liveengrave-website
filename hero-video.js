(() => {
  const backdrop = document.querySelector('[data-hero-video]');
  const hero = document.querySelector('.hero');
  const trigger = document.querySelector('.hero-video-trigger');
  if (!backdrop || !hero || !trigger) return;

  trigger.addEventListener('click', () => {
    if (hero.classList.contains('is-playing')) return;

    const src = backdrop.getAttribute('data-video-src');
    if (!src) return;

    const poster = hero.querySelector('img');
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    if (poster?.getAttribute('src')) {
      video.poster = poster.getAttribute('src');
    }

    backdrop.appendChild(video);
    poster?.remove();
    hero.classList.add('is-playing');

    const playAttempt = video.play();
    if (playAttempt && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {
        video.muted = false;
        video.play().catch(() => {});
      });
    }
  }, { once: true });
})();
