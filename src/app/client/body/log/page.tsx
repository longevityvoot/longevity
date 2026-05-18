import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logBodyMeasurement, logBpReading, logGlucoseReading } from "./actions";

type SearchParams = Promise<{ tab?: string }>;

const TABS = [
  { key: "weight",  label: "น้ำหนัก", unit: "kg" },
  { key: "waist",   label: "รอบเอว", unit: "cm" },
  { key: "bp",      label: "ความดัน", unit: "mmHg" },
  { key: "glucose", label: "น้ำตาล", unit: "mg/dL" },
];

export default async function QuickLogPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tab = "weight" } = await searchParams;
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client/body"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="กลับ"
          >
            ←
          </Link>
          <p className="text-[15px] font-semibold text-ink leading-tight flex-1">
            บันทึก{active.label}
          </p>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-4">
        <nav className="-mx-5 px-5 flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/client/body/log?tab=${t.key}`}
              className={`h-9 px-4 inline-flex items-center rounded-pill text-[12px] font-semibold whitespace-nowrap shrink-0 ${
                t.key === active.key
                  ? "bg-ink text-white"
                  : "bg-surface border border-border text-ink-2"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <section className="mt-4">
          {active.key === "weight" ? <WeightForm /> : null}
          {active.key === "waist" ? <WaistForm /> : null}
          {active.key === "bp" ? <BpForm /> : null}
          {active.key === "glucose" ? <GlucoseForm /> : null}
        </section>
      </div>
    </main>
  );
}

function BigNumberField({
  name,
  unit,
  step,
  min,
  max,
  hint,
}: {
  name: string;
  unit: string;
  step: string;
  min: number;
  max: number;
  hint?: string;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 text-center">
      <div className="relative">
        <input
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          required
          autoFocus
          className="w-full h-20 rounded-md bg-transparent text-[44px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
          placeholder="0"
        />
      </div>
      <p className="text-[13px] text-ink-3 font-medium mt-0.5">{unit}</p>
      {hint ? <p className="text-[11px] text-ink-4 mt-2">{hint}</p> : null}
    </div>
  );
}

function WeightForm() {
  return (
    <form action={logBodyMeasurement.bind(null, "weight")} className="space-y-4">
      <BigNumberField
        name="value"
        unit="kg"
        step="0.1"
        min={30}
        max={200}
        hint="ชั่งหลังตื่นนอน เข้าห้องน้ำ ก่อนทานอาหาร"
      />
      <ContextRadios
        legend="ช่วงเวลา"
        name="context"
        options={[
          { v: "morning", label: "เช้า" },
          { v: "evening", label: "เย็น" },
        ]}
        defaultValue="morning"
      />
      <SubmitButton />
    </form>
  );
}

function WaistForm() {
  return (
    <form action={logBodyMeasurement.bind(null, "waist")} className="space-y-4">
      <BigNumberField
        name="value"
        unit="cm"
        step="0.5"
        min={50}
        max={150}
        hint="วัดที่สะดือ ผ่อนคลายหายใจปกติ"
      />
      <SubmitButton />
    </form>
  );
}

function BpForm() {
  return (
    <form action={logBpReading} className="space-y-4">
      <div className="bg-surface border border-border rounded-xl p-5">
        <div className="flex items-end justify-center gap-1">
          <input
            name="sys"
            type="number"
            inputMode="numeric"
            min="70"
            max="220"
            required
            autoFocus
            placeholder="0"
            className="w-24 h-20 rounded-md bg-transparent text-[44px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
          />
          <span className="text-[36px] font-bold text-ink-4 mb-2 leading-none">/</span>
          <input
            name="dia"
            type="number"
            inputMode="numeric"
            min="40"
            max="140"
            required
            placeholder="0"
            className="w-24 h-20 rounded-md bg-transparent text-[44px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
          />
        </div>
        <p className="text-[13px] text-ink-3 font-medium text-center">mmHg</p>
        <p className="text-[11px] text-ink-4 mt-2 text-center">
          systolic / diastolic
        </p>
      </div>
      <label className="block bg-surface border border-border rounded-lg p-4">
        <span className="text-[12px] text-ink-3 font-semibold">ชีพจร (optional)</span>
        <div className="mt-1 relative">
          <input
            name="hr"
            type="number"
            inputMode="numeric"
            min="30"
            max="220"
            placeholder=""
            className="w-full h-11 rounded-md border border-border-strong pl-3 pr-12 text-[16px] font-num focus:outline-none focus:border-ink"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">
            bpm
          </span>
        </div>
      </label>
      <ContextRadios
        legend="ช่วงเวลา"
        name="context"
        options={[
          { v: "morning", label: "เช้า" },
          { v: "evening", label: "เย็น" },
          { v: "post-stress", label: "หลังเครียด" },
        ]}
        defaultValue="morning"
      />
      <SubmitButton />
    </form>
  );
}

function GlucoseForm() {
  return (
    <form action={logGlucoseReading} className="space-y-4">
      <BigNumberField
        name="value"
        unit="mg/dL"
        step="1"
        min={40}
        max={500}
      />
      <ContextRadios
        legend="ตรวจตอนไหน"
        name="context"
        options={[
          { v: "fasting", label: "Fasting" },
          { v: "post-meal", label: "หลังกิน" },
          { v: "random", label: "สุ่ม" },
          { v: "bedtime", label: "ก่อนนอน" },
        ]}
        defaultValue="fasting"
      />
      <SubmitButton />
    </form>
  );
}

function ContextRadios({
  legend,
  name,
  options,
  defaultValue,
}: {
  legend: string;
  name: string;
  options: { v: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <fieldset className="bg-surface border border-border rounded-lg p-4">
      <legend className="text-[12px] text-ink-3 font-semibold px-1">{legend}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.v}
            className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-pill border border-border-strong text-[13px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
          >
            <input
              type="radio"
              name={name}
              value={o.v}
              defaultChecked={o.v === defaultValue}
              className="sr-only"
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
      style={{ boxShadow: "0 4px 12px rgba(255, 107, 107, 0.25)" }}
    >
      บันทึก
    </button>
  );
}
