Live Engrave website

Run locally:
- npm install
- npm start
- open http://localhost:3000

Required environment variables for the contact form:
- BREVO_API_KEY
- CONTACT_TO
- CONTACT_FROM

Optional:
- BREVO_ENQUIRY_LIST_ID
- CONTACT_TO_NAME
- CONTACT_FROM_NAME
- GA_MEASUREMENT_ID

The contact form sends the enquiry by Brevo transactional email.
If the user does not tick the marketing opt-out box, the contact is also created or updated in Brevo contacts and optionally added to the configured list.


If GA_MEASUREMENT_ID is set, the site loads Google Analytics 4 on all pages and tracks:
- page views
- contact form submit success
- primary CTA clicks
