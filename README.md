# Longevity Designer

Phase 1 MVP — internal coach (designer) + client web app.

## Stack
Next.js 15 (App Router) · TypeScript strict · Tailwind CSS · Prisma (Postgres) · NextAuth.js v5.

## Quick start
```bash
pnpm install        # หรือ npm install
cp .env.example .env
# กรอก DATABASE_URL + AUTH_SECRET (openssl rand -base64 32)
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed    # สร้าง coach@example.com + client@example.com (รหัส: changeme-dev)
pnpm dev
```

## Auth
- Email + password (NextAuth Credentials provider) — เก็บ `passwordHash` ที่ `User`
- Google OAuth — เปิดอัตโนมัติเมื่อใส่ `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
- Middleware (`src/middleware.ts`) กันเส้นทาง `/coach/*` (COACH/ADMIN) และ `/client/*` (CLIENT)
- หน้า login: `/login`

## Docs
- `handoff/spec-v0.2.md` — PRD เต็ม (read this first)
- `handoff/design-tokens.md` — สี/font/spacing (ลงใน `tailwind.config.ts` แล้ว)
- `handoff/screens.md` — inventory 18 screens
- `handoff/schema-delta.md` — Prisma schema additions v0.1 → v0.2
- `handoff/claude-code-additions.md` — Phase 8/9/10 prompts (body/labs/meds)

## Phase status
- [x] Phase 0 — Project setup (Next.js + TS + Tailwind + Prisma scaffold, design tokens)
- [x] Phase 1 — DB + Auth (full v0.1 schema, NextAuth v5 with Credentials + Google, role-based middleware, seed)
- [ ] Phase 2 — Client dashboard + check-in
- [ ] Phase 3 — Donut component
- [ ] Phase 4 — Designer dashboard + client detail
- [ ] Phase 5 — Sessions + chat + invoices
- [ ] Phase 8 — Body & Vitals (v0.2)
- [ ] Phase 9 — Lab Results (v0.2)
- [ ] Phase 10 — Meds (v0.2)
- [ ] Phase 6 — Google Health API
- [ ] Phase 7 — LineOA + polish
