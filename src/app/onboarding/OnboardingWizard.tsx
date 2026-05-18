"use client";

import { useState } from "react";
import { submitOnboarding } from "./actions";

const INTEREST_TAGS = [
  { key: "energy",     label: "พลังงาน" },
  { key: "sleep",      label: "นอน" },
  { key: "weight",     label: "น้ำหนัก" },
  { key: "longevity",  label: "อายุยืน" },
  { key: "stress",     label: "ลดเครียด" },
  { key: "nutrition",  label: "ยาเสริม" },
  { key: "fitness",    label: "กล้ามเนื้อ" },
  { key: "metabolism", label: "เผาผลาญ" },
];

const WEARABLES = [
  { key: "garmin",  label: "Garmin",         sub: "fenix · vivoactive · venu" },
  { key: "fitbit",  label: "Fitbit / Pixel Watch", sub: "ผ่าน Google Health" },
  { key: "apple",   label: "Apple Watch",    sub: "ผ่าน Health Auto Export" },
  { key: "samsung", label: "Samsung Galaxy Watch", sub: "ผ่าน Health Connect" },
  { key: "other",   label: "อื่นๆ",          sub: "—" },
  { key: "none",    label: "ไม่ใช่ wearable", sub: "กรอกข้อมูลเอง / wearable ขั้นต่ำ" },
];

type FormState = {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: string;
  weightKg?: string;
  medicalHistory?: string;
  allergies?: string;
  longevityGoal?: string;
  interestTags: string[];
  wearableType?: string;
};

const TOTAL_STEPS = 5;

export function OnboardingWizard({ name }: { name: string }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<FormState>({
    name,
    interestTags: [],
    wearableType: "none",
  });
  const [submitting, setSubmitting] = useState(false);

  function patch(p: Partial<FormState>) {
    setState((s) => ({ ...s, ...p }));
  }
  function toggleTag(key: string) {
    setState((s) => ({
      ...s,
      interestTags: s.interestTags.includes(key)
        ? s.interestTags.filter((t) => t !== key)
        : [...s.interestTags, key],
    }));
  }
  function next() {
    if (step < TOTAL_STEPS) setStep(step + 1);
  }
  function back() {
    if (step > 1) setStep(step - 1);
  }

  // Validation per step — gates the next button.
  const canAdvance = (() => {
    switch (step) {
      case 1:
        return (
          !!state.dateOfBirth &&
          !!state.gender &&
          !!state.heightCm &&
          !!state.weightKg
        );
      case 2:
        return true; // optional
      case 3:
        return !!state.longevityGoal?.trim();
      case 4:
        return !!state.wearableType;
      case 5:
        return true; // wearable connect can be skipped
      default:
        return false;
    }
  })();

  async function finish() {
    setSubmitting(true);
    const form = new FormData();
    if (state.dateOfBirth) form.set("dateOfBirth", state.dateOfBirth);
    if (state.gender) form.set("gender", state.gender);
    if (state.heightCm) form.set("heightCm", state.heightCm);
    if (state.weightKg) form.set("weightKg", state.weightKg);
    if (state.medicalHistory) form.set("medicalHistory", state.medicalHistory);
    if (state.allergies) form.set("allergies", state.allergies);
    if (state.longevityGoal) form.set("longevityGoal", state.longevityGoal);
    state.interestTags.forEach((t) => form.append("interestTags", t));
    if (state.wearableType) form.set("wearableType", state.wearableType);
    await submitOnboarding(form);
  }

  return (
    <main className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 1}
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3 disabled:opacity-30"
            aria-label="ย้อน"
          >
            ←
          </button>
          <div className="flex-1">
            <p className="text-[11px] text-ink-4 font-semibold tracking-wide">
              ขั้น {step} จาก {TOTAL_STEPS}
            </p>
            <div className="mt-1 h-1 rounded-pill bg-canvas overflow-hidden">
              <div
                className="h-full bg-ink rounded-pill transition-all duration-300"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
          {step > 1 && step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              className="text-[12px] text-ink-3 font-semibold"
            >
              ข้าม
            </button>
          ) : (
            <span className="size-9" />
          )}
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-6 pb-32">
        {step === 1 ? (
          <Step1
            state={state}
            patch={patch}
          />
        ) : null}
        {step === 2 ? (
          <Step2 state={state} patch={patch} />
        ) : null}
        {step === 3 ? (
          <Step3 state={state} patch={patch} toggleTag={toggleTag} />
        ) : null}
        {step === 4 ? <Step4 state={state} patch={patch} /> : null}
        {step === 5 ? <Step5 /> : null}
      </div>

      <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
        <div className="max-w-[420px] mx-auto">
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={next}
              disabled={!canAdvance}
              className={`w-full h-13 h-12 rounded-md font-semibold text-[15px] inline-flex items-center justify-between px-5 ${
                canAdvance
                  ? "bg-ink text-white"
                  : "bg-canvas border border-border text-ink-4 cursor-not-allowed"
              }`}
            >
              <span>ถัดไป</span>
              <span className="text-[18px]">→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              disabled={submitting}
              className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px] inline-flex items-center justify-between px-5"
              style={{ boxShadow: "0 4px 12px rgba(255, 107, 107, 0.25)" }}
            >
              <span>{submitting ? "กำลังบันทึก..." : "เริ่มใช้งาน"}</span>
              <span className="text-[18px]">→</span>
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

