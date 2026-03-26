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

## Current sections included

- Hero
- Services
- Portfolio
- About
- Contact
- Service detail pages (`/services/[slug]`)
