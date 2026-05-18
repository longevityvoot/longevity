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

export default async function ClientHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();

  const [todayCheckIn, upcoming, recentMessages] = await Promise.all([
    prisma.dailyCheckIn.findUnique({
      where: { userId_date: { userId: session.user.id, date: today } },
    }),
    getUpcomingSessionForClient(session.user.id),
    listMessages(threadIdForClient(session.user.id), 3),
  ]);

  const scores = scoreFromCheckIn(todayCheckIn);
  const overall = overallScore(scores);
  const lastMessage = recentMessages[recentMessages.length - 1] ?? null;

  const rings = PILLARS.map((p) => ({
    key: p.key,
    color: p.hex,
    value: scores?.[p.key] ?? null,
  }));

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-8">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
              สวัสดี
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink mt-0.5">
              {session.user.name}
            </h1>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="text-[12px] text-ink-3 hover:underline">
              ออกจากระบบ
            </button>
          </form>
        </header>

        <section className="mt-6 bg-surface rounded-xl p-5 border border-border flex items-center gap-5">
          <MultiDonut
            rings={rings}
            size={170}
            thickness={8}
            ringGap={3}
            centerValue={overall != null ? String(overall) : "—"}
            centerLabel="คะแนนรวม"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              Longevity score วันนี้
            </p>
            <p className="text-[13px] text-ink-3 mt-1">
              {overall != null
                ? "อัปเดตจาก check-in ล่าสุด"
                : "ยังไม่ได้กรอก check-in วันนี้"}
            </p>
            <Link
              href="/client/checkin"
              className={`mt-3 inline-flex items-center justify-center w-full h-10 rounded-md text-[13px] font-semibold ${
                overall == null
                  ? "bg-pillar-activity text-white"
                  : "border border-border-strong text-ink-2"
              }`}
            >
              {overall == null ? "กรอก check-in" : "แก้ check-in"}
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[14px] font-semibold text-ink-2 mb-3">6 ด้านของสุขภาพ</h2>
          <div className="grid grid-cols-2 gap-3">
            {PILLARS.map((p) => {
              const score = scores?.[p.key] ?? null;
              return (
                <div
                  key={p.key}
                  className="bg-surface rounded-lg p-3 border border-border flex items-center gap-3"
                >
                  <DonutScore
                    value={score}
                    size={64}
                    thickness={6}
                    segments={14}
                    gapDeg={4}
                    color={p.hex}
                  />
                  <div className="min-w-0">
                    <p className="text-[11px] text-ink-4 font-semibold uppercase tracking-wider truncate">
                      {p.label}
                    </p>
                    <p
                      className="text-[18px] font-bold font-num tabular-nums"
                      style={{ color: p.hex }}
                    >
                      {score ?? "—"}
                      {score != null && (
                        <span className="text-[10px] text-ink-4 ml-1">/100</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <Link
            href="/client/body"
            className="bg-surface rounded-lg p-4 border border-border block"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              Body & Vitals
            </p>
            <p className="text-[13px] text-ink-3 mt-1">
              น้ำหนัก / ความดัน / น้ำตาล
            </p>
          </Link>
          <Link
            href="/client/labs"
            className="bg-surface rounded-lg p-4 border border-border block"
          >
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              Lab Results
            </p>
            <p className="text-[13px] text-ink-3 mt-1">ผลตรวจเลือด</p>
          </Link>
        </div>

        <Link
          href="/client/chat"
          className="mt-3 bg-surface rounded-lg p-4 border border-border block"
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
