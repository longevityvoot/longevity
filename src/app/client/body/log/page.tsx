import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { logBodyMeasurement, logBpReading, logGlucoseReading } from "./actions";
import { BigNumberInput } from "./BigNumberInput";
import { MuscleMassInput } from "./MuscleMassInput";
import { getLatestWeight, getLatestWaist, getWeightAround, getWeightHistory } from "@/lib/body";

type SearchParams = Promise<{ tab?: string }>;

const TABS = [
  { key: "weight",  label: "น้ำหนัก", question: "วันนี้น้ำหนักเท่าไหร่?" },
  { key: "waist",   label: "รอบเอว",  question: "วัดรอบเอวล่าสุดได้เท่าไหร่?" },
  { key: "bp",      label: "ความดัน", question: "ความดันโลหิตวันนี้?" },
  { key: "glucose", label: "น้ำตาล", question: "ค่าน้ำตาลที่วัดได้?" },
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

  // Presets / insight bits — only meaningful when we have prior data
  let weightPresets: number[] | undefined;
  let weightInsight: string | null = null;
  let waistPresets: number[] | undefined;

  if (active.key === "weight") {
    const [latest, oldish, history] = await Promise.all([
      getLatestWeight(session.user.id),
      getWeightAround(session.user.id, 60),
      getWeightHistory(session.user.id, 60),
    ]);
    if (latest) {
      // 5 nudges centered on latest (±0.4 kg in 0.2 steps)
      weightPresets = [
        +(latest.value - 0.4).toFixed(1),
        +(latest.value - 0.2).toFixed(1),
        latest.value,
        +(latest.value + 0.2).toFixed(1),
        +(latest.value + 0.4).toFixed(1),
      ];
    }
    if (latest && oldish && history.length >= 4) {
      const d = +(latest.value - oldish.value).toFixed(1);
      if (Math.abs(d) >= 1) {
        const days = Math.max(
          1,
          Math.round(
            (latest.measuredAt.getTime() - oldish.measuredAt.getTime()) / 86400000,
          ),
        );
        const perWeek = ((Math.abs(d) / days) * 7).toFixed(2);
        const verdict = Math.abs(d) / days <= 0.15 ? "ดี" : "เร็วเกินไป";
        weightInsight = `${d < 0 ? "ลด" : "เพิ่ม"} ${Math.abs(d)} kg ใน ${days} วัน — เฉลี่ย ${perWeek} kg/สัปดาห์ (${verdict})`;
      }
    }
  } else if (active.key === "waist") {
    const latest = await getLatestWaist(session.user.id);
    if (latest) {
      waistPresets = [
        +(latest.value - 1).toFixed(1),
        +(latest.value - 0.5).toFixed(1),
        latest.value,
        +(latest.value + 0.5).toFixed(1),
        +(latest.value + 1).toFixed(1),
      ];
    }
  }

  return (
    <main className="min-h-screen bg-canvas pb-16">
      <header className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client/body"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="ปิด"
          >
            ✕
          </Link>
          <p className="text-[15px] font-semibold text-ink leading-tight flex-1">
            บันทึกการวัด
          </p>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-4">
        <nav className="grid grid-cols-4 gap-2">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/client/body/log?tab=${t.key}`}
              className={`h-10 inline-flex items-center justify-center rounded-md text-[12.5px] font-semibold ${
                t.key === active.key
                  ? "bg-ink text-white"
                  : "bg-surface border border-border text-ink-2"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <p className="mt-5 text-[20px] font-semibold text-ink text-center">
          {active.question}
        </p>

        <div className="mt-4">
          {active.key === "weight" ? (
            <WeightForm presets={weightPresets} insight={weightInsight} />
          ) : null}
          {active.key === "waist" ? <WaistForm presets={waistPresets} /> : null}
          {active.key === "bp" ? <BpForm /> : null}
          {active.key === "glucose" ? <GlucoseForm /> : null}
        </div>
      </div>
    </main>
  );
}

function WeightForm({
  presets,
  insight,
}: {
  presets?: number[];
  insight: string | null;
}) {
  return (
    <form action={logBodyMeasurement.bind(null, "weight")} className="space-y-4">
      <section className="bg-surface border border-border rounded-xl p-5">
        <BigNumberInput
          name="value"
          unit="kg"
          step={0.1}
          min={30}
          max={200}
          presets={presets}
        />
      </section>
      {insight ? <InsightCard text={insight} /> : null}
      <section className="bg-surface border border-border rounded-lg p-4">
        <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
          จากเครื่องชั่ง <span className="text-ink-4 normal-case font-normal italic">(optional)</span>
        </p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11px] text-ink-3">% ไขมัน</span>
            <div className="relative mt-1">
              <input
                name="bodyFatPct"
                type="number"
                inputMode="decimal"
                step={0.1}
                min={3}
                max={70}
                placeholder=""
                className="w-full h-11 rounded-md border border-border-strong pl-3 pr-9 text-[16px] font-num focus:outline-none focus:border-ink"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">%</span>
            </div>
          </label>
          <MuscleMassInput />
        </div>
        <p className="text-[10px] text-ink-4 mt-2">
          ถ้าเครื่องชั่งวัด body composition ให้ใส่เพิ่ม — ระบบจะใช้ % ไขมันคำนวณ BMR ที่แม่นขึ้น (Katch-McArdle)
        </p>
      </section>
      <ContextRadios
        legend="ช่วงเวลา"
        name="context"
        options={[
          { v: "morning", label: "เช้า" },
          { v: "evening", label: "เย็น" },
        ]}
        defaultValue="morning"
      />
      <NoteField />
      <SubmitButton />
    </form>
  );
}

