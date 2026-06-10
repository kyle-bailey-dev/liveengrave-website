(() => {
  const hero = document.querySelector('.hero');
  const blob = document.querySelector('.hero-ambient__blob--interactive');
  if (!hero || !blob || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let active = false;

  const animate = () => {
    currentX += (targetX - currentX) / 16;
    currentY += (targetY - currentY) / 16;
    blob.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
    requestAnimationFrame(animate);
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const relativeY = event.clientY - bounds.top;
    targetX = (relativeX - bounds.width * 0.5) * 0.12;
    targetY = (relativeY - bounds.height * 0.5) * 0.12;
    active = true;
  });

  hero.addEventListener('pointerleave', () => {
    active = false;
    targetX = 0;
    targetY = 0;
  });

  window.addEventListener('blur', () => {
    if (!active) {
      targetX = 0;
      targetY = 0;
    }
  });

  animate();
})();
