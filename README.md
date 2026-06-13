# Pavagexpert

Lead-generation platform for interlocking paver projects in Greater Montreal. Homeowners submit projects; contractors compete to claim them.

**Site:** [pavagexpert.space](https://pavagexpert.space)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16.2](https://nextjs.org) (App Router, standalone output) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 |
| Auth | JWT (`jose`) + `crypto.scryptSync` (no bcryptjs) |
| Storage | Local JSON files (`/data/`) via Docker volume |
| i18n | Custom cookie-based (FR default, EN secondary) |
| Container | Docker (multi-stage, su-exec, non-root) |
| Deploy | GitHub Actions → `ghcr.io` → SWAG reverse proxy on DigitalOcean |

## Features

- Bilingual (FR/EN) with cookie-based locale detection
- Lead submission form with photo upload (max 5 files, 10 MB each)
- Job board with postal code and status filters
- Gallery section
- Services overview page
- Calculator tool
- Blog with 4 articles
- Admin panel (login, analytics dashboard, lead management, contractor CRUD)
- Contractor portal (login, dashboard, profile, password change)
- Rate limiting (3 submissions/hour/IP)
- Security headers, robots.txt, sitemap.xml, JSON-LD structured data
- Psychological copywriting (Jung/Freud-based persuasion)

## Getting Started

### Prerequisites

- Node.js ≥ 22
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `JWT_SECRET` | `dev-secret-...` | Secret for signing auth tokens |
| `ADMIN_USERNAME` | `admin` | Default admin username (seeded on first start) |
| `ADMIN_PASSWORD` | `admin` | Default admin password |
| `DATA_DIR` | `./data` | Directory for JSON stores and uploaded photos |

## Project Structure

```
src/
├── app/
│   ├── [locale]/           # Route pages (fr/, en/)
│   │   ├── admin/          # Admin dashboard
│   │   ├── blog/           # Blog listing + articles
│   │   ├── calculator/     # Cost calculator
│   │   ├── contractor/     # Contractor login, dashboard, profile
│   │   ├── gallery/        # Project gallery
│   │   ├── get-quote/      # Lead submission form
│   │   ├── jobs/           # Public job board
│   │   ├── login/          # Admin login
│   │   ├── privacy/        # Privacy policy
│   │   ├── services/       # Services overview
│   │   └── terms/          # Terms of use
│   ├── api/
│   │   ├── admin/          # Admin CRUD + analytics + auth
│   │   ├── contractor/     # Contractor auth + profile
│   │   ├── contact/        # Lead form submission + photo upload
│   │   ├── jobs/           # Public job listing
│   │   └── photos/         # Photo serving
│   ├── sitemap.ts          # Dynamic sitemap
│   ├── robots.ts           # Robots.txt
│   └── layout.tsx
├── components/             # Shared UI components
├── i18n/
│   ├── config.ts           # Locale types and defaults
│   ├── get-messages.ts     # Async message loader
│   └── messages/           # fr.json, en.json
├── lib/
│   ├── admin-store.ts      # Lead/user CRUD (admin-users.json)
│   ├── auth-store.ts       # Credential store (auth.json)
│   ├── auth.ts             # JWT sign/verify
│   ├── blog-data.ts        # Article content
│   ├── constants.ts        # Contact info
│   ├── job-store.ts        # Job persistence (jobs.json)
│   ├── rate-limit.ts       # In-memory rate limiter
│   └── use-translations.ts # i18n React hook + context
├── proxy.ts                # Next.js 16 middleware (auth guards + locale redirect)
└── types.ts                # i18n message type
```

## Docker

```bash
docker build -t pavagexpert .
docker run -p 3000:3000 \
  -e JWT_SECRET=your-secret \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -v jobs_data:/data \
  pavagexpert
```

The container runs as non-root (`nextjs:nodejs`). The `entrypoint.sh` seeds `/data/auth.json` from env vars on first start.

## Deployment

CI/CD via GitHub Actions (`.github/workflows/deploy.yml`):

1. **Build**: Docker image pushed to `ghcr.io/shogodel/pavagexpert:latest`
2. **Deploy**: SSH into DigitalOcean droplet, update `docker-compose.yaml` via awk, pull & recreate container

SWAG reverse proxy handles SSL termination for `pavagexpert.space`. The `JWT_SECRET` is preserved across deploys so existing sessions survive.

## API Overview

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/admin/login` | POST | — | Admin login |
| `/api/admin/logout` | POST | — | Admin logout |
| `/api/admin/change-password` | POST | Admin JWT | Change admin password |
| `/api/admin/analytics` | GET | Admin JWT | Dashboard stats |
| `/api/admin/leads` | GET/POST/PATCH/DELETE | Admin JWT | Lead CRUD |
| `/api/admin/contractors` | GET/POST/PATCH/DELETE | Admin JWT | Contractor CRUD |
| `/api/contractor/login` | POST | — | Contractor login |
| `/api/contractor/change-password` | POST | Contractor JWT | Change contractor password |
| `/api/contractor/profile` | GET/PATCH | Contractor JWT | Contractor profile |
| `/api/contact` | POST | — | Submit lead form (rate-limited) |
| `/api/jobs` | GET | — | Public job listing |
| `/api/photos/[id]` | GET | — | Serve uploaded photos |

## Commands

```bash
npm run dev       # Development server
npm run build     # Production build
npm start         # Start production server
npx next lint     # Run ESLint
```

## License

Private — all rights reserved.
