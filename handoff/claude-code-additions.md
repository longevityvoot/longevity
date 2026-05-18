# Claude Code — Additional Phases (v0.2)

> ใช้ต่อจาก `uploads/claude-code.md` Phase 0-7 — เพิ่ม 3 phases สำหรับ features ใหม่ใน v0.2
> Phases ใหม่นี้แทรกได้หลัง Phase 5 (Sessions + Chat + Invoices) ก่อน Phase 6 (Google Health API) — หรือทำหลัง Phase 7 ก็ได้

---

## PHASE 8 — Body & Vitals tracking

```
อ่าน spec-v0.2.md section 4.9 + schema-delta.md ก่อนเริ่ม

1. เพิ่ม models BodyMeasurement, VitalReading ใน prisma/schema.prisma ตาม schema-delta.md
2. รัน prisma migrate dev --name body-vitals
3. Update seed: เพิ่ม 30 BodyMeasurement (weight, ห่างกัน 2 วัน), 14 waist readings, 5 BP, 5 glucose สำหรับ test client

4. สร้าง src/lib/vitals.ts:
   - computeBpFlag(sys, dia) → "normal" | "low" | "high" | "critical"
   - computeGlucoseFlag(value, context) → same
   - validateRanges(type, payload) ใช้ก่อน save

5. สร้าง pages:
   A. /client/body  (artboard 14 = handoff/screens.md ref)
      - 4 metric cards: น้ำหนัก (hero w/ 60d chart) + รอบเอว + BP + glucose
      - Per-card cadence chip (รายวัน / รายสัปดาห์ / เมื่อต้องการ — pull จาก ClientProfile)
      - Recent BP log list ที่ด้านล่าง
      - Link ไป /client/labs

   B. /client/body/log  (artboard 15)
      - 4 tabs: weight / waist / BP / glucose
      - Big number input + Recharts not needed
      - Context tag picker สำหรับ BP/glucose
      - Server action POST → BodyMeasurement หรือ VitalReading (เลือกตาม type)
      - ทุก save → flag computed server-side + toast confirmation

6. Update /coach/clients/[id]:
   - Add tab "Body & Vitals" ข้าง 6-pillar tabs
   - Show: weight trend (line), waist trend, BP scatter (sys ↔ dia), glucose by context
   - Recent readings table

7. Cadence settings — /client/settings/cadence (basic page):
   - 4 dropdowns: weight cadence, waist, BP, glucose
   - Save → ClientProfile.{weight,waist,bp,glucose}Cadence

หลังเสร็จ: login เป็น test client → log weight → ตรวจ /designer view เห็น
```

---

## PHASE 9 — Lab Results

```
อ่าน spec-v0.2.md section 4.10 + schema-delta.md ก่อนเริ่ม

1. เพิ่ม models LabPanel, LabResult ใน schema; migrate
2. สร้าง src/lib/lab-ranges.ts ตาม schema-delta.md (extend LAB_RANGES)
3. Seed: 2 panels (mar 2026 + sep 2025) แต่ละ panel มี 12-18 results

4. สร้าง pages:
   A. /client/labs  (artboard 16)
      - Latest panel ขึ้นก่อน
      - Section "ค่าที่ต้องดู" = items with watch=true OR flag=high/low/critical
      - WatchCard component = name + flag chip + value + delta from previous + range bar
      - All results grouped by category (lipids / glucose / liver / kidney / inflammation / vitamins)
      - History list at bottom (clickable to older panels)

   B. /client/labs/new  (artboard 17)
      - 2 entry methods: ถ่ายรูป (file upload, save photoUrl, status="draft", notify coach)
                       หรือ กรอกเอง (select panel template → form)
      - Panel templates ใน src/lib/lab-templates.ts (Lipid, Liver, Kidney, Vitamins, Inflammation, FBC, Glucose+HbA1c)
      - Submit → POST /api/labs → LabPanel(status=draft) + LabResult[] + notify coach

   C. /client/labs/[panelId] — single panel view (read-only หลัง published)

5. Coach side: /coach/clients/[id]/labs
   - Same view + edit buttons
   - "Mark watch" toggle per result
   - "Publish" button → status="draft" → "published" + notify client
   - Trend chart per result (เปรียบเทียบข้าม panels) — เลือก result + chart line ของค่านั้นข้าม panel dates

6. RangeBar component (src/components/charts/RangeBar.tsx):
   - SVG, value position + reference range band
   - Handles ≥ X ranges (no upper bound)
   - Color = flag

หลังเสร็จ: client upload photo → coach see draft → coach manually enter values → publish → client เห็น
```

---

