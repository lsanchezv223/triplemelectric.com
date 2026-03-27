# Triple M Electric (Next.js)

Modernized website rebuild for `triplemelectric.ca` using:

- Next.js (App Router)
- Tailwind CSS
- Motion animations
- Lenis smooth scrolling

## 1) Install

```bash
npm install
```

## 2) Local dev

```bash
npm run dev
```

Open: `http://localhost:3010`

## 3) Production build

```bash
npm run build
npm run start
```

## 4) Run with PM2

```bash
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

PM2 app name: `triplemelectric-web`

## 5) Contact form email (SMTP)

Create a `.env.local` with:

```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
CONTACT_TO_EMAIL=info@triplemelectric.ca
CONTACT_FROM_EMAIL=info@triplemelectric.ca
```

Notes:

- `CONTACT_TO_EMAIL` is the recipient inbox.
- `CONTACT_FROM_EMAIL` is the sender shown in the message.
- If `CONTACT_TO_EMAIL` is omitted, it defaults to `info@triplemelectric.ca`.
- Contact API includes basic anti-abuse hardening:
  - Honeypot fields
  - Minimum form-fill time validation
  - Per-IP rate limiting (`5` attempts per `10` minutes)

## Current sections included

- Hero
- Services
- Portfolio
- About
- Contact
- Service detail pages (`/services/[slug]`)
