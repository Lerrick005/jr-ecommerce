# J&R Ecommerce

Single-vendor e-commerce for Kenya. Next.js 15 · TypeScript · Prisma · PostgreSQL · M-Pesa.
Palette: ivory + champagne gold. Layout: Jumia-density grid (Phase 4).

## Quick start

    cp .env.example .env.local
    npm install --legacy-peer-deps
    npm run dev

- http://localhost:3000 — landing
- http://localhost:3000/api/health — { "data": { "status": "ok" } }

## Phase status

- [x] Phase 1 — Foundation
- [ ] Phase 2 — Database (Prisma, Postgres, seed)
- [ ] Phase 3 — Auth