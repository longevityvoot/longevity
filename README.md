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

## Deployment

**Hosting:** Vercel · **DB:** Supabase Postgres · **Repo:** GitHub (push → auto-preview)

### Supabase setup
1. สร้าง project บน [supabase.com](https://supabase.com) — เลือก region ใกล้ผู้ใช้ (Singapore สำหรับ TH)
2. Project Settings → Database → Connection string → copy ทั้ง **Pooler** (port 6543) และ **Direct** (port 5432)
3. ใช้ pooler URL เป็น `DATABASE_URL` (Prisma runtime), direct URL เป็น `DIRECT_URL` (migrations)

### Vercel setup
1. Import repo เข้า Vercel — framework auto-detect = Next.js
2. Project Settings → Environment Variables — ใส่:
   - `DATABASE_URL` (Supabase pooler)
   - `DIRECT_URL` (Supabase direct)
   - `AUTH_SECRET` (`openssl rand -base64 32`)
   - `AUTH_URL` = production URL (เช่น `https://longevity.vercel.app`)
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (optional)
3. Build จะรัน `postinstall` → `prisma generate` อัตโนมัติ
4. Migration: รันจาก local ด้วย `pnpm prisma migrate deploy` ที่ชี้ไป Supabase direct URL — Vercel build ไม่ migrate เอง (กัน race ตอน rollback)

### Google OAuth (optional)
- Authorized redirect URIs: `https://<vercel-url>/api/auth/callback/google` + `http://localhost:3000/api/auth/callback/google`

## Docs
- `handoff/spec-v0.2.md` — PRD เต็ม (read this first)
- `handoff/design-tokens.md` — สี/font/spacing (ลงใน `tailwind.config.ts` แล้ว)
- `handoff/screens.md` — inventory 18 screens
- `handoff/schema-delta.md` — Prisma schema additions v0.1 → v0.2
- `handoff/claude-code-additions.md` — Phase 8/9/10 prompts (body/labs/meds)

## Phase status
- [x] Phase 0 — Project setup (Next.js + TS + Tailwind + Prisma scaffold, design tokens)
- [x] Phase 1 — DB + Auth (full v0.1 schema, NextAuth v5 with Credentials + Google, role-based middleware, seed)
- [x] Phase 2 — Client dashboard + daily check-in (6-pillar bars w/ placeholder, scoring lib, full form w/ upsert)
- [x] Phase 3 — Donut component (Garmin-style segmented SVG: DonutScore + MultiDonut, wired into dashboard)
- [x] Phase 4 — Designer dashboard + client detail (client list w/ alerts, 3-col detail w/ profile + scores + 14d table)
- [x] Phase 5 — Sessions + chat + invoices (create session/invoice, toggle paid, shared thread per client)
- [x] Phase 8 — Body & Vitals (BodyMeasurement + VitalReading models, weight/waist/BP/glucose log, server-side flagging, trend chart)
- [x] Phase 9 — Lab Results (LabPanel/Result, 17 reference ranges, draft → publish flow, RangeBar viz)
- [x] Phase 10 — Meds (Medication/MedicationLog, today schedule toggle, 7d adherence %, source-tinted badges)
- [x] Pillar detail page — per-pillar score + 30d trend + drivers (artboard 08)
- [ ] Phase 6 — Google Health API
- [ ] Phase 7 — LineOA + polish