/* -------------------- STEP 1 — ขอรู้จักก่อน -------------------- */
function Step1({
  state,
  patch,
}: {
  state: FormState;
  patch: (p: Partial<FormState>) => void;
}) {
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-ink leading-tight">
        ขอรู้จักก่อน
      </h1>
      <p className="text-[13px] text-ink-3 mt-2">
        ใช้ข้อมูลคำนวณคะแนนและจัดโปรแกรมที่เหมาะกับคุณ
      </p>

      <section className="mt-6 bg-surface rounded-xl p-5 border border-border space-y-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
            วันเกิด
          </span>
          <input
            type="date"
            value={state.dateOfBirth ?? ""}
            onChange={(e) => patch({ dateOfBirth: e.target.value })}
            className="mt-1.5 w-full h-12 rounded-md border border-border-strong px-3 text-[15px] font-num focus:outline-none focus:border-ink"
          />
        </label>

        <fieldset>
          <legend className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
            เพศ
          </legend>
          <div className="mt-1.5 flex gap-2">
            {[
              { v: "male", label: "ชาย" },
              { v: "female", label: "หญิง" },
              { v: "other", label: "อื่นๆ" },
            ].map((o) => (
              <button
                key={o.v}
                type="button"
                onClick={() => patch({ gender: o.v })}
                className={`flex-1 h-12 rounded-md text-[14px] font-semibold border ${
                  state.gender === o.v
                    ? "bg-ink text-white border-ink"
                    : "bg-surface text-ink-2 border-border-strong"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="ส่วนสูง"
            unit="cm"
            value={state.heightCm}
            onChange={(v) => patch({ heightCm: v })}
            min={100}
            max={220}
            step={0.5}
          />
          <NumberField
            label="น้ำหนัก"
            unit="kg"
            value={state.weightKg}
            onChange={(v) => patch({ weightKg: v })}
            min={30}
            max={200}
            step={0.1}
          />
        </div>
      </section>
    </div>
  );
}

/* -------------------- STEP 2 — ประวัติสุขภาพ -------------------- */
function Step2({
  state,
  patch,
}: {
  state: FormState;
  patch: (p: Partial<FormState>) => void;
}) {
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-ink leading-tight">
        ประวัติสุขภาพ
      </h1>
      <p className="text-[13px] text-ink-3 mt-2">
        designer ใช้ดูภาพรวมก่อน session แรก — เว้นว่างได้ถ้ายังไม่อยากกรอก
      </p>

      <section className="mt-6 bg-surface rounded-xl p-5 border border-border space-y-4">
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
            โรคประจำตัว / ยาที่กิน
          </span>
          <textarea
            value={state.medicalHistory ?? ""}
            onChange={(e) => patch({ medicalHistory: e.target.value })}
            rows={4}
            placeholder="เช่น เบาหวานชนิด 2 · allopurinol 100mg เช้า"
            className="mt-1.5 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
          />
        </label>
        <label className="block">
          <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
            แพ้อะไร
          </span>
          <input
            value={state.allergies ?? ""}
            onChange={(e) => patch({ allergies: e.target.value })}
            placeholder="เช่น penicillin, กุ้ง"
            className="mt-1.5 w-full h-12 rounded-md border border-border-strong px-3 text-[14px] focus:outline-none focus:border-ink"
          />
        </label>
      </section>
    </div>
  );
}

/* -------------------- STEP 3 — ทำไมมาที่นี่ -------------------- */
function Step3({
  state,
  patch,
  toggleTag,
}: {
  state: FormState;
  patch: (p: Partial<FormState>) => void;
  toggleTag: (k: string) => void;
}) {
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-ink leading-tight">
        ทำไมมาที่นี่
      </h1>
      <p className="text-[13px] text-ink-3 mt-2">
        เลือกหัวข้อที่เกี่ยวข้อง — ไม่ต้องเป็นทุกข้อ
      </p>

      <section className="mt-6 bg-surface rounded-xl p-5 border border-border">
        <textarea
          value={state.longevityGoal ?? ""}
          onChange={(e) => patch({ longevityGoal: e.target.value })}
          rows={4}
          placeholder="เล่าให้ designer ฟัง — ทำไมอยากดูแลตัวเอง ตอนนี้ติดอะไร อยากให้ผลลัพธ์เป็นแบบไหน"
          className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
        />
      </section>

      <p className="mt-5 text-[11px] uppercase tracking-wider text-ink-4 font-bold px-1">
        หัวข้อที่สนใจ
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {INTEREST_TAGS.map((t) => {
          const on = state.interestTags.includes(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className={`inline-flex items-center px-3.5 h-10 rounded-pill text-[13px] font-semibold border ${
                on
                  ? "bg-ink text-white border-ink"
                  : "bg-surface text-ink-2 border-border-strong"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- STEP 4 — อุปกรณ์ที่ใช้ -------------------- */
function Step4({
  state,
  patch,
}: {
  state: FormState;
  patch: (p: Partial<FormState>) => void;
}) {
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-ink leading-tight">
        อุปกรณ์ที่ใช้
      </h1>
      <p className="text-[13px] text-ink-3 mt-2">
        ถ้ามี wearable เราจะดึงข้อมูลให้อัตโนมัติ — ไม่มีก็กรอกเองได้
      </p>

      <div className="mt-6 space-y-2">
        {WEARABLES.map((w) => {
          const on = state.wearableType === w.key;
          return (
            <button
              key={w.key}
              type="button"
              onClick={() => patch({ wearableType: w.key })}
              className={`w-full p-4 rounded-lg border text-left flex items-center gap-3 ${
                on ? "bg-ink text-white border-ink" : "bg-surface border-border-strong"
              }`}
            >
              <span className="flex-1 min-w-0">
                <span
                  className={`block text-[14px] font-semibold ${on ? "text-white" : "text-ink"}`}
                >
                  {w.label}
                </span>
                <span
                  className={`block text-[11px] mt-0.5 ${
                    on ? "text-ink-5" : "text-ink-4"
                  }`}
                >
                  {w.sub}
                </span>
              </span>
              <span
                className={`size-5 rounded-full border-2 inline-flex items-center justify-center ${
                  on
                    ? "bg-white border-white text-ink"
                    : "border-border-strong text-transparent"
                }`}
              >
                <span className="text-[10px] font-bold">✓</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------- STEP 5 — เชื่อม Google Health -------------------- */
function Step5() {
  const items = [
    "กิจกรรม · กล้ามเนื้อ",
    "อัตราการเต้นหัวใจ · HRV",
    "การนอน · sleep stages",
    "น้ำตาล · oxygen saturation",
  ];
  return (
    <div>
      <h1 className="text-[26px] font-bold tracking-tight text-ink leading-tight">
        เชื่อม Google Health
      </h1>
      <p className="text-[13px] text-ink-3 mt-2">
        เราจะดึงข้อมูล steps · HRV · sleep · exercise · weight จาก Google Health API
        — สำหรับ Fitbit, Pixel Watch หรือ Health Connect
      </p>

      <section className="mt-6 bg-surface rounded-xl p-5 border border-border">
        <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
          ดึงอะไรบ้าง
        </p>
        <ul className="mt-3 space-y-2.5">
          {items.map((t) => (
            <li key={t} className="flex items-start gap-2 text-[14px] text-ink-2">
              <span className="size-5 mt-0.5 rounded-full bg-pillar-social text-white inline-flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-[11px] text-ink-4 mt-5 text-center">
        ข้ามไปก่อน — ทำเองทีหลัง ในหน้า settings
      </p>
    </div>
  );
}

/* -------------------- helpers -------------------- */
function NumberField({
  label,
  unit,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  unit: string;
  value: string | undefined;
  onChange: (v: string) => void;
  min: number;
  max: number;
  step: number;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
        {label}
      </span>
      <div className="mt-1.5 relative">
        <input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          min={min}
          max={max}
          step={step}
          className="w-full h-12 rounded-md border border-border-strong pl-3 pr-10 text-[16px] font-num focus:outline-none focus:border-ink"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">
          {unit}
        </span>
      </div>
    </label>
  );
}
