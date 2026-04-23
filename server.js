const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const port = Number(process.env.PORT || 3000);
const rootDir = __dirname;

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(rootDir, { extensions: ['html'] }));

const requiredEnv = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'CONTACT_TO'];

const getTransporter = () => {
  const missing = requiredEnv.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing SMTP configuration: ${missing.join(', ')}`);
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

app.post('/api/contact', async (req, res) => {
  const payload = {
    firstName: String(req.body.firstName || '').trim(),
    lastName: String(req.body.lastName || '').trim(),
    companyName: String(req.body.companyName || '').trim(),
    email: String(req.body.email || '').trim(),
    phone: String(req.body.phone || '').trim(),
    requirements: String(req.body.requirements || '').trim(),
  };

  if (!payload.firstName || !payload.lastName || !payload.email || !payload.requirements) {
    return res.status(400).json({ ok: false, error: 'Please complete the required fields.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
  }

  try {
    const transporter = getTransporter();
    const from = process.env.CONTACT_FROM || process.env.SMTP_USER;
    const to = process.env.CONTACT_TO;
    const subject = `Live Engrave enquiry from ${payload.firstName} ${payload.lastName}`;

    await transporter.sendMail({
      from,
      to,
      replyTo: payload.email,
      subject,
      text: [
        `First name: ${payload.firstName}`,
        `Last name: ${payload.lastName}`,
        `Company name: ${payload.companyName || '-'}`,
        `Email: ${payload.email}`,
        `Phone: ${payload.phone || '-'}`,
        '',
        'Requirements:',
        payload.requirements,
      ].join('\n'),
      html: `
        <h2>New Live Engrave enquiry</h2>
        <p><strong>First name:</strong> ${escapeHtml(payload.firstName)}</p>
        <p><strong>Last name:</strong> ${escapeHtml(payload.lastName)}</p>
        <p><strong>Company name:</strong> ${escapeHtml(payload.companyName || '-')}</p>
        <p><strong>Email:</strong> ${escapeHtml(payload.email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(payload.phone || '-')}</p>
        <p><strong>Requirements:</strong></p>
        <p>${escapeHtml(payload.requirements).replace(/\n/g, '<br />')}</p>
      `,
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error('Contact form send failed', error);
    return res.status(500).json({ ok: false, error: 'Message failed to send. Please try again shortly.' });
  }
});

app.use((_req, res) => {
  res.sendFile(path.join(rootDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`Live Engrave website listening on ${port}`);
});
