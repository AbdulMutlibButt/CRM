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

The CRM is a functional browser-local demo. Customer, invoice, payment, ticket, staff, device, alert, expense, and settings changes persist in localStorage under `speed-vision-crm-v1`. Records are shared across tabs of the same origin, not across computers, browsers, or website addresses. There is no authentication or access control; use demo records only.

## Working workflows

- Create/edit customers, packages, statuses and notes; import validated customer JSON using the downloadable template.
- Preview and confirm monthly invoices, skip already-billed customers, and apply configured demo tax rates to new invoices.
- Record partial/full payments, reject overpayments and duplicate payment IDs, update balances, and print receipts or compose them in WhatsApp.
- Track recovery promises and compose reminders; export a reminder list without pretending to send bulk messages.
- Create, assign, edit, reply to and resolve tickets; customer and staff details show their own linked records.
- Manage staff availability, device inventory, simulated device actions, network alerts and linked incident tickets.
- View field assignments, call customers, open area maps and complete jobs.
- Record expenses and view derived dashboard totals; filter/sort/page tables and export current report rows to CSV or print/save as PDF.
- Save company, tax, billing preferences, theme and navigation language; download/validate/restore a full JSON backup.

Real WhatsApp sending, payment gateways, router control, telemetry, automatic billing jobs, real staff permissions and shared storage require server-side integrations. Integration cards save non-secret setup notes only and remain explicitly disconnected. The Urdu toggle translates navigation labels, not every form.

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

- `app/page.tsx` — entry point
- `components/crm-workspace.tsx` — working screens and forms
- `lib/crm.ts` — payment, invoice, billing and export rules
- `lib/demo-store.ts` — versioned browser persistence and backup validation
- `components/legacy-home.tsx` — preserved original static interface
- `app/crm.css` — responsive workspace styling
- `app/globals.css` — theme, responsive styling, RTL, and dark mode
- `components/ui/` — reusable interface primitives
- `public/speed-vision-logo.jpg` — company logo and browser icon

## Notes

- All customer and network records are fictional demonstration data.
- Payments record ledger entries, not real money transfers. Network actions update demo inventory only.
- CSV exports are real downloads. PDF output uses the browser print dialog.
- Billing is manual; the preferred billing day is a saved preference, not a background scheduler.
- Clearing website storage removes records. Keep backups through Settings.
- Add server-side authorization before connecting production customer or billing data.

## Verification

```bash
npm run lint
npm run build
npm run test:crm
```

Browser smoke checks cover customer creation, billing preview/confirmation, overpayment rejection, partial payment, persistence after reload, ticket assignment/reply/resolution and responsive navigation. QA demo records may remain in the local test browser; they are not bundled in the deployed seed data.
