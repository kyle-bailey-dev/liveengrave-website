Live Engrave website

Run locally:
- npm install
- npm start
- open http://localhost:3000

Required environment variables for the contact form:
- BREVO_API_KEY
- CONTACT_TO
- CONTACT_TO_NAME (optional)
- CONTACT_FROM
- CONTACT_FROM_NAME (optional)

The contact form sends via Brevo transactional email API.
On Railway, set those variables in the service before testing the form.
