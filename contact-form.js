(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const button = form.querySelector('[data-contact-submit]');
  const status = form.querySelector('[data-contact-status]');

  const setStatus = (message, state) => {
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state || '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!button) return;

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    button.disabled = true;
    button.textContent = 'Sending...';
    setStatus('Sending your enquiry...', 'pending');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({ ok: false, error: 'Unexpected response.' }));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Message failed to send.');
      }

      form.reset();
      setStatus('Thanks. We will get back to you shortly.', 'success');
    } catch (error) {
      setStatus(error.message || 'Message failed to send. Please try again shortly.', 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Send enquiry';
    }
  });
})();
