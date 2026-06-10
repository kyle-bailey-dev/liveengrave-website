(() => {
  const hero = document.querySelector('.hero');
  const blob = document.querySelector('.hero-ambient__blob--interactive');

  if (!hero || !blob || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const baseLeft = 52;
  const baseTop = 26;
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;

  const animate = () => {
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;
    blob.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) scale(1.04)`;
    requestAnimationFrame(animate);
  };

  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width;
    const relativeY = (event.clientY - bounds.top) / bounds.height;

    blob.style.left = `${baseLeft + (relativeX - 0.5) * 18}%`;
    blob.style.top = `${baseTop + (relativeY - 0.5) * 14}%`;
    targetX = (relativeX - 0.5) * 160;
    targetY = (relativeY - 0.5) * 120;
  });

  hero.addEventListener('pointerleave', () => {
    blob.style.left = `${baseLeft}%`;
    blob.style.top = `${baseTop}%`;
    targetX = 0;
    targetY = 0;
  });

  animate();
})();
