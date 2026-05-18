# Longevity Designer — Specification

> **Version:** 0.2 — handoff to Claude Code
> **Last updated:** 18 พ.ค. 2026
> **Previous:** v0.1 (`spec.md`)
> **What changed in 0.2:** เพิ่ม section 4.9 (Body & Vitals), 4.10 (Lab results), 4.11 (Medication management) + schema เพิ่ม 4 model + visual design reference (canvas 18 หน้า)

---

## 1. Context & Why

### 1.1 ทำไมโปรเจกต์นี้

แฟน (เภสัชกร) มีคนทักมาขอคำปรึกษาด้านสุขภาพจำนวนมากเป็นประจำ — ปัจจุบันตอบฟรีทั้งหมด เวลาที่ใช้ไม่ถูกตีค่า

โปรเจกต์นี้สร้าง **ระบบ** ให้:
- แฟนสามารถรับเคส paid case work อย่างเป็นทางการ โดยใช้เวลาที่มีอยู่อย่างมีประสิทธิภาพ
- ลูกค้าได้รับการดูแลสุขภาพองค์รวมแบบ Longevity (6 ด้าน) ที่ระบบติดตามได้
- ผม (อายุ 50, BMI 22) ช่วย designing ในฐานะ "case study + ผลลัพธ์ที่ปฏิบัติเอง" — เครดิตรองจากแฟน

### 1.2 Position ของบริการ

- **ไม่ใช่:** clinical diagnosis, การรักษาโรค, ลดน้ำหนัก
- **คือ:** Longevity Designer — ดูแลสุขภาพองค์รวมเพื่อชะลอความเสื่อม
- **กรอบวิชาชีพ:** อยู่ในขอบเขตเภสัชกรรม + wellness consulting ไม่ทับซ้อนกับการวินิจฉัย/รักษาโรค

### 1.3 ลำดับที่เลือก

> "พัฒนาระบบให้แข็งแรง ลองใช้กับเคสเดิมก่อน แล้วค่อยดูว่าพัฒนาอะไรเพิ่มได้อีก"

**ไม่ใช่:** เปิดตัวใหญ่ → หาลูกค้า
**คือ:** สร้างระบบ → ใช้กับเคสเดิมที่ปรึกษาอยู่แล้ว → เก็บข้อมูลว่าระบบควรพัฒนาไปทางไหน → ค่อย scale

---

## 2. หลักการออกแบบ

### 2.1 ปรัชญาที่ต้องเคารพ

- **"ผลลัพธ์นำของขาย"** — ระบบไม่ใช่ funnel ขายผลิตภัณฑ์ ระบบคือเครื่องมือดูแลลูกค้า บางคนอาจซื้อผลิตภัณฑ์แอมเวย์ตามมา แต่ไม่ใช่จุดประสงค์หลักของระบบ
- **"ไม่กูรู ไม่หมอ"** — UI/copy ไม่ใช้ภาษากูรู ไม่ใช้ภาษาแพทย์ทางการ ใช้ภาษาคนธรรมดา
- **"เหตุผลนำอารมณ์"** — ลูกค้ากลุ่มนี้พร้อมเปลี่ยน ระบบไม่ต้องโน้มน้าวด้วยอารมณ์ ให้ข้อมูล + insight ที่ดูเข้าใจได้

### 2.2 หลักการเชิงเทคนิค

- **Lean MVP** — Phase 1 = สิ่งที่จำเป็นกับเคส 5-10 คนแรก ไม่ over-engineer
- **Iterate-friendly** — schema และ UI ต้องแก้ง่าย เพราะเคสจริงจะเปลี่ยน requirement
- **Mobile-first** — ลูกค้าจะใช้ผ่านมือถือเป็นหลัก (เข้าผ่าน LineOA)
- **Multi-coach ready (แต่ไม่ทำตอนนี้)** — schema เผื่อหลาย coach ตั้งแต่แรก แต่ UI Phase 1 รองรับแค่ 2 (แฟน + ผม)

---

## 3. User Roles

| Role | คือใคร | สิทธิ์ |
|---|---|---|
| **Designer** (internal: Coach) | แฟน (primary), ผม (secondary) | จัดการลูกค้าทั้งหมด, ดู/แก้ทุก session, บันทึก notes, ดูข้อมูลสุขภาพ |
| **Client** | ลูกค้าที่จ่ายค่า designer | ดู profile ตัวเอง, กรอกข้อมูล daily, ดูประวัติ session, ดู insights, chat กับ coach |
| **Admin** | ผม (เริ่มต้น) | + จัดการ designer accounts, system settings |