## PHASE 10 — Medication & Supplement Management

```
อ่าน spec-v0.2.md section 4.11 + schema-delta.md ก่อนเริ่ม

1. เพิ่ม models Medication, MedicationLog ใน schema; migrate
2. Seed: 5 active medications (mix of rx + supplement + prn) + 14 days of logs

3. สร้าง pages:
   A. /client/meds  (artboard 18)
      - Header: count active / discontinued
      - "ตารางวันนี้" card — group active meds by schedule slot (เช้า / กลางวัน / เย็น / ก่อนนอน)
        - Each chip clickable → toggle MedicationLog(medicationId, date=today, slot, taken)
      - Tabs: ทั้งหมด / ยาแพทย์สั่ง / อาหารเสริม / หยุดแล้ว
      - Grouped list by type (rx → supplement → prn)
      - MedCard component:
        - Pill icon w/ med.color
        - Name + dose + schedule (joined string)
        - Reason text
        - Source badge (4 variants: doctor/pharmacist/coach/self)
        - Started date / stopped date
        - Adherence: % over 7d + visual bars (5px × 14px green/gray)
      - Discontinued section at bottom (opacity reduced, strike-through name)

   B. /client/meds/[id] — detail page (edit form)
   C. /client/meds/new — add form

4. Update daily check-in:
   - "Supplements" section pulls from active Medication where source != "rx" instead of hardcoded list
   - On save → also write MedicationLog records for each ticked supplement

5. Coach side: /coach/clients/[id]/meds
   - Same view + Add med button
   - "Mark as coach recommendation" → source=designer
   - Adherence trend over time (line chart)

6. Phase 2 prep (ห้ามทำตอนนี้):
   - Drug interaction warnings (need clinical-grade DB)
   - Refill reminders (depends on dose + remaining count)

หลังเสร็จ: login as coach → add med to client → client เห็นในรายการ + ติ๊กกินวันนี้ → adherence อัปเดต
```

---

## Cross-cutting tasks (do before launch)

```
หลังจบ Phase 10 — เก็บงานก่อน soft launch:

1. **ScoreCard component refactor**
   - 6-pillar score calculation ใน src/lib/scoring.ts ต้องรองรับ body metrics ที่เกี่ยวข้อง:
     - Nutrition: integrate weight trend (กำลังลดเข้าเป้า → bonus)
     - Activity: integrate body composition proxy (waist ลด → bonus)
   - แต่ keep simple ก่อน Phase 1 — แค่ daily check-in + wearable

2. **Onboarding update (Phase 1 step 2)**
   - Add medication input — text dump first, coach review + structure later
   - Parse function ที่ coach UI: text → Medication records

3. **Session record** auto-snapshot ขยาย:
   - Snapshot ตอนจบ session ต้อง include: 6-pillar scores, body metrics ล่าสุด, vitals ล่าสุด, lab summary (ถ้ามี), active meds count
   - Schema: Session.attachedSnapshot = Json

4. **Alerts** (designer dashboard):
   - Add new alert types:
     - BP reading high (>140/90) ครั้งเดียวก็ alert
     - Glucose fasting > 126 ใน 2 ใน 3 readings ล่าสุด
     - Adherence < 50% ใน 7 วัน ของ rx med
     - Lab panel uploaded แต่ยัง draft > 3 วัน

5. **A11y pass**
   - Tab order ใน multi-tab screens (quick-log, meds)
   - Number inputs มี proper inputmode="decimal"
   - Color flags ต้องมี text equivalent (ไม่ใช่สีอย่างเดียว)
```

---

## คำสั่งสำหรับ Claude Code session

```
ก่อนเริ่มทุก phase 8-10:
1. อ่าน handoff/spec-v0.2.md ทั้งหมด
2. อ่าน handoff/schema-delta.md ส่วนที่เกี่ยวกับ phase นั้น
3. ดู design reference ใน handoff/screens.md — ระบุ artboard number ที่ตรงกับ feature
4. ถ้าต้องการเห็น UI: เปิด index.html ใน design canvas browser (ไม่ใช่ Claude Code)
   หรืออ่าน components/screens/<feature>.jsx โดยตรง — เป็น design source of truth

ห้าม:
- รวบ phase
- ใส่ feature ที่ไม่ได้อยู่ใน scope ของ phase ปัจจุบัน
- เปลี่ยน color tokens — ใช้ตาม handoff/design-tokens.md เท่านั้น
- ใช้ Recharts สำหรับ donut — ต้องเป็น custom SVG เพื่อ match design

ถ้าเจอ ambiguity → ถามก่อน อย่า assume
```
