import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getLatestWeight,
  getLatestWaist,
  getWeightHistory,
  getRecentVitals,
} from "@/lib/body";
import { TrendChart } from "@/components/charts/TrendChart";
import { flagTone } from "@/lib/vitals";

export default async function BodyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [latestWeight, latestWaist, weightHistory, bp, glucose, profile] =
    await Promise.all([
      getLatestWeight(session.user.id),
      getLatestWaist(session.user.id),
      getWeightHistory(session.user.id, 60),
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
    ]);

  return (
    <main className="min-h-screen bg-canvas pb-24">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ dashboard
        </Link>
        <header className="mt-3">
          <h1 className="text-[22px] font-semibold tracking-tight text-ink">
            Body & Vitals
          </h1>
          <p className="text-[12px] text-ink-3 mt-1">
            น้ำหนัก / รอบเอว / ความดัน / น้ำตาล
          </p>
        </header>

        {/* Weight hero */}
        <section className="mt-5 bg-surface border border-border rounded-xl p-5">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
                น้ำหนัก
              </p>
              {latestWeight ? (
                <p className="text-[36px] font-bold font-num tabular-nums leading-none text-ink mt-1">
                  {latestWeight.value}
                  <span className="text-[14px] text-ink-4 ml-1 font-medium">kg</span>
                </p>
              ) : (
                <p className="text-[24px] text-ink-4 mt-2">ยังไม่มีข้อมูล</p>
              )}
              {latestWeight && profile?.heightCm ? (
                <p className="text-[12px] text-ink-3 mt-1">
                  BMI{" "}
                  {(
                    latestWeight.value / Math.pow(profile.heightCm / 100, 2)
                  ).toFixed(1)}
                </p>
              ) : null}
            </div>
            <CadenceChip text={profile?.weightCadence ?? "weekly"} />
          </div>
          <div className="mt-3">
            <TrendChart
              data={weightHistory.map((m) => ({ x: m.measuredAt, y: m.value }))}
              width={360}
              height={120}
              color="#14142B"
            />
          </div>
          <p className="text-[11px] text-ink-4 mt-2">60 วันล่าสุด</p>
        </section>

        {/* 3 metric cards */}
        <section className="mt-3 grid grid-cols-1 gap-3">
          <MetricCard
            label="รอบเอว"
            value={latestWaist ? `${latestWaist.value} cm` : "—"}
            cadence={profile?.waistCadence ?? "biweekly"}
            href="/client/body/log?tab=waist"
          />
          <MetricCard
            label="ความดัน"
            value={
              bp[0] && typeof bp[0].values === "object" && bp[0].values
                ? `${(bp[0].values as { sys: number }).sys}/${(bp[0].values as { dia: number }).dia}`
                : "—"
            }
            cadence={profile?.bpCadence ?? "as-needed"}
            flag={bp[0]?.flag ?? null}
            href="/client/body/log?tab=bp"
          />
          <MetricCard
            label="น้ำตาลในเลือด"
            value={
              glucose[0] && typeof glucose[0].values === "object" && glucose[0].values
                ? `${(glucose[0].values as { value: number }).value} mg/dL`
                : "—"
            }
            cadence={profile?.glucoseCadence ?? "as-needed"}
            flag={glucose[0]?.flag ?? null}
            href="/client/body/log?tab=glucose"
          />
        </section>

        {bp.length > 0 ? (
          <section className="mt-5 bg-surface border border-border rounded-lg p-4">
            <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
              ความดันล่าสุด
            </p>
            <ul className="mt-2 divide-y divide-border">
              {bp.map((r) => {
                const v = r.values as { sys: number; dia: number; hr?: number };
                return (
                  <li key={r.id} className="py-2 flex items-center gap-2 text-[13px]">
                    <span className="font-num tabular-nums font-semibold text-ink w-20">
                      {v.sys}/{v.dia}
                    </span>
                    {r.flag ? <FlagPill flag={r.flag} /> : null}
                    <span className="ml-auto text-[11px] text-ink-4">
                      {r.measuredAt.toLocaleString("th-TH", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

        <Link
          href="/client/body/log"
          className="fixed left-0 right-0 bottom-0 bg-pillar-activity text-white font-semibold text-[15px] flex items-center justify-center h-14 z-10"
        >
          + บันทึกค่าวันนี้
        </Link>
      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  cadence,
  flag,
  href,
}: {
  label: string;
  value: string;
  cadence: string;
  flag?: string | null;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-lg p-4 flex items-center justify-between"
    >
      <div>
        <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
          {label}
        </p>
        <p className="text-[20px] font-bold font-num tabular-nums text-ink mt-1">
          {value}
        </p>
        {flag ? <FlagPill flag={flag} /> : null}
      </div>
      <CadenceChip text={cadence} />
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
    "scheduled-daily": "ทุกวัน (นัด)",
  };
  return (
    <span className="text-[11px] text-ink-3 bg-canvas border border-border rounded-pill px-2 py-0.5">
      {map[text] ?? text}
    </span>
  );
}

function FlagPill({ flag }: { flag: string }) {
  const tone = flagTone(flag as never);
  const cls =
    tone === "danger"
      ? "bg-pillar-activity-wash text-pillar-activity"
      : tone === "warning"
      ? "bg-pillar-stress-wash text-pillar-stress"
      : "bg-pillar-social-wash text-pillar-social";
  return (
    <span className={`mt-1 inline-flex text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${cls}`}>
      {flag}
    </span>
  );
}
