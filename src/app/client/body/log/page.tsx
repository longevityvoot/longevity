import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logBodyMeasurement, logBpReading, logGlucoseReading } from "./actions";

type SearchParams = Promise<{ tab?: string }>;

const TABS = [
  { key: "weight",  label: "น้ำหนัก" },
  { key: "waist",   label: "รอบเอว" },
  { key: "bp",      label: "ความดัน" },
  { key: "glucose", label: "น้ำตาล" },
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
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client/body" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          บันทึกค่าวันนี้
        </h1>

        <nav className="mt-4 grid grid-cols-4 gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/client/body/log?tab=${t.key}`}
              className={`h-10 inline-flex items-center justify-center rounded-md text-[13px] font-semibold ${
                t.key === active.key
                  ? "bg-ink text-white"
                  : "bg-surface border border-border text-ink-2"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <section className="mt-5 bg-surface border border-border rounded-lg p-5">
          {active.key === "weight" ? <WeightForm /> : null}
          {active.key === "waist" ? <WaistForm /> : null}
          {active.key === "bp" ? <BpForm /> : null}
          {active.key === "glucose" ? <GlucoseForm /> : null}
        </section>
      </div>
    </main>
  );
}

function WeightForm() {
  return (
    <form action={logBodyMeasurement.bind(null, "weight")} className="space-y-4">
      <label className="block">
        <span className="text-[12px] text-ink-3 font-semibold">น้ำหนัก (kg)</span>
        <input
          name="value"
          type="number"
          inputMode="decimal"
          step="0.1"
          min="30"
          max="200"
          required
          className="mt-1 w-full h-14 rounded-md border border-border-strong px-3 text-[32px] font-num font-bold text-center"
          placeholder="—"
        />
      </label>
      <ContextRadios
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
      <label className="block">
        <span className="text-[12px] text-ink-3 font-semibold">รอบเอว (cm)</span>
        <input
          name="value"
          type="number"
          inputMode="decimal"
          step="0.5"
          min="50"
          max="150"
          required
          className="mt-1 w-full h-14 rounded-md border border-border-strong px-3 text-[32px] font-num font-bold text-center"
          placeholder="—"
        />
      </label>
      <SubmitButton />
    </form>
  );
}

function BpForm() {
  return (
    <form action={logBpReading} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="text-[12px] text-ink-3 font-semibold">Systolic</span>
          <input
            name="sys"
            type="number"
            inputMode="numeric"
            min="70"
            max="220"
            required
            className="mt-1 w-full h-14 rounded-md border border-border-strong px-3 text-[28px] font-num font-bold text-center"
          />
        </label>
        <label className="block">
          <span className="text-[12px] text-ink-3 font-semibold">Diastolic</span>
          <input
            name="dia"
            type="number"
            inputMode="numeric"
            min="40"
            max="140"
            required
            className="mt-1 w-full h-14 rounded-md border border-border-strong px-3 text-[28px] font-num font-bold text-center"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-[12px] text-ink-3 font-semibold">ชีพจร (optional)</span>
        <input
          name="hr"
          type="number"
          inputMode="numeric"
          min="30"
          max="220"
          className="mt-1 w-full h-12 rounded-md border border-border-strong px-3 text-[16px] font-num"
        />
      </label>
      <ContextRadios
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
      <label className="block">
        <span className="text-[12px] text-ink-3 font-semibold">ค่าน้ำตาล (mg/dL)</span>
        <input
          name="value"
          type="number"
          inputMode="numeric"
          min="40"
          max="500"
          required
          className="mt-1 w-full h-14 rounded-md border border-border-strong px-3 text-[32px] font-num font-bold text-center"
        />
      </label>
      <ContextRadios
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
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: { v: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <fieldset>
      <legend className="text-[12px] text-ink-3 font-semibold">เงื่อนไข</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o.v}
            className="inline-flex items-center gap-1.5 px-3 h-9 rounded-pill border border-border-strong text-[13px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
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
    >
      บันทึก
    </button>
  );
}
