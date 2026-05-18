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
} from "@/lib/body";
import { TrendChart } from "@/components/charts/TrendChart";
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
        weightCadence: true,
        waistCadence: true,
        bpCadence: true,
        glucoseCadence: true,
      },
    }),
    getWeightAround(session.user.id, days),
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
            <p className="text-[10px] uppercase tracking-[0.1em] text-pillar-activity font-bold">
              Vitals
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              การวัดร่างกาย
            </p>
          </div>
          <Link
            href="/client/body/log"
            className="text-[12px] text-ink-3 font-semibold"
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

        {/* Weight hero */}
        <section className="mt-4 bg-surface rounded-xl p-5 border border-border">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-bold">
            น้ำหนัก
          </p>
          {latestWeight ? (
            <div className="mt-1 flex items-baseline gap-3">
              <span className="text-[48px] font-bold font-num tabular-nums leading-none text-ink">
                {latestWeight.value}
              </span>
              <span className="text-[13px] text-ink-4 font-medium">kg</span>
              {weightDelta != null && weightDelta !== 0 ? (
                <span
                  className={`text-[12px] font-semibold px-2 py-0.5 rounded-pill ml-auto ${
                    weightDelta < 0
                      ? "bg-pillar-social-wash text-pillar-social"
                      : "bg-pillar-stress-wash text-pillar-stress"
                  }`}
                >
                  {weightDelta > 0 ? "↑" : "↓"} {Math.abs(weightDelta)} kg
                </span>
              ) : null}
            </div>
          ) : (
            <p className="text-[20px] text-ink-4 mt-2">ยังไม่มีข้อมูล</p>
          )}
          <div className="mt-4">
            <TrendChart
              data={weightHistory.map((m) => ({ x: m.measuredAt, y: m.value }))}
              height={120}
              color="#14142B"
            />
          </div>
          <nav className="mt-3 inline-flex bg-canvas border border-border rounded-pill p-1 gap-0.5">
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
                    ? "bg-ink text-white"
                    : "text-ink-3"
                }`}
              >
                {r.label}
              </Link>
            ))}
          </nav>
        </section>

        {/* Vitals card row */}
        <section className="mt-3 grid grid-cols-3 gap-2.5">
          <VitalCard
            label="รอบเอว"
            value={latestWaist ? `${latestWaist.value}` : "—"}
            unit="cm"
            href="/client/body/log?tab=waist"
            cadence={profile?.waistCadence ?? "biweekly"}
          />
          <VitalCard
            label="ความดัน"
            value={latestBp ? `${latestBp.sys}/${latestBp.dia}` : "—"}
            unit="mmHg"
            href="/client/body/log?tab=bp"
            flag={bp[0]?.flag ?? null}
            cadence={profile?.bpCadence ?? "as-needed"}
          />
          <VitalCard
            label="น้ำตาล"
            value={latestGlucose ? `${latestGlucose.value}` : "—"}
            unit="mg/dL"
            href="/client/body/log?tab=glucose"
            flag={glucose[0]?.flag ?? null}
            cadence={profile?.glucoseCadence ?? "as-needed"}
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

function VitalCard({
  label,
  value,
  unit,
  href,
  flag,
  cadence,
}: {
  label: string;
  value: string;
  unit: string;
  href: string;
  flag?: string | null;
  cadence: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-lg p-3 flex flex-col"
    >
      <p className="text-[10px] uppercase tracking-wider text-ink-4 font-bold truncate">
        {label}
      </p>
      <p className="text-[20px] font-bold font-num tabular-nums text-ink leading-none mt-1.5">
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
