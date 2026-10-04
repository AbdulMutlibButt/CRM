# Speed vision — ISP CRM + ERP

A responsive CRM, finance, support, and network-operations dashboard designed for an internet service provider in Karachi, Pakistan.

## Live demo

https://isp-crm-erp.vercel.app

## Included modules

- Finance dashboard with PKR collection, revenue, dues, expenses, and trend reporting
- Customer directory and customer 360° profile
- Monthly billing, invoice status, payment entry, receipts, and recovery workflows
- Support ticket list and WhatsApp-style ticket detail
- Live customer-device context and 24-hour connectivity history
- Karachi network map, outage detection, alert centre, and device inventory
- Reports, staff assignments, tax settings, and integration placeholders
- Mobile-first technician workspace
- English/Urdu toggle with RTL support
- Light and dark themes
- Responsive desktop, tablet, and mobile layouts

The current repository is a polished frontend prototype with realistic mock data. REST APIs, authentication, databases, MikroTik, RADIUS, SNMP, OLT, Syslog, SMS, and WhatsApp providers can be connected behind the existing UI.

## Tech stack

- React 19
- Next.js 16
- TypeScript
- Tailwind CSS 4
- Shadcn UI primitives
- Lucide icons
- Vercel-compatible Next.js build

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

Install and start:

```bash
npm ci
npm run dev
```

Open the local URL printed in the terminal, normally `http://localhost:3000`.

## Production build

```bash
npm run build
npm run start
```

The production build is generated under `.next/`, including the route manifest expected by Vercel.

## Main source files

- `app/page.tsx` — dashboard screens, state, and interactions
- `app/globals.css` — theme, responsive styling, RTL, and dark mode
- `components/ui/` — reusable interface primitives
- `public/speed-vision-logo.jpg` — company logo and browser icon

## Notes

- All customer and network records are fictional demonstration data.
- Payment, notification, network-control, and export actions are simulated in the frontend.
- Add server-side authorization before connecting production customer or billing data.