function WaistForm({ presets }: { presets?: number[] }) {
  return (
    <form action={logBodyMeasurement.bind(null, "waist")} className="space-y-4">
      <section className="bg-surface border border-border rounded-xl p-5">
        <BigNumberInput
          name="value"
          unit="cm"
          step={0.5}
          min={50}
          max={150}
          presets={presets}
        />
      </section>
      <NoteField />
      <SubmitButton />
    </form>
  );
}

function BpForm() {
  return (
    <form action={logBpReading} className="space-y-4">
      <section className="bg-surface border border-border rounded-xl p-5">
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
            className="w-24 h-20 rounded-md bg-transparent text-[56px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
          />
          <span className="text-[40px] font-bold text-ink-4 mb-3 leading-none">/</span>
          <input
            name="dia"
            type="number"
            inputMode="numeric"
            min="40"
            max="140"
            required
            placeholder="0"
            className="w-24 h-20 rounded-md bg-transparent text-[56px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
          />
        </div>
        <p className="text-[13px] text-ink-3 font-medium text-center">mmHg</p>
        <p className="text-[10px] text-ink-4 mt-1 text-center">systolic / diastolic</p>
      </section>
      <label className="bg-surface border border-border rounded-lg p-4 block">
        <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
          ชีพจร <span className="text-ink-4 normal-case font-normal italic">(optional)</span>
        </span>
        <div className="mt-1.5 relative">
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
      <NoteField />
      <SubmitButton />
    </form>
  );
}

function GlucoseForm() {
  return (
    <form action={logGlucoseReading} className="space-y-4">
      <section className="bg-surface border border-border rounded-xl p-5">
        <BigNumberInput name="value" unit="mg/dL" step={1} min={40} max={500} />
      </section>
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
      <NoteField />
      <SubmitButton />
    </form>
  );
}

function InsightCard({ text }: { text: string }) {
  return (
    <section className="bg-pillar-social-wash border border-pillar-social/40 rounded-lg p-4 flex items-start gap-2.5">
      <span className="size-2 mt-1.5 rounded-full bg-pillar-social flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-pillar-social font-bold">
          Insight
        </p>
        <p className="text-[13px] text-ink-2 mt-1">{text}</p>
      </div>
    </section>
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
      <legend className="text-[11px] uppercase tracking-wider text-ink-4 font-bold px-1">
        {legend}
      </legend>
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

function NoteField() {
  return (
    <label className="bg-surface border border-border rounded-lg p-4 block">
      <span className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
        บันทึก <span className="text-ink-4 normal-case font-normal italic">(optional)</span>
      </span>
      <textarea
        name="notes"
        rows={2}
        placeholder="เช่น วัดหลังตื่นนอน ดื่มน้ำแล้ว"
        className="mt-1.5 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
      />
    </label>
  );
}

function SubmitButton() {
  return (
    <button
      type="submit"
      className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[15px]"
      style={{ boxShadow: "0 4px 12px rgba(20, 20, 43, 0.18)" }}
    >
      บันทึก
    </button>
  );
}