---

## 4. Feature Scope — Phase 1 (MVP)

### 4.1 Authentication & Onboarding

- Email + password login (NextAuth.js)
- Google OAuth login (จำเป็นสำหรับ Google Health API authorization อยู่แล้ว)
- LINE Login (เพิ่มใน 0.2 — ลูกค้าหลักมาจาก LineOA)
- Onboarding flow สำหรับ Client:
  1. ข้อมูลพื้นฐาน (ชื่อ, อายุ, เพศ, น้ำหนัก, ส่วนสูง)
  2. ประวัติสุขภาพย่อ (โรคประจำตัว, ยาที่กิน, แพ้อะไร) — text input
  3. เป้าหมาย Longevity (ทำไมมา — text) + หัวข้อที่สนใจ (multi-select chips)
  4. เลือก wearable ที่ใช้ (Garmin, Fitbit, Apple Watch, Samsung, อื่นๆ, ไม่มี)
  5. Connect Google Health API (optional, ข้ามได้)

### 4.2 6 Pillars of Longevity — Data Model

ลูกค้าบันทึก/ระบบดึงข้อมูล 6 ด้าน:

| Pillar | Auto (wearable) | Manual entry |
|---|---|---|
| **Nutrition** | — | Food log (text หรือ photo), supplements taken |
| **Sleep** | Sleep duration, stages, HRV at sleep | Subjective quality 1-10 |
| **Activity** | Steps, exercise minutes, Zone 2 minutes, VO2 Max | Manual workout log |
| **Stress** | HRV, stress score (Garmin/Fitbit) | Subjective rating 1-10, notes |
| **Social** | — | Daily check-in: คุยกับคนเท่าไหร่ / กิจกรรมสังคม |
| **Substances** | — | Alcohol units, smoking, caffeine timing |

**Daily Check-in:** ลูกค้ามี form เดียวที่กรอก quick log ทุกวัน (~1 นาที) ครอบคลุมทั้ง 6 ด้าน (พลังงาน, อารมณ์, การนอน, อาหาร highlight, สังคม, สารต่างๆ)

### 4.3 Wearable Integration

**Phase 1:**
- **Google Health API** (primary) — รองรับ Fitbit, Pixel Watch, Fitbit Air (ใหม่)
  - OAuth 2.0 connect flow
  - Pull data types: steps, heart rate, HRV, sleep, exercise, weight, oxygen saturation, stress
  - Webhook subscriptions สำหรับ data update
- **Manual entry fallback** — ทุก data type บน wearable ต้อง manual กรอกได้ด้วย

**Phase 2 (ไม่ทำตอนนี้):**
- Apple Health via Health Auto Export (REST webhook)
- Garmin Health API direct
- Samsung Health via Health Connect bridge

### 4.4 Session

**2 รูปแบบ session — ระบบรองรับทั้งคู่:**

**A. Scheduled Session (video/in-person)** — coach นัด appointment ผ่านระบบ; client เห็น calendar slot; ก่อน session: coach review ข้อมูลลูกค้าใน dashboard; ระหว่าง/หลัง session: coach บันทึก session notes (rich text, มี template); หลัง session: ส่ง action items ให้ client

**B. Async Session (chat-based)** — client ส่งคำถาม/ข้อมูลผ่าน in-app chat; coach ดู notification → reply เมื่อสะดวก; Thread ผูกกับ profile ลูกค้า

**Session record schema:** session_id, client_id, coach_id, type (scheduled/async), datetime, duration, summary, action_items, attached_data (snapshot ของ metrics ณ วันนั้น)

### 4.5 Designer Dashboard

**หน้าหลัก:** รายชื่อ active clients · alert: ใครมี metrics ผิดปกติ (HRV ต่ำติดต่อกัน, นอนน้อยกว่า target, daily check-in ไม่ครบ) · upcoming sessions · unread chat messages

**Client detail view:** 6-pillar overview (donut graphs) · timeline 7/30/90 วัน · session history · chat thread · add session button · quick actions

### 4.6 Client Dashboard

**หน้าหลัก:** today's 6-pillar status (donut graphs) + overall Longevity score · daily check-in button (ถ้ายังไม่กรอกวันนี้) · recent insights จาก coach · upcoming session · chat shortcut

