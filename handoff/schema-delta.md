# Schema Delta — v0.1 → v0.2

> Diff สำหรับ Prisma schema; ใส่หลัง v0.1 schema (อยู่ใน `uploads/spec.md` section 7) — ดู `spec-v0.2.md` สำหรับ full schema

---

## Edits to existing models

### `ClientProfile`

```diff
   medicalHistory        String?  @db.Text
+  interestTags          String[] @default([])
   wearableType          String?
   googleHealthConnected Boolean  @default(false)
   googleHealthTokens    Json?
   assignedCoachId       String?
+  // measurement cadence
+  weightCadence         String   @default("weekly")  // daily | weekly | biweekly
+  waistCadence          String   @default("biweekly")
+  bpCadence             String   @default("as-needed")
+  glucoseCadence        String   @default("as-needed")
```

### `DailyCheckIn`

```diff
-  supplementsTaken Json?  // array of {name, time}
+  supplementsTaken Json?  // @deprecated v0.2 — use MedicationLog
```

ใน MVP เก็บ field นี้ไว้ก่อน (backwards compatible). Daily check-in form Phase 1 ยังเขียน JSON ลงที่นี่ได้ — แต่ canonical source of truth คือ `MedicationLog` table

### `Session`

```diff
   actionItems      Json?
+  attachedSnapshot Json?  // snapshot ของ 6-pillar + body metrics ณ วัน session
   status           String
```

### `User`

เพิ่ม relations:

```diff
   dailyCheckIns    DailyCheckIn[]
   messages         Message[]
+  bodyMeasurements BodyMeasurement[]
+  vitalReadings    VitalReading[]
+  labPanels        LabPanel[]
+  medications      Medication[]
```

---

## New models

### `BodyMeasurement`

```prisma
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
```

### `VitalReading`

```prisma
model VitalReading {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  type        String   // "bp" | "glucose"
  measuredAt  DateTime
  context     String?  // BP: morning/evening/post-stress; glucose: fasting/post-meal/random/bedtime
  values      Json     // {sys, dia, hr} or {value, unit}
  notes       String?  @db.Text
  flag        String?  // "normal" | "low" | "high" | "critical" — auto-computed on insert

  @@index([userId, type, measuredAt])
}
```

**Validation on insert (`src/lib/vitals.ts`):**

```ts
function computeBpFlag(sys: number, dia: number): VitalFlag {
  if (sys >= 180 || dia >= 120) return 'critical';
  if (sys >= 140 || dia >= 90)  return 'high';
  if (sys < 90  || dia < 60)    return 'low';
  return 'normal';
}

function computeGlucoseFlag(v: number, context: GlucoseContext): VitalFlag {
  if (v >= 300) return 'critical';
  if (context === 'fasting') {
    if (v >= 126) return 'high';
    if (v < 70)   return 'low';
  } else if (context === 'post-meal') {
    if (v >= 200) return 'high';
  }
  return 'normal';
}
```

### `LabPanel` + `LabResult`

```prisma
model LabPanel {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  date        DateTime
  labName     String?
  note        String?  @db.Text
  summary     String?  @db.Text  // coach-written
  photoUrl    String?
  status      String   // "draft" | "published"
  createdAt   DateTime @default(now())

  results     LabResult[]

  @@index([userId, date])
}

model LabResult {
  id          String   @id @default(cuid())
  panelId     String
  panel       LabPanel @relation(fields: [panelId], references: [id], onDelete: Cascade)
  category    String   // "lipids" | "glucose" | "liver" | "kidney" | "inflammation" | "vitamins" | "other"
  name        String   // "LDL-C", "HbA1c", etc.
  value       Float
  unit        String
  refLow      Float?
  refHigh     Float?
  flag        String   // "low" | "normal" | "high" | "critical"
  watch       Boolean  @default(false)

  @@index([panelId, category])
}
```

**Lab range config (`src/lib/lab-ranges.ts`):**

```ts
// Reference ranges keyed by canonical name + unit
// Per-client override stored in ClientProfile.labRangeOverrides (Json) — Phase 2
export const LAB_RANGES: Record<string, { low: number; high: number; unit: string; category: string }> = {
  'total-cholesterol':   { low: 0,   high: 200, unit: 'mg/dL', category: 'lipids' },
  'ldl':                 { low: 0,   high: 130, unit: 'mg/dL', category: 'lipids' },
  'hdl':                 { low: 40,  high: 999, unit: 'mg/dL', category: 'lipids' },
  'triglycerides':       { low: 0,   high: 150, unit: 'mg/dL', category: 'lipids' },
  'fasting-glucose':     { low: 70,  high: 100, unit: 'mg/dL', category: 'glucose' },
  'hba1c':               { low: 4.0, high: 5.7, unit: '%',     category: 'glucose' },
  'ast':                 { low: 10,  high: 40,  unit: 'U/L',   category: 'liver' },
  'alt':                 { low: 7,   high: 56,  unit: 'U/L',   category: 'liver' },
  'creatinine':          { low: 0.7, high: 1.3, unit: 'mg/dL', category: 'kidney' },
  'egfr':                { low: 90,  high: 999, unit: 'ml/min', category: 'kidney' },
  'vitamin-d':           { low: 30,  high: 100, unit: 'ng/mL', category: 'vitamins' },
  'hs-crp':              { low: 0,   high: 1.0, unit: 'mg/L',  category: 'inflammation' },
  // ... extend as needed
};
```

### `Medication` + `MedicationLog`

```prisma
model Medication {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  type          String   // "rx" | "supplement" | "prn"
  name          String
  dose          String   // free text — "2000 IU", "500mg", "1 tab"
  schedule      String[] @default([])  // ["เช้า", "ก่อนนอน"]
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
```

---

## Migration sequence

```bash
# After dropping new models into schema.prisma:
npx prisma migrate dev --name v0.2-body-labs-meds

# Seed (extend prisma/seed.ts):
#  - ทดสอบ BodyMeasurement: 30 weight readings, 14 waist readings
#  - VitalReading: 5 BP readings, 5 glucose readings (mix of contexts)
#  - LabPanel: 2 panels (one mar 2026 with full results, one sep 2025)
#  - Medication: 5 active (rx + supplement mix), 1 discontinued
#  - MedicationLog: last 14 days for each active med
npx prisma db seed
```

---

## Indexes worth thinking about

- `BodyMeasurement(userId, type, measuredAt)` — น้ำหนัก/รอบเอว query by date range จะรัวบ่อย
- `VitalReading(userId, type, measuredAt)` — same
- `LabResult(panelId, category)` — group by category สำหรับ panel view
- `MedicationLog(medicationId, date)` — adherence rolling window query

---

## Backwards compatibility

- `DailyCheckIn.supplementsTaken` ยังอ่านได้สำหรับ records เก่า — UI ใหม่ใช้ `MedicationLog` แทน
- Action items schema ใน `Session.actionItems` ขยายให้รองรับ `pillar` field (optional)
- Snapshot ที่แนบกับ session ใหม่ include body metrics + recent vitals — backwards compatible เพราะเป็น Json
