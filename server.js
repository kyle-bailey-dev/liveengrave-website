const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(rootDir, { extensions: ['html'] }));

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: 'Too many enquiries sent from this device. Please wait a few minutes and try again.' },
});

const requiredEnv = ['BREVO_API_KEY', 'CONTACT_TO', 'CONTACT_FROM'];

const getBrevoConfig = () => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing Brevo configuration: ${missing.join(', ')}`);
  }

  return {
    apiKey: process.env.BREVO_API_KEY,
    to: process.env.CONTACT_TO,
    toName: process.env.CONTACT_TO_NAME || 'Live Engrave',
    from: process.env.CONTACT_FROM,
    fromName: process.env.CONTACT_FROM_NAME || 'Live Engrave Website',
    enquiryListId: process.env.BREVO_ENQUIRY_LIST_ID ? Number(process.env.BREVO_ENQUIRY_LIST_ID) : null,
  };
};

const syncBrevoContact = async (config, payload) => {
  const attributes = {
    FIRSTNAME: payload.firstName,
    LASTNAME: payload.lastName,
    COMPANY: payload.companyName || undefined,
    PHONE: payload.phone || undefined,
    ENQUIRY_SOURCE: 'website',
  };

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': config.apiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      email: payload.email,
      attributes,
      emailBlacklisted: false,
      smsBlacklisted: false,
      updateEnabled: true,
      listIds: config.enquiryListId ? [config.enquiryListId] : undefined,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Brevo contact sync failed: ${response.status} ${body}`);
  }
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.post('/api/contact', contactLimiter, async (req, res) => {
  const payload = {
    firstName: String(req.body.firstName || '').trim(),
    lastName: String(req.body.lastName || '').trim(),
    companyName: String(req.body.companyName || '').trim(),
    email: String(req.body.email || '').trim(),
    phone: String(req.body.phone || '').trim(),
    requirements: String(req.body.requirements || '').trim(),
    companyWebsite: String(req.body.companyWebsite || '').trim(),
    doNotRetain: String(req.body.doNotRetain || '').trim() === 'true',
  };

  if (payload.companyWebsite) {
    return res.json({ ok: true });
  }

  if (!payload.firstName || !payload.lastName || !payload.email || !payload.requirements) {
    return res.status(400).json({ ok: false, error: 'Please complete the required fields.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  try {
    const config = getBrevoConfig();
    const subject = `Live Engrave enquiry from ${payload.firstName} ${payload.lastName}`;
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': config.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: config.fromName,
          email: config.from,
        },
        to: [
          {
            email: config.to,
            name: config.toName,
          },
        ],
        replyTo: {
          email: payload.email,
          name: `${payload.firstName} ${payload.lastName}`.trim(),
        },
        subject,
        textContent: [
          `First name: ${payload.firstName}`,
          `Last name: ${payload.lastName}`,
          `Company name: ${payload.companyName || '-'}`,
          `Email: ${payload.email}`,
          `Phone: ${payload.phone || '-'}`,
          '',
          'Requirements:',
          payload.requirements,
          '',
          `CRM retention opt-out: ${payload.doNotRetain ? 'Yes' : 'No'}`,
        ].join('\n'),
        htmlContent: `
          <h2>New Live Engrave enquiry</h2>
          <p><strong>First name:</strong> ${escapeHtml(payload.firstName)}</p>
          <p><strong>Last name:</strong> ${escapeHtml(payload.lastName)}</p>
          <p><strong>Company name:</strong> ${escapeHtml(payload.companyName || '-')}</p>
          <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
          <p><strong>Phone:</strong> ${escapeHtml(payload.phone || '-')}</p>
          <p><strong>Requirements:</strong></p>
          <p>${escapeHtml(payload.requirements).replace(/\n/g, '<br />')}</p>
          <hr style="margin: 24px 0; border: 0; border-top: 1px solid #d9d4ea;" />
          <p style="font-size: 14px; color: #5d5672;"><strong>CRM retention opt-out:</strong> ${payload.doNotRetain ? 'Yes' : 'No'}</p>
        `,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Brevo request failed: ${response.status} ${body}`);
    }

    if (!payload.doNotRetain) {
      await syncBrevoContact(config, payload);
    }

    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact form send failed', error);
    return res.status(500).json({ ok: false, error: 'Message failed to send. Please try again shortly.' });
  }
});

app.use((req, res) => {
  if (req.accepts('html')) {
    return res.status(404).sendFile(path.join(rootDir, '404.html'));
  }
  return res.status(404).json({ ok: false, error: 'Not found.' });
});

app.listen(port, () => {
  console.log(`Live Engrave website listening on ${port}`);
});