**Detail views:** per-pillar deep dive (กราฟ trend 7/30/90) · session history · action items (checkable list)

### 4.7 Payment (Offline ก่อน)

- ระบบบันทึก invoice (number, amount, due date, status)
- Coach mark "paid" หลังได้รับโอน
- Client เห็น invoice history + payment status
- **ไม่มี** payment gateway ใน Phase 1

### 4.8 LineOA Integration

**Phase 1 scope (เริ่มต่ำมาก):**
- LineOA = ประตูเข้า
- มี rich menu link → Web App login page + LINE Login OAuth
- ไม่มี chatbot, ไม่มี broadcast (Phase 2)
- ใช้ LineOA free tier ก่อน

### 4.9 Body & Vitals **(เพิ่มใน v0.2)**

นอกเหนือจาก daily check-in, ลูกค้าบันทึก measurement ที่มี cadence ต่างกัน:

| Metric | Cadence ที่ default | Configurable per-client | Context tag |
|---|---|---|---|
| **น้ำหนัก** | daily | weekly/daily | morning/evening |
| **รอบเอว** | biweekly | weekly/biweekly/monthly | — |
| **ความดัน** | as-needed | scheduled-daily ได้ | morning/evening/post-stress |
| **น้ำตาลในเลือด** | as-needed | scheduled-daily ได้ | fasting/post-meal/random/bedtime |

**UI:**
- หน้า **Body & Vitals** dashboard (artboard 14) แสดง 4 metrics เป็น card grid, น้ำหนักได้ hero treatment + trend chart 60 วัน
- หน้า **Quick log** (artboard 15) bottom-sheet style, 4 tabs สลับ — เลือกได้ว่าจะลงค่าไหน, big number input, มี "ค่าใกล้เคียง" ให้กดเร็ว
- Coach detail view เพิ่ม panel แสดง trend และล่าสุดของแต่ละ vital

**Validation:**
- น้ำหนัก: 30-200 kg
- รอบเอว: 50-150 cm
- BP systolic: 70-220, diastolic: 40-140
- Glucose: 40-500 mg/dL — flag automatically ถ้า fasting >126 หรือ random >200

**Scoring impact:**
- Body metrics ไม่เข้า 6-pillar score โดยตรง (แยก track) — แต่ coach ใช้ในการ contextualize Nutrition + Activity

### 4.10 Lab Results **(เพิ่มใน v0.2)**

บางเคสมีผลตรวจเลือดประจำปี/รายไตรมาส — ระบบเก็บ panel-by-panel:

**ลูกค้า:**
- หน้า **Lab Results** (artboard 16) แสดง panel ล่าสุด + ค่าที่ต้องดู (auto-flagged ตาม reference range) + ผลทั้งหมดจัดกลุ่ม (ไขมัน / น้ำตาล / ตับ / ไต / อักเสบ / วิตามิน) + ประวัติย้อนหลัง
- หน้า **เพิ่มผลตรวจ** (artboard 17) — 2 ทางเข้า: ถ่ายรูป (coach extract) หรือกรอกเอง (เลือก panel template — Lipid, Liver, Kidney, Vitamins ฯลฯ); ส่งเป็น draft → coach review

**Coach:**
- ใน client detail page มี tab "Labs" เพิ่ม — ดู panel ทั้งหมด + เปรียบเทียบ trend ของแต่ละ value ข้าม panels
- Process: รับ draft จาก client → ตรวจ → publish

**Reference ranges:**
- เก็บใน config file (`src/lib/lab-ranges.ts`) ครอบคลุม panel ทั่วไป
- รองรับ unit conversion (mg/dL ↔ mmol/L สำหรับ glucose, cholesterol)
- Flag levels: low / normal / high / critical
- Per-client override (เช่น เป้า LDL ต่ำกว่าปกติเพราะมีประวัติครอบครัว)

### 4.11 Medication & Supplement Management **(เพิ่มใน v0.2)**

แทนที่จะมีแค่ supplements taken ใน daily check-in, ระบบเก็บ canonical list ของ medication/supplement ทั้งหมดที่ client กินอยู่:

**ประเภท (type):**
- `rx` — ยาตามใบสั่งแพทย์ (เช่น allopurinol, statin)
- `supplement` — อาหารเสริม (vitamin D, omega-3, magnesium)
- `prn` — ยาเมื่อจำเป็น (paracetamol, antihistamine)

