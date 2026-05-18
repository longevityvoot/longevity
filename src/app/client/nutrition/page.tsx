import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  getMealsForDay,
  totalKcal,
  estimateBMR,
  estimateDailyTarget,
  MEAL_TYPES,
} from "@/lib/meals";
import { getLatestWeight } from "@/lib/body";
import { ageFromDOB } from "@/lib/clients";
import { deleteMeal } from "./actions";

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [meals, profile, latestWeight] = await Promise.all([
    getMealsForDay(session.user.id),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { heightCm: true, gender: true, dateOfBirth: true, weightKg: true },
    }),
    getLatestWeight(session.user.id),
  ]);

  const totalToday = totalKcal(meals);

  let dailyTarget: number | null = null;
  let bmr: number | null = null;
  if (profile) {
    const weight = latestWeight?.value ?? profile.weightKg;
    bmr = estimateBMR({
      gender: profile.gender,
      weightKg: weight,
      heightCm: profile.heightCm,
      ageYears: ageFromDOB(profile.dateOfBirth),
    });
    dailyTarget = estimateDailyTarget(bmr);
  }

  const pct =
    dailyTarget != null && dailyTarget > 0
      ? Math.round((totalToday / dailyTarget) * 100)
      : null;

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
        {/* Daily total hero */}
        <section className="bg-surface rounded-xl p-5 border border-border">
          <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-bold">
            พลังงานวันนี้
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[48px] font-bold font-num tabular-nums leading-none text-ink">
              {totalToday}
            </span>
            <span className="text-[13px] text-ink-4 font-medium">kcal</span>
          </div>
          {dailyTarget != null ? (
            <>
              <div className="mt-3 h-2 rounded-pill bg-canvas overflow-hidden">
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
              <p className="text-[11px] text-ink-3 mt-1.5">
                เป้าหมาย{" "}
                <span className="font-num font-semibold text-ink-2">
                  {dailyTarget}
                </span>{" "}
                kcal/วัน
                {pct != null ? (
                  <span className="text-ink-4"> · {pct}% ของเป้า</span>
                ) : null}
              </p>
              {bmr != null ? (
                <p className="text-[10px] text-ink-4 mt-0.5">
                  BMR {bmr} · activity factor 1.4
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-[12px] text-ink-3 mt-2">
              กรอก profile (ส่วนสูง · น้ำหนัก · วันเกิด) เพื่อให้คำนวณเป้าหมายได้
            </p>
          )}
        </section>

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
