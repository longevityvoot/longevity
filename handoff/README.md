# Handoff Package — Longevity Designer v0.2

> สร้าง: 18 พ.ค. 2026
> ใช้ส่งต่อให้ Claude Code build phase 1 MVP + features ใหม่ (body/labs/meds)
> ผู้รับ: คุณ (เจ้าของโปรเจกต์) — เปิด Claude Code → วาง prompt ทีละ phase

---

## ไฟล์ในชุดนี้

### Brand naming — Longevity Designer

**ชื่อ role ที่ใช้กับลูกค้า: "Longevity Designer"** — ไม่ใช่ "Longevity Coach"
- UI ทุกแห่งที่ลูกค้าเห็น = "designer" / "Longevity Designer"
- Internal code identifiers ที่ใช้เป็น engineering primitive (Prisma `Role.COACH`, route `/coach/*`, component name `CoachShell`, mock var `COACH_CLIENTS`) **คงไว้เป็น `coach`** เพื่อหลีกเลี่ยง refactor schema/routes ทั้งหมด — Claude Code ไม่ต้องเปลี่ยน
- ถ้าจะ refactor identifiers ในอนาคต: Phase 2 ทำตอนเดียวพร้อม migration script

| ใช้ที่ไหน | คำที่ใช้ |
|---|---|
| Brand / UI copy / docs ภายนอก | **Longevity Designer** |
| Prisma role enum | `COACH` (internal) |
| Routes | `/coach/*`, `/client/*` (internal) |
| Component names | `CoachShell`, `CoachDashboardScreen` (internal) |
| Source badge labels | "designer แนะ" (UI) — `source: "designer"` (DB) |


| ไฟล์ | ใช้ทำอะไร | ใช้เมื่อไร |
|---|---|---|
| `spec-v0.2.md` | PRD ฉบับสมบูรณ์ — รวม v0.1 + features ใหม่ | **อ่าน + แนบให้ Claude Code ทุก session** |
| `design-tokens.md` | สี/ฟอนต์/spacing/radii — ใส่ Tailwind config | Phase 0 (project setup) + ทุกครั้งที่สร้าง component ใหม่ |
| `screens.md` | inventory 18 screens + design notes | Phase 2+ ทุก phase ที่ build UI |
| `schema-delta.md` | Prisma schema additions (v0.1 → v0.2) | Phase 1 (DB setup) + Phase 8/9/10 |
| `claude-code-additions.md` | Phase 8/9/10 prompts (body/labs/meds) | หลังจบ Phase 5 ของ `claude-code.md` เดิม |

นอกจากนี้ — **ในโปรเจกต์เดียวกัน** มี design reference:
- `index.html` (root) — open in browser เพื่อเห็น 18 screens บน design canvas เดียว
- `components/screens/*.jsx` — source code ของแต่ละหน้า (design source of truth — Claude Code อ่านได้)
- `components/charts.jsx` — DonutScore, MultiDonut, TrendChart, Sparkline ที่ทำเอง (ลอกได้ ปรับให้เป็น TypeScript)
- `components/mock-data.jsx` — ข้อมูล mock ที่ใช้ตอน design → mapping ไป Prisma ใน `screens.md`
- `styles.css` — CSS variables ครบ ใช้เทียบกับ `design-tokens.md`

---

## วิธีใช้ (ลำดับแนะนำ)

### 1. รีวิวเอกสารก่อน

อ่าน `spec-v0.2.md` ทั้งฉบับ 1 รอบ:
- Section 1-3: context, principles, roles (เหมือน v0.1)
- Section 4: feature scope — **section 4.9, 4.10, 4.11 = ของใหม่ใน v0.2**
- Section 7: schema เต็ม
- Section 8: out-of-scope (สำคัญ — เพื่อไม่ให้ Claude Code over-engineer)

อ่าน `screens.md` 1 รอบ — เห็นว่ามี 18 หน้าอะไรบ้าง

### 2. ดูงาน design ก่อนเริ่ม build

เปิด `index.html` ใน browser (ถ้าทำงานในคลาย — ใน Claude project) — เห็น 18 artboards บน design canvas:
- Pan/zoom ด้วยเมาส์
- คลิก fullscreen icon บนการ์ดเพื่อดูเต็มจอ
- ←/→ บนคีย์บอร์ดเพื่อเลื่อนระหว่าง artboards (ใน fullscreen)

ถ้าอยากเปลี่ยน design — บอก Claude (ตัวที่ design) ปรับให้ก่อนค่อย handoff

### 3. ตั้งค่า Claude Code

