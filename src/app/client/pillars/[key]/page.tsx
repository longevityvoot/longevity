import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS, type PillarKey } from "@/lib/pillars";
import {
  scoreFromCheckIn,
  substancesCtxFromWeekly,
  socialCtxFromWeekly,
} from "@/lib/scoring";
import { DonutScore } from "@/components/charts/DonutScore";
import { TrendChart } from "@/components/charts/TrendChart";
import { estimateBMR, estimateDailyTarget, getDailyNutritionHistory } from "@/lib/meals";
import { getLatestLBM } from "@/lib/body";
import { ageFromDOB } from "@/lib/clients";
import { mondayOf, dateKey } from "@/lib/dates";

const PILLAR_DESCRIPTIONS: Record<PillarKey, { intro: string; drivers: Array<{ label: string; hint: string }> }> = {
  nutrition: {
    intro: "อาหารและ supplement ที่กิน ส่งผลต่อพลังงาน น้ำหนัก และ lab ระยะยาว",
    drivers: [
      { label: "Meal log", hint: "kcal เทียบเป้าหมาย + คุณภาพ 4 หมวด (โปรตีน/ผัก/แป้ง/ไขมัน)" },
      { label: "Supplements / meds", hint: "active medication ที่กินอยู่" },
      { label: "Lab biomarkers", hint: "lipids · vitamins (จาก lab panel)" },
    ],
  },
  sleep: {
    intro: "การนอนคือ recovery — กระทบทุก pillar อื่น",
    drivers: [
      { label: "Subjective quality", hint: "1-10 จากประเมินวันนี้" },
      { label: "Sleep duration", hint: "ผ่าน wearable (Phase 6)" },
      { label: "HRV ตอนนอน", hint: "indicator การฟื้นตัว (Phase 6)" },
    ],
  },
  activity: {
    intro: "การออกกำลังกาย + การเคลื่อนไหวรวมในวัน สำคัญต่ออายุยืน",
    drivers: [
      { label: "Energy proxy", hint: "subjective จากประเมินวันนี้" },
      { label: "Steps + Zone 2", hint: "ผ่าน wearable (Phase 6)" },
      { label: "VO2 Max", hint: "long-term fitness marker (Phase 6)" },
    ],
  },
  stress: {
    intro: "Mental wellbeing — ความเครียดสะสม + อารมณ์ระยะยาว เป็น marker ของหลายปัญหา",
    drivers: [
      { label: "ความเครียด (1-10)", hint: "subjective จากประเมินวันนี้" },
      { label: "อารมณ์ (1-10)", hint: "blend เข้าคะแนน — อารมณ์ดี = pillar คะแนนขึ้น" },
      { label: "HRV trend", hint: "indicator การฟื้นตัว (Phase 6)" },
      { label: "Stress score", hint: "Garmin/Fitbit (Phase 6)" },
    ],
  },
  social: {
    intro: "การมีปฏิสัมพันธ์ทางสังคมที่มีความหมาย — Holt-Lunstad 2010: ความเหงาเพิ่ม mortality risk เทียบเท่าสูบบุหรี่ 15 มวน/วัน",
    drivers: [
      { label: "Peak engagement สัปดาห์", hint: "บันทึกใน 'สรุปสัปดาห์' — ไม่มี → ข้อความ → โทร → พบตัว → กลุ่ม" },
      { label: "Quality > quantity", hint: "พบตัว 1 คนคุณภาพดี > 100 likes" },
    ],
  },
  substances: {
    intro: "พฤติกรรมการบริโภคที่กระทบสุขภาพระยะยาว — บันทึกรวมในสรุปสัปดาห์",
    drivers: [
      { label: "แอลกอฮอล์ /สัปดาห์", hint: "CDC moderate ≤14 drinks/สัปดาห์ (ชาย), ≤7 (หญิง)" },
      { label: "เครื่องดื่มน้ำตาลสูง /สัปดาห์", hint: "น้ำอัดลม, ชานม, น้ำผลไม้, กาแฟใส่น้ำตาล/นม" },
      { label: "วันที่สูบ /สัปดาห์", hint: "บุหรี่ / บุหรี่ไฟฟ้า / ยาเส้น — 0-7 วัน" },
    ],
  },
};

type SearchParams = Promise<{ range?: string }>;

