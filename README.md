# Delhi Service Network

Delhi Service Network is a working local-service lead platform for Delhi NCR.
Customers can submit service requests, vendors can join the pilot network, and
the admin dashboard can track leads, vendors, assignment, and job status.

Live site: https://delhi-service-network.yummy-mite-8360.chatgpt.site

## Features

- Customer booking form for Delhi NCR service requests
- Vendor onboarding form for free pilot leads
- Email notifications for customer queries and vendor signups to `srijanartrugs90@gmail.com`
- Resend email delivery configured through the production `RESEND_API_KEY` secret
- 60+ service catalogue across home repair, cleaning, beauty, events, business, moving, rentals, and education
- Searchable service catalogue, package selection, time slot, address, and payment mode
- Trust, warranty, customer preparation, and quote-shortlist sections
- Launch rules, pilot policy, support FAQs, and customer/vendor consent checkboxes
- Persistent lead and vendor storage with Cloudflare D1
- Separate `/admin` dashboard with PIN lock, live metrics, lead search, service/status filters, vendor assignment, call/WhatsApp actions, CSV export, lead copy summary, rating buttons, and vendor cards
- Drizzle schema and migrations included
- Mobile-friendly, professional service marketplace UI
- Custom DSN logo and favicon for customer website and private admin panel

## Business Model

The current version is built for the free pilot phase:

- onboard vendors without commission
- collect real lead demand data
- track service category and area demand
- identify reliable vendors
- add monetization later through lead fees, subscriptions, or completed-job commission

## Tech Stack

- Vinext / React
- Tailwind CSS
- Cloudflare D1
- Drizzle ORM
- Sites deployment

## Local Setup

```bash
npm install
npm run db:generate
npm run dev
```

## Validation

```bash
npm run build
npm test
```

## Next Production Steps

- Keep `RESEND_API_KEY` in Sites environment variables so live email delivery stays active
- Connect WhatsApp Cloud API, WATI, or AiSensy for vendor/customer notifications
- Add admin authentication before sharing dashboard publicly
- Add vendor verification fields such as ID proof, service photos, and areas
- Add customer rating and complaint tracking
- Add vendor wallet or subscription plans after pilot data is strong