**ข้อมูลต่อรายการ:**
- ชื่อ, dose, schedule (เช้า/กลางวัน/เย็น/ก่อนนอน หรือเมื่อจำเป็น)
- เหตุผล (text — "ระดับ vitamin D ต่ำ")
- source — doctor / pharmacist / coach / self (badge สีต่างกัน)
- startedDate, stoppedDate, status (active/paused/discontinued)

**Daily adherence tracking:**
- Client ติ๊กว่ากินแล้ว/พลาด ผ่าน daily check-in หรือกดที่ schedule บนหน้า meds
- Coach เห็น adherence % (last 7d) บนทุกการ์ด
- Discontinued items ยังอยู่ในรายการ (กรองได้) เพื่อ historical context

**UI:**
- หน้า **รายการยา · อาหารเสริม** (artboard 18) — schedule วันนี้ (group by slot) + active list (grouped by type) + discontinued
- Onboarding step 2 ใส่รายการเริ่มต้นได้ (text input ตอนนี้, parse เป็น records ผ่าน coach review)

---

## 5. UI / Visual Design

### 5.1 Visual Direction

ดู `design-tokens.md` สำหรับ exact values; **`screens.md`** สำหรับรายละเอียดทุก artboard

- **Donut graphs (Garmin-inspired)** — segmented arcs (14–24 segments) มี gap ระหว่าง segments — primary chart สำหรับ 6 pillars
- **Color palette (MyFitnessPal-inspired)** — 6 pillar colors เป็น accents (teal/blue/coral/amber/green/purple), neutrals คือ ink #14142B + canvas #F6F7FB
- **Typography:** Noto Sans Thai (primary) + Inter (numbers), base 15-16px, ขนาดใหญ่พอสำหรับ 30-60 อ่านสบาย
- **Spacing:** generous, mobile touch targets ≥ 44px

### 5.2 Chart Library

- **Recharts** สำหรับ line/area chart (pillar trends)
- **Custom SVG** สำหรับ donut (control segment gap ได้ดีกว่า) + range bar (lab values vs reference range)

### 5.3 Breakpoints

- 360px mobile (primary) — client app
- 1280-1440px desktop — designer console

### 5.4 Design Reference

- **Canvas:** `index.html` ใน root ของ project — 18 artboards บน design canvas เดียวกัน
- **Source:** `components/screens/*.jsx` แต่ละไฟล์ = 1 screen
- **Tokens:** `styles.css` มี CSS variables ตรงกับ `design-tokens.md`

---

## 6. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Mature, deploy ง่ายบน Vercel, RSC ลด JS |
| Language | TypeScript (strict) | Type safety ตั้งแต่ต้น |
| Styling | Tailwind CSS + shadcn/ui | Component library พร้อม, customize ง่าย |
| Charts | Recharts + custom SVG donut | composable + Garmin look |
| Database | Postgres (Supabase หรือ Neon) | JSONB เผื่อข้อมูลยืดหยุ่น |
| ORM | Prisma | Type-safe, migration ดี |
| Auth | NextAuth.js v5 | Google + LINE + credentials |
| Health API | Google Health API (REST) | server-to-server |
| File storage | Supabase Storage / Cloudflare R2 | food log, lab photos |
| Hosting | Vercel | ง่ายต่อ iterate |

---

## 7. Database Schema

> **Note:** v0.1 schema is here in full; **new models** are marked `*** NEW ***`. ดู `schema-delta.md` สำหรับ diff อย่างเดียว

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  name              String
  role              Role     // COACH | CLIENT | ADMIN
  createdAt         DateTime @default(now())

  clientProfile     ClientProfile?
  coachProfile      CoachProfile?

  sessionsAsClient  Session[] @relation("ClientSessions")
  sessionsAsCoach   Session[] @relation("CoachSessions")
  dailyCheckIns     DailyCheckIn[]
  messages          Message[]
  bodyMeasurements  BodyMeasurement[]
  vitalReadings     VitalReading[]
  labPanels         LabPanel[]
  medications       Medication[]
}

model ClientProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id])
  dateOfBirth           DateTime
  gender                String
  heightCm              Float
  weightKg              Float    // initial weight; current = latest BodyMeasurement
  medicalHistory        String?  @db.Text
  allergies             String?  @db.Text
  longevityGoal         String?  @db.Text
  interestTags          String[] @default([]) // ["energy", "sleep", "fitness", ...]
  wearableType          String?
  googleHealthConnected Boolean  @default(false)
  googleHealthTokens    Json?
  assignedCoachId       String?
  assignedCoach         User?    @relation("AssignedCoach", fields: [assignedCoachId], references: [id])
  // *** NEW: per-client measurement cadence ***
  weightCadence         String   @default("weekly") // daily | weekly | biweekly
  waistCadence          String   @default("biweekly")
  bpCadence             String   @default("as-needed")
  glucoseCadence        String   @default("as-needed")
}

model CoachProfile {
  id           String  @id @default(cuid())
  userId       String  @unique
  user         User    @relation(fields: [userId], references: [id])
  credentials  String?
  bio          String? @db.Text
  isPrimary    Boolean @default(false)
}

model DailyCheckIn {
  id             String   @id @default(cuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  date           DateTime @db.Date

  energyLevel    Int?     // 1-10
  moodLevel      Int?     // 1-10
  sleepQuality   Int?     // 1-10
  stressLevel    Int?     // 1-10

  nutritionNotes   String? @db.Text
  // *** v0.2: deprecated; use MedicationLog ***
  supplementsTaken Json?

  socialActivities String? @db.Text

  alcoholUnits   Float?
  caffeineCount  Int?
  smokedToday    Boolean?

  notes          String? @db.Text

  @@unique([userId, date])
}

model HealthMetric {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  date       DateTime
  source     String
  metricType String
  value      Float
  unit       String
  rawData    Json?

  @@index([userId, metricType, date])
}

model Session {
  id            String   @id @default(cuid())
  clientId      String
  client        User     @relation("ClientSessions", fields: [clientId], references: [id])
  coachId       String
  coach         User     @relation("CoachSessions", fields: [coachId], references: [id])
  type          String   // scheduled | async
  scheduledAt   DateTime?
  durationMin   Int?
  summary       String?  @db.Text
  actionItems   Json?    // array of {text, completed, due, pillar}
  attachedSnapshot Json? // snapshot ของ 6-pillar ณ วัน session
  status        String   // upcoming | completed | cancelled
  createdAt     DateTime @default(now())
}

model Message {
  id          String   @id @default(cuid())
  threadId    String
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  content     String   @db.Text
  attachments Json?
  createdAt   DateTime @default(now())

  @@index([threadId, createdAt])
}

model Invoice {
  id          String   @id @default(cuid())
  clientId    String
  amount      Float
  currency    String   @default("THB")
  description String
  issuedDate  DateTime
  dueDate     DateTime
  paidDate    DateTime?
  status      String   // pending | paid | overdue | cancelled
  notes       String?
}

// *** NEW v0.2 ***
model BodyMeasurement {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "weight" | "waist"
  value       Float
  unit        String   // "kg" | "cm"
  measuredAt  DateTime
  context     String?  // "morning" | "evening" | etc.
  notes       String?  @db.Text

  @@index([userId, type, measuredAt])
}

// *** NEW v0.2 ***
model VitalReading {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "bp" | "glucose"
  measuredAt  DateTime
  context     String?  // for BP: morning/evening/post-stress; for glucose: fasting/post-meal/random/bedtime
  values      Json     // {sys, dia, hr} or {value, unit}
  notes       String?  @db.Text
  flag        String?  // "normal" | "low" | "high" | "critical" — auto-computed

  @@index([userId, type, measuredAt])
}

// *** NEW v0.2 ***
model LabPanel {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime
  labName     String?
  note        String?  @db.Text
  summary     String?  @db.Text  // coach-written, shown to client
  photoUrl    String?  // original upload
  status      String   // "draft" | "published"
  createdAt   DateTime @default(now())

  results     LabResult[]

  @@index([userId, date])
}

// *** NEW v0.2 ***
model LabResult {
  id          String   @id @default(cuid())
  panelId     String
  panel       LabPanel @relation(fields: [panelId], references: [id], onDelete: Cascade)
  category    String   // "lipids" | "glucose" | "liver" | "kidney" | "inflammation" | "vitamins" | "other"
  name        String
  value       Float
  unit        String
  refLow      Float?
  refHigh     Float?
  flag        String   // "low" | "normal" | "high" | "critical"
  watch       Boolean  @default(false) // surface in "ค่าที่ต้องดู"

  @@index([panelId, category])
}

// *** NEW v0.2 ***
model Medication {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String   // "rx" | "supplement" | "prn"
  name          String
  dose          String   // free text — "2000 IU", "500mg", "1 tab"
  schedule      String[] @default([]) // ["เช้า", "ก่อนนอน"]
  reason        String?  @db.Text
  source        String   // "doctor" | "pharmacist" | "coach" | "self"
  sourceName    String?
  startedDate   DateTime
  stoppedDate   DateTime?
  status        String   // "active" | "paused" | "discontinued"
  createdAt     DateTime @default(now())

  logs          MedicationLog[]

  @@index([userId, status])
}

// *** NEW v0.2 ***
model MedicationLog {
  id            String     @id @default(cuid())
  medicationId  String
  medication    Medication @relation(fields: [medicationId], references: [id], onDelete: Cascade)
  date          DateTime   @db.Date
  slot          String     // "เช้า" | "ก่อนนอน" etc.
  taken         Boolean
  takenAt       DateTime?

  @@unique([medicationId, date, slot])
  @@index([medicationId, date])
}

enum Role {
  COACH
  CLIENT
  ADMIN
}
```

---

## 8. Out of Scope (Phase 1)

- ❌ Apple Health integration
- ❌ Payment gateway online (Stripe/Omise)
- ❌ LineOA chatbot / automated broadcast
- ❌ AI insights generation (Anthropic API) — Phase 2
- ❌ Multi-language UI (Phase 1 = ไทย, อังกฤษเฉพาะที่จำเป็น)
- ❌ Video call integration (ใช้ Line video หรือ Google Meet external)
- ❌ Public-facing marketing site
- ❌ Email notification (in-app + Line notify ก่อน)
- ❌ Drug interaction warnings (Phase 2 — สำคัญ แต่ต้องคุยขอบเขตวิชาชีพก่อน)
- ❌ OCR auto-extract lab from photo (Phase 2 — coach extract เอง Phase 1)

---

## 9. Success Metrics

หลัง 1-2 เดือนใช้กับเคสเดิม 5-10 คน:

**Coach side:**
- แฟนรู้สึกว่าระบบช่วย "ไม่ต้องเริ่มใหม่ทุกครั้ง" เวลาคุยกับลูกค้า
- เวลาที่ใช้ต่อเคสลดลง (ไม่ใช่เพิ่ม)
- มี data ครบพอที่จะให้ insight ที่ specific กับลูกค้า

**Client side:**
- ลูกค้ายังคงกรอก daily check-in อย่างน้อย 4 จาก 7 วัน
- ลูกค้าใช้ chat ส่งคำถาม (= ใช้ระบบจริง ไม่ใช่แค่ log in ดู)
- ลูกค้ายอม pay ใน invoice cycle ที่ 2 (= เห็นค่า)

**System side:**
- Bug ที่ block การใช้งาน < 1 ครั้ง/สัปดาห์
- Schema เปลี่ยนได้โดยไม่ต้อง migrate ข้อมูลใหญ่

---

## 10. Open Questions

ค้างไว้คุยรอบหน้า (ไม่ block การเริ่ม build):

- [ ] Pricing model: subscription รายเดือน, package, หรือ per-session?
- [ ] ลูกค้าคนแรก (จากเคสเดิมที่ทักแฟน) — เป็นใคร? ระบบควร onboard อย่างไรไม่ให้รู้สึกแปลก?
- [ ] กรอบจริยธรรมสภาเภสัชกรรมเรื่อง paid wellness consulting — แฟนเช็กก่อนเปิด paid service
- [ ] Branding / ชื่อโปรเจกต์สาธารณะ (ตอนนี้ใช้ working name "Longevity Designer")
- [ ] Lab OCR — ใช้ external service (Google Cloud Vision) หรือ Anthropic vision API? Phase 2
- [ ] Drug interaction database — ใช้ open source (เช่น openFDA) หรือซื้อ commercial?

---

## 11. References

- **Design canvas:** `index.html` (root) — 18 screens, click-thru ได้ใน browser
- **Design tokens:** `handoff/design-tokens.md`
- **Screen inventory:** `handoff/screens.md` — รายละเอียดทุก screen + จุดที่ต้องระวัง
- **Schema diff vs v0.1:** `handoff/schema-delta.md`
- **Build phases:** `handoff/claude-code-additions.md` — phase 8-10 (body, labs, meds) เพิ่มจาก claude-code.md เดิม
- **v0.1 spec:** `uploads/spec.md` (เก็บไว้เป็น reference)
