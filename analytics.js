(() => {
  const track = (eventName, params = {}) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, params);
  };

  document.querySelectorAll('[data-analytics-event]').forEach((element) => {
    element.addEventListener('click', () => {
      track(element.dataset.analyticsEvent, {
        location: element.dataset.analyticsLocation || 'unknown',
        label: element.textContent.trim(),
      });
    });
  });

  window.liveEngraveAnalytics = { track };
})();
