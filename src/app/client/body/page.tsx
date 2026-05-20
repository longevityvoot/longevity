import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getLatestWeight,
  getLatestWaist,
  getWeightHistory,
  getWeightAround,
  getRecentVitals,
  getLatestBodyFatPct,
  getLatestMuscleMass,
  idealWeightRange,
  healthyBodyFatRange,
  healthyMuscleMassRange,
  healthyMuscleMassKgRange,
  rangeFlag,
} from "@/lib/body";
import { TrendChart } from "@/components/charts/TrendChart";
import { RangeBar } from "@/components/charts/RangeBar";
import { flagTone } from "@/lib/vitals";

type SearchParams = Promise<{ range?: string }>;

export default async function BodyPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { range = "30" } = await searchParams;
  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  const [
    latestWeight,
    latestWaist,
    weightHistory,
    bp,
    glucose,
    profile,
    weightAtRange,
    latestBodyFat,
    latestMuscle,
  ] = await Promise.all([
    getLatestWeight(session.user.id),
    getLatestWaist(session.user.id),
    getWeightHistory(session.user.id, days),
    getRecentVitals(session.user.id, "bp", 5),
    getRecentVitals(session.user.id, "glucose", 5),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        heightCm: true,
        gender: true,
        weightCadence: true,
        waistCadence: true,
        bpCadence: true,
        glucoseCadence: true,
      },
    }),
    getWeightAround(session.user.id, days),
    getLatestBodyFatPct(session.user.id),
    getLatestMuscleMass(session.user.id),
  ]);

  const weightDelta =
    latestWeight && weightAtRange
      ? +(latestWeight.value - weightAtRange.value).toFixed(1)
      : null;

  const bmi =
    latestWeight && profile?.heightCm
      ? +(latestWeight.value / Math.pow(profile.heightCm / 100, 2)).toFixed(1)
      : null;

  const latestBp = bp[0]
    ? (bp[0].values as { sys: number; dia: number })
    : null;
  const latestGlucose = glucose[0]
    ? (glucose[0].values as { value: number })
    : null;

  // Healthy reference ranges for the 3 row bars.
  const weightRange = idealWeightRange(profile?.heightCm ?? null);
  const fatRange = healthyBodyFatRange(profile?.gender ?? null);
  const muscleRange = healthyMuscleMassRange(profile?.gender ?? null);

  // Muscle row: show value in the same unit the user logged in. The
  // healthy range (stored as %) gets converted to kg when the user logged
  // their muscle mass in kg, so the range bar reads in matching units.
  const muscleDisplay = (() => {
    if (!latestMuscle) {
      return null;
    }
    const unit = latestMuscle.unit === "%" ? "%" : "kg";
    const value = latestMuscle.value;
    const weight = latestWeight?.value ?? null;
    if (unit === "%") {
      return {
        unit: "%" as const,
        value,
        valueDisplay: `${value.toFixed(1)}%`,
        rangeLow: muscleRange.low,
        rangeHigh: muscleRange.high,
        pctEquivalent: value,
      };
    }
    // unit = kg: prefer SMMI-based range (uses height², the clinical standard)
    // so we match InBody's "predicted-for-frame" classification rather than
    // a flat %-of-weight band. Falls back to %-derived kg range if no height.
    const kgRange = healthyMuscleMassKgRange(profile?.heightCm ?? null, profile?.gender ?? null);
    const rangeLowKg =
      kgRange?.low ?? (weight != null ? +((muscleRange.low / 100) * weight).toFixed(1) : null);
    const rangeHighKg =
      kgRange?.high ?? (weight != null ? +((muscleRange.high / 100) * weight).toFixed(1) : null);
    const pctEquivalent = weight != null ? +((value / weight) * 100).toFixed(1) : null;
    return {
      unit: "kg" as const,
      value,
      valueDisplay: `${value.toFixed(1)} kg`,
      rangeLow: rangeLowKg,
      rangeHigh: rangeHighKg,
      pctEquivalent,
    };
  })();

  return (
    <main className="min-h-screen bg-canvas pb-6">
      <header className="sticky top-0 z-20 bg-canvas/95 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="กลับ"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.1em] text-pillar-sleep font-bold">
              Vitals
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              การวัดร่างกาย
            </p>
          </div>
          <Link
            href="/client/body/log"
            className="text-[12px] text-pillar-sleep font-bold"
          >
            +บันทึก
          </Link>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-4">
        {/* Profile context strip */}
        <section className="text-[11px] text-ink-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 px-1">
          {profile?.heightCm ? (
            <span>
              ส่วนสูง <span className="text-ink-2 font-num font-semibold">{profile.heightCm}</span> cm
            </span>
          ) : null}
          {bmi != null ? (
            <span>
              BMI <span className="text-ink-2 font-num font-semibold">{bmi}</span>
            </span>
          ) : null}
          {latestWaist ? (
            <span>
              รอบเอว <span className="text-ink-2 font-num font-semibold">{latestWaist.value}</span> cm
            </span>
          ) : null}
        </section>

        {/* Hero — 3 range bars: weight · body fat · muscle mass */}
        <section className="mt-4 bg-pillar-sleep-wash rounded-2xl p-5 border border-pillar-sleep/30">
          <div className="flex items-baseline justify-between">
            <p className="text-[10px] uppercase tracking-[0.08em] text-pillar-sleep font-bold">
              องค์ประกอบร่างกาย
            </p>
            {weightDelta != null && weightDelta !== 0 ? (
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${
                  weightDelta < 0
                    ? "bg-pillar-social-wash text-pillar-social"
                    : "bg-white/70 text-pillar-stress"
                }`}
              >
                {weightDelta > 0 ? "↑" : "↓"} {Math.abs(weightDelta)} kg
              </span>
            ) : null}
          </div>

          <div className="mt-3 space-y-3.5">
            <MetricRow
              label="น้ำหนัก"
              value={latestWeight ? `${latestWeight.value} kg` : "—"}
              barValue={latestWeight?.value ?? null}
              low={weightRange?.low ?? null}
              high={weightRange?.high ?? null}
              note={
                latestWeight && weightRange
                  ? weightAdvice(latestWeight.value, weightRange)
                  : null
              }
            />
            <MetricRow
              label="% ไขมัน"
              value={latestBodyFat ? `${latestBodyFat.value.toFixed(1)}%` : "—"}
              barValue={latestBodyFat?.value ?? null}
              low={fatRange.low}
              high={fatRange.high}
              note={
                latestBodyFat
                  ? fatAdvice(latestBodyFat.value, fatRange)
                  : "บันทึก % ไขมันจากเครื่องชั่งสมาร์ท"
              }
            />
            <MetricRow
              label={muscleDisplay?.unit === "kg" ? "กล้ามเนื้อ" : "กล้ามเนื้อ %"}
              value={muscleDisplay?.valueDisplay ?? "—"}
              barValue={muscleDisplay?.value ?? null}
              low={muscleDisplay?.rangeLow ?? null}
              high={muscleDisplay?.rangeHigh ?? null}
              highIsGood
              note={
                muscleDisplay
                  ? muscleAdvice(
                      muscleDisplay.value,
                      { low: muscleDisplay.rangeLow ?? muscleRange.low, high: muscleDisplay.rangeHigh ?? muscleRange.high },
                      muscleDisplay.unit,
                      muscleDisplay.pctEquivalent,
                    )
                  : "บันทึกมวลกล้ามจากเครื่องชั่ง"
              }
            />
          </div>

          <p className="mt-3 text-[9.5px] text-ink-4 leading-snug">
            อ้างอิง: BMI 18.5–22.9 (WHO Asia-Pacific) · % ไขมัน (Omron HBF) · กล้ามเนื้อ kg (SMMI/AWGS 2019) · กล้ามเนื้อ % (InBody adult Asian)
          </p>

          <div className="mt-5 pt-4 border-t border-pillar-sleep/20">
            <p className="text-[10px] uppercase tracking-wider text-pillar-sleep font-bold mb-2">
              แนวโน้มน้ำหนัก
            </p>
            <TrendChart
              data={weightHistory.map((m) => ({ x: m.measuredAt, y: m.value }))}
              height={90}
              color="#4A6FA5"
            />
          </div>
          <nav className="mt-3 inline-flex bg-white/60 border border-pillar-sleep/20 rounded-pill p-1 gap-0.5">
            {[
              { v: "7", label: "7 วัน" },
              { v: "30", label: "30 วัน" },
              { v: "90", label: "90 วัน" },
            ].map((r) => (
              <Link
                key={r.v}
                href={`/client/body?range=${r.v}`}
                className={`px-3.5 h-7 rounded-pill text-[11px] font-semibold inline-flex items-center ${
                  range === r.v
                    ? "bg-pillar-sleep text-white"
                    : "text-pillar-sleep/80"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Primary CTA — prominent record button */}
        <Link
          href="/client/body/log"
          className="mt-3 w-full h-12 rounded-md bg-pillar-sleep text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2"
          style={{ boxShadow: "0 4px 12px rgba(74, 111, 165, 0.30)" }}
        >
          + บันทึกการวัดวันนี้
        </Link>

        {/* Vitals card row */}
        <section className="mt-3 grid grid-cols-3 gap-2.5">
          <VitalCard
            label="รอบเอว"
            value={latestWaist ? `${latestWaist.value}` : "—"}
            unit="cm"
            href="/client/body/log?tab=waist"
            cadence={profile?.waistCadence ?? "biweekly"}
            tone="stress"
          />
          <VitalCard
            label="ความดัน"
            value={latestBp ? `${latestBp.sys}/${latestBp.dia}` : "—"}
            unit="mmHg"
            href="/client/body/log?tab=bp"
            flag={bp[0]?.flag ?? null}
            cadence={profile?.bpCadence ?? "as-needed"}
            tone="activity"
          />
          <VitalCard
            label="น้ำตาล"
            value={latestGlucose ? `${latestGlucose.value}` : "—"}
            unit="mg/dL"
            href="/client/body/log?tab=glucose"
            flag={glucose[0]?.flag ?? null}
            cadence={profile?.glucoseCadence ?? "as-needed"}
            tone="nutrition"
          />
        </section>

        {bp.length > 0 ? (
          <section className="mt-5 bg-surface border border-border rounded-lg p-4">
            <h2 className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
              ความดันล่าสุด
            </h2>
            <ul className="mt-2.5 divide-y divide-border">
              {bp.map((r) => {
                const v = r.values as { sys: number; dia: number; hr?: number };
                return (
                  <li key={r.id} className="py-2.5 flex items-center gap-3 text-[13px]">
                    <span className="font-num tabular-nums font-bold text-ink w-16">
                      {v.sys}/{v.dia}
                    </span>
                    {v.hr ? (
                      <span className="text-[11px] text-ink-4 font-num">
                        {v.hr} bpm
                      </span>
                    ) : null}
                    {r.flag ? <FlagPill flag={r.flag} /> : null}
                    <div className="ml-auto text-right">
                      <p className="text-[11px] text-ink-3 leading-tight">
                        {r.measuredAt.toLocaleString("th-TH", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {r.context ? (
                        <p className="text-[10px] text-ink-4 leading-tight">
                          {r.context}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <Link
          href="/client/labs"
          className="mt-3 bg-surface border border-border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
              ผลแล็บ
            </p>
            <p className="text-[13px] text-ink-2 mt-1">ดูผลตรวจเลือดของคุณ</p>
          </div>
          <span className="text-ink-3 text-[14px]">→</span>
        </Link>
      </div>
    </main>
  );
}

function MetricRow({
  label,
  value,
  barValue,
  low,
  high,
  note,
  highIsGood = false,
}: {
  label: string;
  value: string;
  barValue: number | null;
  low: number | null;
  high: number | null;
  note: string | null;
  highIsGood?: boolean;
}) {
  const flag =
    barValue == null || low == null || high == null
      ? "normal"
      : rangeFlag(barValue, low, high);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[12px] font-semibold text-ink-2">{label}</p>
        <p className="text-[16px] font-num font-bold tabular-nums text-ink">{value}</p>
      </div>
      {barValue != null && low != null && high != null ? (
        <div className="mt-1.5">
          <RangeBar value={barValue} low={low} high={high} flag={flag} highIsGood={highIsGood} width={320} height={20} />
          <div className="flex items-baseline justify-between mt-0.5 text-[10px] font-num text-ink-4">
            <span>{low}</span>
            <span>{high}</span>
          </div>
        </div>
      ) : (
        <div className="mt-1.5 h-5 rounded-pill bg-white/60" />
      )}
      {note ? (
        <p className="mt-0.5 text-[10.5px] text-ink-3 leading-snug">{note}</p>
      ) : null}
    </div>
  );
}

function weightAdvice(value: number, range: { low: number; high: number }): string {
  if (value < range.low) {
    return `ต่ำกว่าเกณฑ์ — ควรเพิ่มอีก ${(range.low - value).toFixed(1)} kg`;
  }
  if (value > range.high) {
    return `เกินเกณฑ์ — ควรลดอีก ${(value - range.high).toFixed(1)} kg`;
  }
  return `อยู่ในเกณฑ์ปกติ (${range.low}–${range.high} kg)`;
}

function fatAdvice(value: number, range: { low: number; high: number }): string {
  if (value < range.low) return `ไขมันต่ำกว่าเกณฑ์ (ต่ำกว่า ${range.low}%)`;
  if (value > range.high) {
    return `เกินเกณฑ์ — ควรลดอีก ${(value - range.high).toFixed(1)}%`;
  }
  return `อยู่ในเกณฑ์ปกติ (${range.low}–${range.high}%)`;
}

function muscleAdvice(
  value: number,
  range: { low: number; high: number },
  unit: "kg" | "%",
  pctEquivalent: number | null,
): string {
  const u = unit === "kg" ? "kg" : "%";
  const equivPct = pctEquivalent != null && unit === "kg" ? ` (≈ ${pctEquivalent.toFixed(1)}%)` : "";
  if (value < range.low) {
    return `ควรเพิ่มอีก ${(range.low - value).toFixed(1)}${u} — เพิ่มโปรตีน + เวท`;
  }
  if (value > range.high) return `ระดับ athletic — กล้ามมาก${equivPct}`;
  return `อยู่ในเกณฑ์ปกติ (${range.low}–${range.high}${u})${equivPct}`;
}

type VitalTone = "activity" | "nutrition" | "stress" | "sleep" | "social" | "substances";

const TONE_CLASSES: Record<VitalTone, { bg: string; label: string; value: string }> = {
  activity:   { bg: "bg-pillar-activity-wash border-pillar-activity/30", label: "text-pillar-activity", value: "text-pillar-activity" },
  nutrition:  { bg: "bg-pillar-nutrition-wash border-pillar-nutrition/30",   label: "text-pillar-nutrition",  value: "text-pillar-nutrition" },
  stress:     { bg: "bg-pillar-stress-wash border-pillar-stress/30",         label: "text-pillar-stress",     value: "text-pillar-stress" },
  sleep:      { bg: "bg-pillar-sleep-wash border-pillar-sleep/30",           label: "text-pillar-sleep",      value: "text-pillar-sleep" },
  social:     { bg: "bg-pillar-social-wash border-pillar-social/30",         label: "text-pillar-social",     value: "text-pillar-social" },
  substances: { bg: "bg-pillar-substances-wash border-pillar-substances/30", label: "text-pillar-substances", value: "text-pillar-substances" },
};

function VitalCard({
  label,
  value,
  unit,
  href,
  flag,
  cadence,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  href: string;
  flag?: string | null;
  cadence: string;
  tone: VitalTone;
}) {
  const cls = TONE_CLASSES[tone];
  return (
    <Link
      href={href}
      className={`${cls.bg} border rounded-lg p-3 flex flex-col`}
    >
      <p className={`text-[10px] uppercase tracking-wider font-bold truncate ${cls.label}`}>
        {label}
      </p>
      <p className={`text-[20px] font-bold font-num tabular-nums leading-none mt-1.5 ${cls.value}`}>
        {value}
      </p>
      <p className="text-[10px] text-ink-4 mt-0.5">{unit}</p>
      <div className="mt-2 flex items-center justify-between gap-1">
        <CadenceChip text={cadence} />
        {flag ? <FlagPill flag={flag} small /> : null}
      </div>
    </Link>
  );
}

function CadenceChip({ text }: { text: string }) {
  const map: Record<string, string> = {
    daily: "รายวัน",
    weekly: "รายสัปดาห์",
    biweekly: "ทุก 2 สัปดาห์",
    monthly: "รายเดือน",
    "as-needed": "เมื่อต้องการ",
    "scheduled-daily": "ทุกวัน",
  };
  return (
    <span className="text-[9px] text-ink-4 truncate">
      {map[text] ?? text}
    </span>
  );
}

function FlagPill({ flag, small }: { flag: string; small?: boolean }) {
  const tone = flagTone(flag as never);
  const cls =
    tone === "danger"
      ? "bg-pillar-activity-wash text-pillar-activity"
      : tone === "warning"
      ? "bg-pillar-stress-wash text-pillar-stress"
      : "bg-pillar-social-wash text-pillar-social";
  return (
    <span
      className={`inline-flex font-semibold rounded-pill ${cls} ${
        small ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-1.5 py-0.5"
      }`}
    >
      {flag}
    </span>
  );
}
