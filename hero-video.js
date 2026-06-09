(() => {
  const backdrop = document.querySelector('[data-hero-video]');
  const openButton = document.querySelector('[data-open-video]');
  const lightbox = document.querySelector('[data-video-lightbox]');
  const frame = document.querySelector('[data-video-frame]');
  const closeButtons = document.querySelectorAll('[data-close-video]');
  if (!backdrop || !openButton || !lightbox || !frame) return;

  const src = backdrop.getAttribute('data-video-src');
  if (!src) return;

  let video = null;
  let lastActive = null;

  const buildVideo = () => {
    if (video) return video;
    video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.preload = 'metadata';
    video.playsInline = true;
    frame.appendChild(video);
    return video;
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.classList.remove('video-open');
    if (video) {
      video.pause();
    }
    if (lastActive instanceof HTMLElement) {
      lastActive.focus();
    }
  };

  const openLightbox = () => {
    lastActive = document.activeElement;
    const player = buildVideo();
    lightbox.hidden = false;
    document.body.classList.add('video-open');
    player.currentTime = 0;
    player.play().catch(() => {});
    const close = lightbox.querySelector('.video-lightbox__close');
    if (close instanceof HTMLElement) {
      close.focus();
    }
  };

  openButton.addEventListener('click', openLightbox);
  closeButtons.forEach((button) => button.addEventListener('click', closeLightbox));

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
