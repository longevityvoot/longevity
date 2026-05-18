# Screens Inventory — 18 Designed Screens

> ทุก screen render เป็น React component ใน `components/screens/*.jsx`; รวมอยู่ใน design canvas ที่ root (`index.html`)
> Source files คือ design reference ที่แม่นสุด — เปิดดูได้เพื่อเห็น layout, spacing, colors

| # | Screen | Source file | Platform | Notes |
|---|---|---|---|---|
| 01 | Login / Landing | `login.jsx` | mobile | Google + LINE + email; concentric pillar rings hero |
| 02 | Onboarding step 1/5 | `onboarding.jsx` (step=1) | mobile | basic info (name, DOB, gender, height/weight) |
| 03 | Onboarding step 3/5 | `onboarding.jsx` (step=3) | mobile | longevity goal + interest chips |
| 04 | Onboarding step 4/5 | `onboarding.jsx` (step=4) | mobile | wearable selection |
| 05 | Onboarding step 5/5 | `onboarding.jsx` (step=5) | mobile | Google Health connect (skippable) |
| 06 | Client dashboard | `dashboard.jsx` | mobile | overall score + 6-pillar grid + insight + today's metrics + upcoming session |
| 07 | Daily check-in | `checkin.jsx` | mobile | single-scroll, 6 sections, sticky save button, ~1 min completion |
| 08 | Pillar detail (Sleep) | `pillar.jsx` | mobile | hero donut + trend chart + sleep stages + drivers + coach note |
| 09 | Chat (client view) | `chat.jsx` (`ChatMobileScreen`) | mobile | thread + action item card from coach |
| 10 | Designer dashboard | `coach-dashboard.jsx` | desktop | client grid (3-col), filters, alerts, today's sessions, AI insight |
| 11 | Client detail (designer view) | `client-detail.jsx` | desktop | 3-col: profile / 6-pillar overview + action items / chat + sessions |
| 12 | Session record | `session-record.jsx` | desktop | doctor's-note layout: snapshot, pillar review, notes, action items, next session |
| 13 | Chat (designer view) | `chat.jsx` (`ChatDesktopScreen`) | desktop | thread list + thread + live context card (sparkline, caffeine bar) |
| 14 | Body & Vitals | `body.jsx` | mobile | weight hero (60d chart) + waist/BP/glucose cards + BP log + lab link |
| 15 | Quick log | `quicklog.jsx` | mobile | 4 tabs: weight/waist/BP/glucose, big number input, context tags |
| 16 | Lab results panel | `labs.jsx` | mobile | latest panel + watch list (flagged values) + category groups + range bars + history |
| 17 | Lab entry | `lab-entry.jsx` | mobile | photo upload or manual; panel templates; draft → coach review |
| 18 | Meds & supplements | `meds.jsx` | mobile | today's schedule + grouped list (rx/supplement/prn) + adherence bars + source badges + discontinued section |

---

## Design system implementation notes per screen

### Donut component (used in 6, 8, 10, 11, 12)

Custom SVG with N arc segments + gap. See `components/charts.jsx` — `DonutScore` and `MultiDonut`. Garmin-style: 14–24 segments, ~3° gap, rounded caps. **Don't use Recharts PieChart** — won't get the segmented look right.

### TrendChart (used in 6, 8, 11, 14)

Area + line, target line dashed, last point pulsed dot. See `components/charts.jsx` — `TrendChart`. Recharts can replace this, but custom SVG is lighter and matches the spec.

### Range bar (used in 16)

Lab value vs reference range — green band + colored dot at value position. Custom SVG inside `labs.jsx`. Handles "≥ X" ranges (no upper bound) via `hi < 999` logic.

### Schedule slots (used in 18)

Today's medication schedule grouped by time slot (เช้า/กลางวัน/เย็น/ก่อนนอน). Chip color depends on taken status. Replace mock `i < 2 ? taken` with real `MedicationLog` query in implementation.

### Adherence visualization (used in 18)

7-day bar pattern: 5px × 14px vertical bars, green if taken, gray if missed. Plus % display. Calculate over rolling 7 days using `MedicationLog`.

---

## Mock data → real data mapping

ดู `components/mock-data.jsx` — ใช้เป็น contract:

| Mock object | Maps to Prisma model |
|---|---|
| `PILLARS` | hard-coded constant (6 pillars) — same in code |
| `CLIENT_SELF.scores` | computed from `DailyCheckIn` + `HealthMetric` (lib/scoring.ts) |
| `TREND_7D[pillar]` | aggregated `HealthMetric` over date range |
| `TODAY_METRICS` | latest `HealthMetric` (steps, sleep, hrv) |
| `COACH_CLIENTS` | `User.clientProfile` joined with computed scores |
| `MESSAGES` | `Message` per thread |
| `ACTION_ITEMS` | `Session.actionItems` JSON |
| `SUPPLEMENTS` | `Medication` filtered + today's `MedicationLog` |
| `BODY_METRICS.weight.history` | `BodyMeasurement` where type=weight |
| `BODY_METRICS.bp.recent` | `VitalReading` where type=bp, ordered by measuredAt desc, limit 5 |
| `BODY_METRICS.glucose.recent` | `VitalReading` where type=glucose |
| `LAB_PANELS[0]` | latest `LabPanel` with `LabResult[]` |
| `LAB_HISTORY` | `LabPanel` list, summary count of flagged results |
| `MED_LIST` | `Medication` ordered by status, then startedDate desc |

---

## Mobile screen height note

Design size = 360 × 780. Many screens scroll vertically — the `.phone-body` div in styles.css has `overflow-y: auto; padding-bottom: 88px` (bottom nav clearance). Implement with `pb-24` or similar in Tailwind.

---

## Copywriting principles enforced in screens

- "ผม" / "คุณ" — no marketing copy
- Sentence case ทั่วทุกที่ — no Title Case
- ไม่มี emoji ใน body
- Action items / chips ใช้ภาษาคนธรรมดา ("รับเลย" "คุยก่อน" ไม่ใช่ "Accept" / "Discuss")

---

## What's NOT in screens (still TODO before launch)

Screens ที่ขาด — ทำหลัง coach feedback round แรก:

- **Settings / Profile edit** (mobile) — แก้ข้อมูลพื้นฐาน, ปรับ cadence ของ measurements
- **Notification center** (mobile) — สรุป alerts, action items, message ที่ค้าง
- **Integrations** (mobile) — manage Google Health connection, disconnect, sync status
- **Invoice list** (mobile + desktop) — client เห็นรายการ + status, coach create
- **Pillar detail** for 5 อีก pillars นอกจาก sleep (nutrition/activity/stress/social/substances) — pattern เดียวกับ artboard 08 — แค่เปลี่ยน data + color
- **Empty states** — ทุกหน้า list ที่ data ยังว่าง
- **Loading states** — server-rendered skeleton
- **Error boundaries** — 404, network error
- **Coach: client onboarding** — สร้าง client account, ส่ง invite link
