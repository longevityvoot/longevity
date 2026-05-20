import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS } from "@/lib/pillars";
import {
  scoreFromCheckIn,
  overallScore,
  substancesCtxFromWeekly,
  socialCtxFromWeekly,
  scoreColor,
  scoreBandClasses,
} from "@/lib/scoring";
import { todayLocalDate, mondayOf } from "@/lib/dates";
import { MultiDonut } from "@/components/charts/MultiDonut";
import { DonutScore } from "@/components/charts/DonutScore";
import { getUpcomingSessionForClient } from "@/lib/sessions";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { greetingFor, bangkokHour } from "@/lib/greeting";
import {
  estimateBMR,
  estimateDailyTarget,
  getMealsForDay,
  totalKcal,
  dailyMealQuality,
} from "@/lib/meals";
import { getLatestLBM } from "@/lib/body";
import { ageFromDOB } from "@/lib/clients";

export default async function ClientHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = mondayOf(today);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);

  const [
    todayCheckIn,
    yesterdayCheckIn,
    recent14,
    upcoming,
    recentMessages,
    todayMeals,
    yesterdayMeals,
    profile,
    latestLbm,
    thisWeekly,
    lastWeekly,
  ] = await Promise.all([
    prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    }),
    prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId: session.user.id, date: yesterday } },
    }),
    prisma.dailyCheckIn.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 14,
      select: { date: true },
    }),
    getUpcomingSessionForClient(session.user.id),
    listMessages(threadIdForClient(session.user.id), 3),
    getMealsForDay(session.user.id, today),
    getMealsForDay(session.user.id, yesterday),
    prisma.clientProfile.findUnique({
      where: { userId: session.user.id },
      select: { heightCm: true, gender: true, dateOfBirth: true, weightKg: true },
    }),
    getLatestLBM(session.user.id),
    prisma.weeklyReflection.findUnique({
      where: { userId_weekStart: { userId: session.user.id, weekStart: thisWeekStart } },
    }),
    prisma.weeklyReflection.findUnique({
      where: { userId_weekStart: { userId: session.user.id, weekStart: lastWeekStart } },
    }),
  ]);

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

  const nutritionToday = {
    kcalToday: totalKcal(todayMeals),
    dailyTarget,
    qualityScore: dailyMealQuality(todayMeals),
  };
  const nutritionYesterday = {
    kcalToday: totalKcal(yesterdayMeals),
    dailyTarget,
    qualityScore: dailyMealQuality(yesterdayMeals),
  };
  const scores = scoreFromCheckIn(todayCheckIn, {
    nutrition: nutritionToday,
    social: socialCtxFromWeekly(thisWeekly),
    substances: substancesCtxFromWeekly(thisWeekly),
  });
  // Yesterday's "previous" comparison uses last week's reflection if today
  // crosses a Monday boundary, otherwise still this week's. Simpler:
  // always use this-week's data for yesterday too — weekly fields don't
  // jitter day-by-day anyway.
  const prevWeekly = today.getTime() === thisWeekStart.getTime() ? lastWeekly : thisWeekly;
  const prevScores = scoreFromCheckIn(yesterdayCheckIn, {
    nutrition: nutritionYesterday,
    social: socialCtxFromWeekly(prevWeekly),
    substances: substancesCtxFromWeekly(prevWeekly),
  });
  const overall = overallScore(scores);
  const prevOverall = overallScore(prevScores);
  const overallDelta = overall != null && prevOverall != null ? overall - prevOverall : null;
  const flaggedCount = scores
    ? Object.values(scores).filter((v) => v < 50).length
    : 0;

  const lastMessage = recentMessages[recentMessages.length - 1] ?? null;
  const streak = computeStreak(recent14.map((r) => r.date), today);
  const greeting = greetingFor(bangkokHour());

  const rings = PILLARS.map((p) => ({
    key: p.key,
    color: p.hex,
    value: scores?.[p.key] ?? null,
  }));

  const todayLabel = today.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[420px] mx-auto px-5 pt-7">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[13px] text-ink-3">{greeting}</p>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink leading-tight mt-0.5">
              {session.user.name}
            </h1>
          </div>
          <button
            type="button"
            className="size-10 rounded-full bg-surface border border-border inline-flex items-center justify-center text-ink-3"
            aria-label="แจ้งเตือน"
          >
            <BellIcon />
          </button>
        </header>

        {/* Hero score — card surface tints with the score band */}
        <section
          className={`mt-6 rounded-2xl p-5 border ${scoreBandClasses(overall).bg} ${scoreBandClasses(overall).border}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p
                className={`text-[10px] uppercase tracking-[0.08em] font-bold ${scoreBandClasses(overall).overline}`}
              >
                Longevity score
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span
                  className="text-[56px] font-bold font-num tabular-nums leading-none transition-colors"
                  style={{ color: scoreColor(overall) }}
                >
                  {overall ?? "—"}
                </span>
                <span className="text-[14px] text-ink-4 font-num">/100</span>
              </div>
              {overall != null ? (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {overallDelta != null && overallDelta !== 0 ? (
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-white/70 ${
                        overallDelta > 0 ? "text-pillar-social" : "text-pillar-stress"
                      }`}
                    >
                      {overallDelta > 0 ? "↑" : "↓"} {Math.abs(overallDelta)} จากเมื่อวาน
                    </span>
                  ) : null}
                  {flaggedCount > 0 ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-pill bg-white/70 text-pillar-activity">
                      {flaggedCount} ค่าผิดปกติ
                    </span>
                  ) : null}
                </div>
              ) : (
                <p className="text-[12px] text-ink-3 mt-2">
                  ยังไม่ได้ประเมินวันนี้
                </p>
              )}
            </div>
            <MultiDonut
              rings={rings}
              size={120}
              thickness={5}
              ringGap={2.5}
            />
          </div>
        </section>

        {/* Quick action row — streak · daily · weekly as 3 tap targets */}
        <section className="mt-3 grid grid-cols-3 gap-2">
          <Link
            href="/client/checkin"
            className="rounded-lg border border-border bg-surface px-3 py-3 flex flex-col items-center text-center"
            aria-label={`ประเมินมา ${streak} วันติด`}
          >
            <p className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
              ประเมินมา
            </p>
            <p className="text-[26px] font-bold font-num tabular-nums leading-none mt-1 text-pillar-nutrition">
              {streak}
            </p>
            <p className="text-[10px] text-ink-4 mt-0.5">วันติด</p>
          </Link>

          <Link
            href="/client/checkin"
            className={`rounded-lg px-3 py-3 flex flex-col items-center text-center border ${
              todayCheckIn == null
                ? "bg-pillar-activity text-white border-pillar-activity"
                : "bg-surface border-border text-ink-3"
            }`}
            style={
              todayCheckIn == null
                ? { boxShadow: "0 4px 12px rgba(196, 81, 81, 0.25)" }
                : undefined
            }
          >
            <p
              className={`text-[10px] uppercase tracking-wider font-bold ${
                todayCheckIn == null ? "text-white/80" : "text-ink-4"
              }`}
            >
              วันนี้
            </p>
            <p className="text-[12px] font-semibold mt-1.5 leading-tight">
              {todayCheckIn == null ? "ประเมิน" : "แก้ประเมิน"}
            </p>
            <p
              className={`text-[10px] mt-0.5 ${
                todayCheckIn == null ? "text-white/70" : "text-ink-4"
              }`}
            >
              {todayCheckIn == null ? "ยังไม่ทำ" : "บันทึกแล้ว"}
            </p>
          </Link>

          <Link
            href="/client/weekly"
            className={`rounded-lg px-3 py-3 flex flex-col items-center text-center border ${
              thisWeekly == null
                ? "bg-pillar-social-wash border-pillar-social/40 text-pillar-social"
                : "bg-surface border-border text-ink-3"
            }`}
          >
            <p
              className={`text-[10px] uppercase tracking-wider font-bold ${
                thisWeekly == null ? "text-pillar-social/80" : "text-ink-4"
              }`}
            >
              สัปดาห์
            </p>
            <p className="text-[12px] font-semibold mt-1.5 leading-tight">
              {thisWeekly == null ? "สรุป" : "แก้สรุป"}
            </p>
            <p
              className={`text-[10px] mt-0.5 ${
                thisWeekly == null ? "text-pillar-social/70" : "text-ink-4"
              }`}
            >
              {thisWeekly == null ? "ยังไม่ทำ" : "บันทึกแล้ว"}
            </p>
          </Link>
        </section>

        {/* 6 pillar tiles */}
        <section className="mt-6">
          <div className="flex items-baseline justify-between mb-3 px-1">
            <h2 className="text-[14px] font-semibold text-ink">6 ด้านของสุขภาพ</h2>
            <span className="text-[11px] text-ink-4">{todayLabel}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {PILLARS.map((p) => {
              const score = scores?.[p.key] ?? null;
              const prev = prevScores?.[p.key] ?? null;
              const d = score != null && prev != null ? score - prev : null;
              return (
                <Link
                  key={p.key}
                  href={`/client/pillars/${p.key}`}
                  className="bg-surface rounded-lg p-3.5 border border-border flex items-center gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] uppercase tracking-wider text-ink-4 font-bold truncate">
                      {p.label}
                    </p>
                    <p
                      className="text-[26px] font-bold font-num tabular-nums leading-none mt-1"
                      style={{ color: p.hex }}
                    >
                      {score ?? "—"}
                    </p>
                    {d != null && d !== 0 ? (
                      <p
                        className={`text-[11px] font-semibold mt-0.5 ${
                          d > 0 ? "text-pillar-social" : "text-pillar-stress"
                        }`}
                      >
                        {d > 0 ? "↑" : "↓"} {Math.abs(d)}
                      </p>
                    ) : (
                      <p className="text-[11px] text-ink-4 mt-0.5">—</p>
                    )}
                  </div>
                  <DonutScore
                    value={score}
                    size={52}
                    thickness={4.5}
                    segments={14}
                    gapDeg={5}
                    color={p.hex}
                  />
                </Link>
              );
            })}
          </div>
        </section>

        {/* Labs / Meds shortcuts (body + nutrition are in the floating nav) */}
        <section className="mt-6">
          <h2 className="text-[14px] font-semibold text-ink mb-3 px-1">
            บันทึก
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            <ShortcutTile href="/client/labs" label="ผลแล็บ" hint="เลือด" icon={<FlaskIcon />} tone="substances" />
            <ShortcutTile href="/client/meds" label="ยา" hint="วันนี้" icon={<PillIcon />} tone="stress" />
          </div>
        </section>

        {/* Chat shortcut */}
        <Link
          href="/client/chat"
          className="mt-3 bg-surface rounded-lg p-4 border border-border block"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
              คุยกับ Longevity Designer
            </p>
            <span className="text-[12px] text-ink-3">→</span>
          </div>
          <p className="text-[14px] text-ink-2 mt-1.5 line-clamp-2">
            {lastMessage
              ? `${lastMessage.user.role === "CLIENT" ? "คุณ" : "Longevity Designer"}: ${lastMessage.content}`
              : "ยังไม่มีข้อความ — เริ่มถามได้เลย"}
          </p>
        </Link>

        {/* Upcoming session */}
        {upcoming ? (
          <section className="mt-3 bg-surface rounded-lg p-4 border border-border mb-6">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
              Session ถัดไป
            </p>
            <p className="text-[14px] text-ink-2 font-semibold mt-1.5">
              {upcoming.scheduledAt
                ? upcoming.scheduledAt.toLocaleString("th-TH", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "TBD"}
            </p>
            {upcoming.durationMin ? (
              <p className="text-[12px] text-ink-3 mt-0.5">
                ~{upcoming.durationMin} นาที · {upcoming.type}
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

function ShortcutTile({
  href,
  label,
  hint,
  icon,
  tone,
}: {
  href: string;
  label: string;
  hint: string;
  icon: React.ReactNode;
  tone: "activity" | "substances" | "stress" | "nutrition";
}) {
  const cls =
    tone === "activity"
      ? "bg-pillar-activity-wash text-pillar-activity"
      : tone === "substances"
      ? "bg-pillar-substances-wash text-pillar-substances"
      : tone === "nutrition"
      ? "bg-pillar-nutrition-wash text-pillar-nutrition"
      : "bg-pillar-stress-wash text-pillar-stress";
  return (
    <Link
      href={href}
      className="bg-surface rounded-lg p-3.5 border border-border flex flex-col items-center text-center"
    >
      <span className={`size-10 rounded-full inline-flex items-center justify-center ${cls}`}>
        {icon}
      </span>
      <p className="text-[12.5px] text-ink font-semibold mt-2">{label}</p>
      <p className="text-[10px] text-ink-4 mt-0.5">{hint}</p>
    </Link>
  );
}

function BellIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 8a6 6 0 0112 0c0 5 2 6.5 2 6.5H4S6 13 6 8z" />
      <path d="M10 19a2 2 0 004 0" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 21s-7-4.5-9.3-9.3C1.2 8.6 3 5.3 6.2 5.3c1.7 0 3.3.9 4.2 2.3l1.6 2.4 1.6-2.4c.9-1.4 2.5-2.3 4.2-2.3 3.2 0 5 3.3 3.5 6.4C19 16.5 12 21 12 21z" />
    </svg>
  );
}
function FlaskIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3h6M10 3v6.5L4.5 18a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9.5V3" />
      <path d="M7 14h10" />
    </svg>
  );
}
function PillIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <rect x={3.5} y={9} width={17} height={6} rx={3} transform="rotate(-30 12 12)" />
      <path d="M11 6.5l3 5.2" />
    </svg>
  );
}
function UtensilIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 3v8a2 2 0 002 2v8" />
      <path d="M5 3v6" />
      <path d="M9 3v6" />
      <path d="M16 3c-1.5 0-3 1.5-3 5s1.5 5 3 5v8" />
    </svg>
  );
}

function computeStreak(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates.map((d) => d.getTime()));
  let cursor = new Date(today);
  let streak = 0;
  if (!set.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
