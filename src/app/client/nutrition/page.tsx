import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getMealsForDay,
  totalKcal,
  estimateBMR,
  estimateDailyTarget,
  bmrMethod,
  dailyQualityByAxis,
  MEAL_TYPES,
} from "@/lib/meals";
import { getLatestWeight, getLatestLBM } from "@/lib/body";
import { ageFromDOB } from "@/lib/clients";
import { deleteMeal } from "./actions";

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [meals, profile, latestWeight, latestLbm] = await Promise.all([
    getMealsForDay(session.user.id),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { heightCm: true, gender: true, dateOfBirth: true, weightKg: true },
    }),
    getLatestWeight(session.user.id),
    getLatestLBM(session.user.id),
  ]);

  const totalToday = totalKcal(meals);

  let dailyTarget: number | null = null;
  let bmr: number | null = null;
  let method: "katch-mcardle" | "mifflin-st-jeor" = "mifflin-st-jeor";
  if (profile) {
    const weight = latestWeight?.value ?? profile.weightKg;
    bmr = estimateBMR({
      gender: profile.gender,
      weightKg: weight,
      heightCm: profile.heightCm,
      ageYears: ageFromDOB(profile.dateOfBirth),
      lbmKg: latestLbm,
    });
    method = bmrMethod(latestLbm);
    dailyTarget = estimateDailyTarget(bmr);
  }

  const pct =
    dailyTarget != null && dailyTarget > 0
      ? Math.round((totalToday / dailyTarget) * 100)
      : null;

  const qualityAxis = dailyQualityByAxis(meals);
  const hasAnyQuality =
    qualityAxis.protein != null ||
    qualityAxis.veg != null ||
    qualityAxis.carb != null ||
    qualityAxis.fat != null;

  // Group meals by type
  const byType: Record<string, typeof meals> = {};
  for (const m of meals) (byType[m.mealType] ??= []).push(m);

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
            <p className="text-[10px] uppercase tracking-[0.1em] text-pillar-nutrition font-bold">
              Nutrition
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              อาหารวันนี้
            </p>
          </div>
          <Link
            href="/client/nutrition/add"
            className="text-[12px] text-ink-3 font-semibold"
          >
            +เพิ่ม
          </Link>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-4">
        {/* Goal hero — big number front and center */}
        {dailyTarget != null ? (
          <section className="bg-surface rounded-2xl p-6 border border-border text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-pillar-nutrition font-bold">
              เป้าหมายวันนี้
            </p>
            <div className="mt-3 flex items-baseline justify-center gap-2">
              <span className="text-[72px] font-bold font-num tabular-nums leading-none text-ink">
                {dailyTarget.toLocaleString()}
              </span>
              <span className="text-[16px] text-ink-3 font-medium">kcal</span>
            </div>
            {bmr != null ? (
              <p className="text-[11px] text-ink-4 mt-2">
                BMR <span className="font-num font-semibold text-ink-3">{bmr.toLocaleString()}</span>
                {" × "}activity 1.4
                <span className="text-ink-4">
                  {" · "}
                  {method === "katch-mcardle" ? "Katch-McArdle" : "Mifflin-St Jeor"}
                </span>
              </p>
            ) : null}

            <div className="mt-6 h-3 rounded-pill bg-canvas overflow-hidden">
              <div
                className={`h-full rounded-pill transition-all ${
                  pct! > 120
                    ? "bg-pillar-activity"
                    : pct! < 70
                    ? "bg-pillar-stress"
                    : "bg-pillar-nutrition"
                }`}
                style={{ width: `${Math.min(100, pct ?? 0)}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <Stat label="กินแล้ว" value={totalToday.toLocaleString()} unit="kcal" />
              <Stat
                label={totalToday > dailyTarget ? "เกินเป้า" : "เหลือ"}
                value={Math.abs(dailyTarget - totalToday).toLocaleString()}
                unit="kcal"
                tone={totalToday > dailyTarget ? "warn" : "ok"}
              />
              <Stat label="ความคืบหน้า" value={`${pct ?? 0}`} unit="%" />
            </div>

            <div className="mt-5 pt-4 border-t border-border text-left">
              <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
                ช่วงที่ปลอดภัย
              </p>
              <p className="mt-1 text-[12.5px] text-ink-2 font-num">
                <span className="font-semibold">{bmr?.toLocaleString()}</span>
                <span className="text-ink-4"> (BMR) </span>
                <span className="text-ink-4">≤ กิน ≤</span>
                <span className="font-semibold"> {dailyTarget.toLocaleString()}</span>
                <span className="text-ink-4"> (TDEE)</span>
              </p>
              <ul className="mt-2 space-y-1 text-[11px] text-ink-3 leading-snug">
                <li className="flex items-start gap-1.5">
                  <span className="text-pillar-stress mt-0.5">↓</span>
                  <span><span className="font-semibold text-ink-2">ต่ำกว่า BMR</span> = ระบบเผาผลาญช้าลง (starvation mode) · สูญเสียกล้ามเนื้อ</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-pillar-activity mt-0.5">↑</span>
                  <span><span className="font-semibold text-ink-2">เกิน TDEE</span> = พลังงานเหลือ → น้ำหนักขึ้น (เว้นแต่ตั้งใจสร้างกล้าม)</span>
                </li>
              </ul>
            </div>
          </section>
        ) : (
          <section className="bg-surface rounded-2xl p-6 border border-border text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-ink-4 font-bold">
              เป้าหมายวันนี้
            </p>
            <p className="mt-3 text-[24px] font-semibold text-ink">—</p>
            <p className="text-[12px] text-ink-3 mt-3">
              กรอก profile (ส่วนสูง · น้ำหนัก · วันเกิด) เพื่อให้คำนวณเป้าหมายได้
            </p>
          </section>
        )}

        {hasAnyQuality ? (
          <section className="mt-3 bg-surface rounded-xl p-4 border border-border">
            <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-bold">
              คุณภาพอาหารวันนี้
            </p>
            <dl className="mt-2 space-y-1.5">
              <QualityRow label="🥩 โปรตีน"        score={qualityAxis.protein} />
              <QualityRow label="🥬 ผัก / ใยอาหาร" score={qualityAxis.veg} />
              <QualityRow label="🍚 ข้าว / แป้ง"   score={qualityAxis.carb} />
              <QualityRow label="🥑 ไขมัน"          score={qualityAxis.fat} />
            </dl>
          </section>
        ) : null}

        {/* Add CTA */}
        <Link
          href="/client/nutrition/add"
          className="mt-3 w-full h-12 rounded-md bg-ink text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2"
        >
          + เพิ่มมื้ออาหาร
        </Link>

        {/* Meals by type */}
        {meals.length === 0 ? (
          <section className="mt-4 bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-[14px] text-ink-3">ยังไม่ได้ log มื้อวันนี้</p>
          </section>
        ) : (
          MEAL_TYPES.map((t) => {
            const items = byType[t.key] ?? [];
            if (items.length === 0) return null;
            const sub = totalKcal(items);
            return (
              <section
                key={t.key}
                className="mt-4 bg-surface border border-border rounded-lg p-4"
              >
                <div className="flex items-baseline justify-between">
                  <h2 className="text-[13px] font-semibold text-ink">{t.label}</h2>
                  <span className="text-[11px] text-ink-4 font-num">
                    {sub} kcal
                  </span>
                </div>
                <ul className="mt-3 space-y-2 divide-y divide-border">
                  {items.map((m, i) => (
                    <li
                      key={m.id}
                      className={`flex items-baseline justify-between gap-3 ${i > 0 ? "pt-2" : ""}`}
                    >
                      <span className="text-[14px] text-ink-2 flex-1 min-w-0">
                        {m.description}
                      </span>
                      <span className="text-[13px] font-num font-semibold text-ink whitespace-nowrap">
                        {m.kcal ?? "—"}{" "}
                        <span className="text-[10px] text-ink-4">kcal</span>
                      </span>
                      <form action={deleteMeal.bind(null, m.id)}>
                        <button
                          className="text-[11px] text-ink-4 hover:text-pillar-activity"
                          aria-label="ลบ"
                        >
                          ✕
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

function QualityRow({ label, score }: { label: string; score: number | null }) {
  const status =
    score == null ? "—" :
    score >= 80 ? "พอดี" :
    score >= 50 ? "ปานกลาง" :
    "ต้องปรับ";
  const tone =
    score == null ? "text-ink-4" :
    score >= 80 ? "text-pillar-social" :
    score >= 50 ? "text-pillar-stress" :
    "text-pillar-activity";
  return (
    <div className="flex items-center justify-between gap-3 text-[12.5px]">
      <dt className="text-ink-2">{label}</dt>
      <dd className={`font-semibold ${tone}`}>{status}</dd>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  tone,
}: {
  label: string;
  value: string;
  unit: string;
  tone?: "ok" | "warn";
}) {
  const valCls =
    tone === "warn" ? "text-pillar-activity" : "text-ink";
  return (
    <div>
      <p className="text-[9px] uppercase tracking-wider text-ink-4 font-semibold">
        {label}
      </p>
      <p className={`text-[18px] font-num font-bold tabular-nums mt-0.5 leading-tight ${valCls}`}>
        {value}
      </p>
      <p className="text-[9px] text-ink-4 leading-none">{unit}</p>
    </div>
  );
}
