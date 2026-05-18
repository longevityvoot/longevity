# Longevity Designer

Phase 1 MVP — internal coach (designer) + client web app.

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Prisma (Postgres) · NextAuth.js v5 (planned).

## Quick start
```bash
pnpm install        # หรือ npm install
cp .env.example .env
pnpm prisma:generate
pnpm dev
```

## Docs
- `handoff/spec-v0.2.md` — PRD เต็ม (read this first)
- `handoff/design-tokens.md` — สี/font/spacing (ลงใน `tailwind.config.ts` แล้ว)
- `handoff/screens.md` — inventory 18 screens
- `handoff/schema-delta.md` — Prisma schema additions v0.1 → v0.2
- `handoff/claude-code-additions.md` — Phase 8/9/10 prompts (body/labs/meds)

## Phase status
- [x] Phase 0 — Project setup (Next.js + TS + Tailwind + Prisma scaffold, design tokens)
- [ ] Phase 1 — DB + Auth
- [ ] Phase 2 — Client dashboard + check-in
- [ ] Phase 3 — Donut component
- [ ] Phase 4 — Designer dashboard + client detail
- [ ] Phase 5 — Sessions + chat + invoices
- [ ] Phase 8 — Body & Vitals (v0.2)
- [ ] Phase 9 — Lab Results (v0.2)
- [ ] Phase 10 — Meds (v0.2)
- [ ] Phase 6 — Google Health API
- [ ] Phase 7 — LineOA + polish
