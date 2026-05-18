import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS } from "@/lib/pillars";
import { scoreFromCheckIn, overallScore } from "@/lib/scoring";
import { todayLocalDate } from "@/lib/dates";
import { MultiDonut } from "@/components/charts/MultiDonut";
import { DonutScore } from "@/components/charts/DonutScore";
import { getUpcomingSessionForClient } from "@/lib/sessions";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { greetingFor, bangkokHour } from "@/lib/greeting";

export default async function ClientHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();

  const [todayCheckIn, recent14, upcoming, recentMessages] = await Promise.all([
    prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    }),
    prisma.dailyCheckIn.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
      take: 14,
      select: { date: true },
    }),
    getUpcomingSessionForClient(session.user.id),
    listMessages(threadIdForClient(session.user.id), 3),
  ]);

  const scores = scoreFromCheckIn(todayCheckIn);
  const overall = overallScore(scores);
  const lastMessage = recentMessages[recentMessages.length - 1] ?? null;
  const streak = computeStreak(recent14.map((r) => r.date), today);
  const greeting = greetingFor(bangkokHour());

  const rings = PILLARS.map((p) => ({
    key: p.key,
    color: p.hex,
    value: scores?.[p.key] ?? null,
  }));

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-7">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-[12px] text-ink-3">{greeting}</p>
            <h1 className="text-[20px] font-semibold tracking-tight text-ink leading-tight mt-0.5">
              {session.user.name}
            </h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-[11px] text-ink-3 hover:underline">
              ออก
            </button>
          </form>
        </header>

        {/* Hero score */}
        <section className="mt-5 bg-surface rounded-xl p-5 border border-border">
          <div className="flex items-center gap-4">
            <MultiDonut
              rings={rings}
              size={160}
              thickness={6}
              ringGap={3}
              centerValue={overall != null ? String(overall) : "—"}
              centerLabel="100"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
                Longevity score
              </p>
              <p className="text-[12px] text-ink-3 mt-1">
                {overall != null
                  ? "วันนี้"
                  : "ยังไม่มีข้อมูลวันนี้"}
              </p>
              {streak > 0 ? (
                <p className="mt-2 text-[12px] text-ink-2">
                  <span className="font-bold font-num text-pillar-nutrition">{streak}</span> วัน check-in ต่อเนื่อง
                </p>
              ) : null}
              {todayCheckIn ? null : (
                <p className="mt-2 text-[11px] text-pillar-activity font-semibold">
                  กรอก check-in เพื่อดูคะแนน
                </p>
              )}
            </div>
          </div>
          <Link
            href="/client/checkin"
            className={`mt-4 inline-flex items-center justify-center w-full h-12 rounded-md text-[15px] font-semibold ${
              todayCheckIn == null
                ? "bg-pillar-activity text-white"
                : "border border-border-strong text-ink-2 bg-surface"
            }`}
          >
            {todayCheckIn == null ? "กรอก check-in วันนี้" : "แก้ check-in วันนี้"}
          </Link>
        </section>

        {/* 6 pillar tiles */}
        <section className="mt-5">
          <h2 className="text-[13px] font-semibold text-ink-2 mb-2 px-1">
            6 ด้านของสุขภาพ
          </h2>
          <div className="grid grid-cols-2 gap-2.5">
            {PILLARS.map((p) => {
              const score = scores?.[p.key] ?? null;
              return (
                <div
                  key={p.key}
                  className="bg-surface rounded-lg p-3 border border-border flex items-center gap-3"
                >
                  <DonutScore
                    value={score}
                    size={56}
                    thickness={5}
                    segments={14}
                    gapDeg={5}
                    color={p.hex}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-ink-3 font-medium truncate">
                      {p.label}
                    </p>
                    <p
                      className="text-[18px] font-bold font-num tabular-nums mt-0.5 leading-none"
                      style={{ color: p.hex }}
                    >
                      {score ?? "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quick links — body, labs, meds */}
        <section className="mt-5">
          <h2 className="text-[13px] font-semibold text-ink-2 mb-2 px-1">
            บันทึก
          </h2>
          <div className="grid grid-cols-3 gap-2.5">
            <Link
              href="/client/body"
              className="bg-surface rounded-lg p-3 border border-border flex flex-col items-center text-center"
            >
              <span className="text-[20px]">⚖️</span>
              <p className="text-[12px] text-ink-2 font-semibold mt-1">บอดี้</p>
              <p className="text-[10px] text-ink-4">น้ำหนัก · BP</p>
            </Link>
            <Link
              href="/client/labs"
              className="bg-surface rounded-lg p-3 border border-border flex flex-col items-center text-center"
            >
              <span className="text-[20px]">🧪</span>
              <p className="text-[12px] text-ink-2 font-semibold mt-1">ผลแล็บ</p>
              <p className="text-[10px] text-ink-4">เลือด</p>
            </Link>
            <Link
              href="/client/meds"
              className="bg-surface rounded-lg p-3 border border-border flex flex-col items-center text-center"
            >
              <span className="text-[20px]">💊</span>
              <p className="text-[12px] text-ink-2 font-semibold mt-1">ยา</p>
              <p className="text-[10px] text-ink-4">วันนี้</p>
            </Link>
          </div>
        </section>

        {/* Chat shortcut */}
        <Link
          href="/client/chat"
          className="mt-5 bg-surface rounded-lg p-4 border border-border block"
        >
          <div className="flex items-center justify-between">
            <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
              คุยกับ designer
            </p>
            <span className="text-[12px] text-ink-3">เปิด →</span>
          </div>
          <p className="text-[14px] text-ink-2 mt-2 line-clamp-2">
            {lastMessage
              ? `${lastMessage.user.role === "CLIENT" ? "คุณ" : "designer"}: ${lastMessage.content}`
              : "ยังไม่มีข้อความ — เริ่มถามได้เลย"}
          </p>
        </Link>

        {/* Upcoming session */}
        <section className="mt-3 bg-surface rounded-lg p-4 border border-border">
          <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            session ถัดไป
          </p>
          {upcoming ? (
            <div className="mt-2">
              <p className="text-[14px] text-ink-2 font-semibold">
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
            </div>
          ) : (
            <p className="text-[14px] text-ink-3 mt-2">ยังไม่มีนัด</p>
          )}
        </section>
      </div>
    </main>
  );
}

// Count consecutive days of check-ins ending today (or yesterday if today
// isn't filled yet) so a missed day breaks the streak immediately.
function computeStreak(dates: Date[], today: Date): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates.map((d) => d.getTime()));
  let cursor = new Date(today);
  let streak = 0;
  // If today not checked in, allow yesterday to start the streak so the
  // counter doesn't reset to 0 until 8am.
  if (!set.has(cursor.getTime())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (set.has(cursor.getTime())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