export default async function PillarDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string }>;
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { key } = await params;
  const { range = "30" } = await searchParams;
  const pillar = PILLARS.find((p) => p.key === key);
  if (!pillar) notFound();
  const pidx = PILLARS.findIndex((p) => p.key === key);

  const days = range === "7" ? 7 : range === "90" ? 90 : 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  const [checkIns, profile, nutritionHistory, latestLbm, weeklies] = await Promise.all([
    prisma.dailyCheckIn.findMany({
      where: { userId: session.user.id, date: { gte: since } },
      orderBy: { date: "asc" },
    }),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { heightCm: true, gender: true, dateOfBirth: true, weightKg: true },
    }),
    getDailyNutritionHistory(session.user.id, days),
    getLatestLBM(session.user.id),
    prisma.weeklyReflection.findMany({
      where: { userId: session.user.id, weekStart: { gte: mondayOf(since) } },
      orderBy: { weekStart: "asc" },
    }),
  ]);
  const weeklyByKey = new Map(weeklies.map((w) => [dateKey(w.weekStart), w]));

  let dailyTarget: number | null = null;
  if (profile) {
    const bmr = estimateBMR({
      gender: profile.gender,
      weightKg: profile.weightKg,
      heightCm: profile.heightCm,
      ageYears: ageFromDOB(profile.dateOfBirth),
      lbmKg: latestLbm,
    });
    dailyTarget = estimateDailyTarget(bmr);
  }

  type Point = { x: Date; y: number };
  const points: Point[] = checkIns
    .map((ci) => {
      const day = nutritionHistory.get(dateKey(ci.date));
      const w = weeklyByKey.get(dateKey(mondayOf(ci.date))) ?? null;
      const scores = scoreFromCheckIn(ci, {
        nutrition: {
          kcalToday: day?.kcal ?? 0,
          dailyTarget,
          qualityScore: day?.qualityScore ?? null,
        },
        social: socialCtxFromWeekly(w),
        substances: substancesCtxFromWeekly(w),
      });
      if (!scores) return null;
      return { x: ci.date, y: scores[pillar.key as PillarKey] };
    })
    .filter((p): p is Point => p !== null);

  const latest = points.length ? points[points.length - 1].y : null;
  // 7-day avg
  const last7 = points.slice(-7);
  const avg7 = last7.length
    ? Math.round(last7.reduce((s, p) => s + p.y, 0) / last7.length)
    : null;
  // 30-day avg
  const last30 = points.slice(-30);
  const avg30 = last30.length
    ? Math.round(last30.reduce((s, p) => s + p.y, 0) / last30.length)
    : null;
  // vs 30d avg
  const vsAvg = latest != null && avg30 != null ? latest - avg30 : null;
  const meta = PILLAR_DESCRIPTIONS[pillar.key as PillarKey];

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
            <p
              className="text-[10px] uppercase tracking-[0.1em] font-bold"
              style={{ color: pillar.hex }}
            >
              Pillar 0{pidx + 1} · {pillar.key}
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              {pillar.label}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-5">
        {/* Hero donut */}
        <section className="bg-surface rounded-xl p-5 border border-border flex flex-col items-center">
          <DonutScore
            value={latest}
            size={180}
            thickness={11}
            segments={18}
            gapDeg={3}
            color={pillar.hex}
            label={pillar.label}
          />
        </section>

        {/* Three-stat strip */}
        <section className="mt-3 bg-surface rounded-lg border border-border p-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat
              label="เฉลี่ย 7 วัน"
              value={avg7}
              hex={pillar.hex}
            />
            <Stat
              label="เฉลี่ย 30 วัน"
              value={avg30}
            />
            <Stat
              label="vs เฉลี่ย"
              value={vsAvg}
              tone={vsAvg == null ? undefined : vsAvg > 0 ? "good" : vsAvg < 0 ? "warn" : undefined}
              signed
            />
          </div>
        </section>

        {/* Range toggle */}
        <nav className="mt-5 inline-flex bg-canvas border border-border rounded-pill p-1 gap-0.5">
          {[
            { v: "7", label: "7 วัน" },
            { v: "30", label: "30 วัน" },
            { v: "90", label: "90 วัน" },
          ].map((r) => (
            <Link
              key={r.v}
              href={`/client/pillars/${key}?range=${r.v}`}
              className={`px-4 h-8 rounded-pill text-[12px] font-semibold inline-flex items-center ${
                range === r.v
                  ? "bg-ink text-white"
                  : "text-ink-3"
              }`}
            >
              {r.label}
            </Link>
          ))}
        </nav>

        <section className="mt-3 bg-surface rounded-lg p-4 border border-border">
          <TrendChart
            data={points}
            height={160}
            color={pillar.hex}
            target={70}
            yPadding={5}
          />
          <p className="text-[10px] text-ink-4 mt-2">
            เส้นประ = เป้าหมาย 70
          </p>
        </section>

        {/* Drivers */}
        <section className="mt-5 bg-surface rounded-lg p-5 border border-border">
          <h2 className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
            ที่ส่งผลต่อคะแนน
          </h2>
          <p className="text-[13px] text-ink-3 mt-1">{meta.intro}</p>
          <ul className="mt-4 space-y-3">
            {meta.drivers.map((d, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  className="size-1.5 mt-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: pillar.hex }}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13.5px] text-ink font-medium">{d.label}</p>
                  <p className="text-[11px] text-ink-4 mt-0.5">{d.hint}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Designer note placeholder */}
        <section className="mt-3 bg-surface rounded-lg p-5 border border-border">
          <h2 className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
            หมายเหตุจาก designer
          </h2>
          <p className="text-[13px] text-ink-3 mt-2">
            ยังไม่มี note สำหรับ pillar นี้
          </p>
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  hex,
  tone,
  signed,
}: {
  label: string;
  value: number | null;
  hex?: string;
  tone?: "good" | "warn";
  signed?: boolean;
}) {
  const cls =
    tone === "good"
      ? "text-pillar-social"
      : tone === "warn"
      ? "text-pillar-stress"
      : "text-ink";
  const text = value == null ? "—" : signed && value > 0 ? `+${value}` : `${value}`;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-ink-4 font-semibold">
        {label}
      </p>
      <p
        className={`text-[22px] font-bold font-num tabular-nums mt-1 leading-none ${cls}`}
        style={hex && !tone ? { color: hex } : undefined}
      >
        {text}
      </p>
    </div>
  );
}
