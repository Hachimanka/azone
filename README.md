# AZONE — Aznar Employee Platform

Employee-facing Progressive Web App: dashboard, profile, payslips, DTR, leaves, requests, announcements, notifications and company info.
It is one of two separate Aznar apps — payroll operations live in **APAY**, and both talk to **aznar-api**.

## Stack

React 19 · Vite · TypeScript · Tailwind CSS v4 · React Router · TanStack Query · Zustand · React Hook Form + Zod · Motion · Radix UI · Lucide · vite-plugin-pwa

## Getting started

```bash
cp .env.example .env      # VITE_API_MODE=mock works without a backend
npm install
npm run dev               # http://localhost:5173
```

Demo mode accepts any email/password.

| Script            | What it does                                           |
| ----------------- | ------------------------------------------------------ |
| `npm run dev`     | Dev server                                             |
| `npm run dev:host`| Dev server reachable from your phone on the same Wi-Fi |
| `npm run build`   | Type-check + production build (with service worker)    |
| `npm run preview` | Serve the production build on your network             |

## Install on a phone

The service worker only runs on a production build over HTTPS (or `localhost`).

- **Deployed (recommended):** push to Vercel, open the URL on the phone → *Install app* (Android) or *Share → Add to Home Screen* (iPhone).
- **Local:** `npm run build && npm run preview`, then expose it over HTTPS (e.g. `npx localtunnel --port 4173` or `ngrok http 4173`) and open that URL on the phone.

## Structure

```
src/
  components/ui/       Design-system primitives (Button, Card, StatCard, Badge, Dialog, Field…)
  components/shared/   Feature blocks reused across pages (AttendanceCard, PayslipSummary…)
  components/pwa/      Install prompt + update/offline toast
  features/landing/    Public landing page (/)
  layouts/             App shell: topbar, sidebar, mobile bottom nav
  pages/               Routed screens under /app
  services/            API contract (types.ts), mock + HTTP adapters, React Query hooks
  store/               Auth session (Zustand, persisted)
```

## API

`src/services/types.ts` is the contract with aznar-api. `VITE_API_MODE=mock` uses in-memory data (`services/mock`);
`VITE_API_MODE=http` calls `VITE_API_URL` (`/auth/login`, `/azone/*`). Money is always a decimal string, never a float.

## Design tokens

Colors, radius and shadows are defined in `src/index.css` (`@theme`). Keep them identical in the APAY repo.

## Connecting to aznar-api

Create `.env` with:

```
VITE_API_MODE=http
VITE_API_URL=http://localhost:4000
```

Start `aznar-api` (`npm run dev` in that repo), then restart this app's dev server — Vite reads `.env` only at startup.
Demo accounts are listed in the aznar-api README. Set `VITE_API_MODE=mock` to go back to built-in demo data.