```bash
# 1. สร้าง folder โปรเจกต์ใหม่ในเครื่อง
mkdir longevity-designer && cd longevity-designer

# 2. คัดลอกไฟล์ handoff ทั้งหมดเข้าไป
#    (จาก project นี้ → save zip → unzip ลง local)
cp /path/to/handoff/* .

# 3. คัดลอก design reference ด้วย (สำคัญ — Claude Code อ่านได้ตอน build)
cp -r /path/to/components ./design-reference/components
cp /path/to/styles.css ./design-reference/
cp /path/to/index.html ./design-reference/

# 4. เปิด Claude Code
cd longevity-designer
claude
```

### 4. รัน phase ทีละครั้ง

**ใช้ prompt จาก `claude-code.md` เดิม (Phase 0-7) เป็นหลัก**, แล้วแทรก Phase 8-10 จาก `claude-code-additions.md` หลัง Phase 5

ลำดับที่แนะนำ:
```
Phase 0: Project setup
Phase 1: DB + Auth
Phase 2: Client dashboard + check-in
Phase 3: Donut component
Phase 4: Designer dashboard + client detail
Phase 5: Sessions + chat + invoices
─── หยุด ทดสอบกับ data จริง 1 case ก่อน ───
Phase 8: Body & Vitals  ← v0.2 ของใหม่
Phase 9: Lab Results    ← v0.2 ของใหม่
Phase 10: Meds          ← v0.2 ของใหม่
Phase 6: Google Health API
Phase 7: LineOA + polish
```

**สำคัญ:** ระหว่างแต่ละ phase ทดสอบกับ data จริง 1-2 case อย่างน้อย ก่อนสั่ง phase ถัดไป

### 5. ก่อนทุก phase สั่ง Claude Code:

```
อ่าน handoff/spec-v0.2.md และ handoff/screens.md ก่อนเริ่ม
ดู design reference ใน design-reference/components/screens/ — เป็นไฟล์ JSX ที่ port มาเป็น TypeScript ได้
ห้ามเปลี่ยน color tokens — ใช้ตาม handoff/design-tokens.md เท่านั้น
ห้าม over-engineer — ทำตาม scope ของ phase ปัจจุบันเป๊ะ
```

---

## ของที่ต้องเตรียม Outside system (ก่อน Phase 0)

- [ ] คุยกับแฟนตรงๆ ว่าจะเริ่มตอนนี้ไหม
- [ ] แฟนเช็กกรอบสภาเภสัชกรรมเรื่อง paid wellness consulting
- [ ] เลือก hosting database: Supabase free tier vs Neon
- [ ] Google Cloud project + OAuth credentials สำหรับ Google Health API
- [ ] LINE Developers — ขอ channel + LINE Login + LineOA
- [ ] ตัดสินใจ pricing model (subscription / package / per-session)
- [ ] ชื่อโปรเจกต์สาธารณะ (working: "Longevity Designer")

---

## หลังจบ Phase 10 — ทำอะไรต่อ

1. **Test กับเคสจริง** — ลูกค้าเดิมที่แฟนคุยอยู่แล้ว 1-2 คน
2. **เขียน discoveries-round-6.md** หลังใช้ 4-6 สัปดาห์
   - feature ที่ใช้จริง vs ที่ไม่ได้แตะ
   - คำขอจากลูกค้า
   - แฟนติดอะไร
3. **ตัดสินใจ phase ถัดไป** จากข้อมูลจริง — ไม่ใช่ assumption

Out of scope ที่ค้างไว้ (จาก spec-v0.2 section 8):
- Apple Health
- Payment gateway
- AI insights (Anthropic API)
- LineOA chatbot/broadcast
- Email notifications
- Drug interaction warnings
- Lab OCR (auto-extract)

---

## ปัญหาที่อาจเจอ

**Q: Claude Code อยาก install package ที่ไม่ได้อยู่ใน spec**
→ ปฏิเสธ ขอให้ทำด้วยที่มีอยู่ก่อน ถ้าจำเป็นจริงๆ ค่อยอนุญาต

**Q: Design canvas บน Claude project ใช้ React 18 + Babel inline — production ใช้ Next.js + TS**
→ Claude Code port: อ่าน JSX → เขียนเป็น `.tsx` ใหม่ + ใช้ Tailwind แทน inline styles
→ Color tokens ตรงกันเป๊ะ (อย่าเปลี่ยนค่า)

**Q: Google Health API breaking changes ปลาย พ.ค. 26**
→ เขียน adapter layer ใน `src/lib/google-health.ts` — schema mapping แยกเป็น function เดียว, แก้ง่าย

**Q: ลูกค้าจริงคนแรก onboarding รู้สึกแปลก (จากที่คุยฟรีมาตลอด → ต้องผ่านระบบ)**
→ แฟนคุยตัวต่อตัวก่อน แล้วสร้าง account ให้ + ส่ง LINE link พร้อม "ลองดูระบบที่ผมเตรียมไว้ครับ"
→ อย่าให้ลูกค้า self-signup ก่อน — Phase 1 = invite only
