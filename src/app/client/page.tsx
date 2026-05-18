import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS } from "@/lib/pillars";
import { scoreFromCheckIn, overallScore } from "@/lib/scoring";
import { todayLocalDate } from "@/lib/dates";

export default async function ClientHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();

  const todayCheckIn = await prisma.dailyCheckIn.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  });

  const scores = scoreFromCheckIn(todayCheckIn);
  const overall = overallScore(scores);

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
            <button className="text-[12px] text-ink-3 underline-offset-2 hover:underline">
              ออกจากระบบ
            </button>
          </form>
        </header>

        <section className="mt-6 bg-ink text-white rounded-xl p-5 shadow-lg">
          <p className="text-[11px] uppercase tracking-wider text-ink-5 font-semibold">
            Longevity score วันนี้
          </p>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="text-[44px] font-bold font-num tabular-nums leading-none">
              {overall ?? "—"}
            </span>
            <span className="text-[13px] text-ink-5">
              {overall != null ? "คะแนนรวม 6 ด้าน" : "ยังไม่ได้กรอกวันนี้"}
            </span>
          </div>
          {overall == null ? (
            <Link
              href="/client/checkin"
              className="mt-4 inline-flex items-center justify-center w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
            >
              กรอก check-in วันนี้ (~1 นาที)
            </Link>
          ) : (
            <Link
              href="/client/checkin"
              className="mt-4 inline-flex items-center justify-center w-full h-11 rounded-md border border-ink-3 text-white text-[13px] font-semibold"
            >
              แก้ไข check-in วันนี้
            </Link>
          )}
        </section>

        <section className="mt-6">
          <h2 className="text-[14px] font-semibold text-ink-2 mb-3">6 ด้านของสุขภาพ</h2>
          <div className="grid grid-cols-2 gap-3">
            {PILLARS.map((p) => {
              const score = scores?.[p.key] ?? null;
              return (
                <div
                  key={p.key}
                  className="bg-surface rounded-lg p-4 border border-border"
                >
                  <p className="text-[12px] text-ink-3 font-medium">{p.label}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className={`text-[24px] font-bold font-num tabular-nums text-${p.color}`}>
                      {score ?? "—"}
                    </span>
                    {score != null && <span className="text-[11px] text-ink-4">/100</span>}
                  </div>
                  <div className="mt-2 h-1.5 bg-canvas rounded-pill overflow-hidden">
                    <div
                      className={`h-full bg-${p.color} rounded-pill`}
                      style={{ width: `${score ?? 0}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-ink-4 mt-3">
            * Donut chart แบบ Garmin จะมาใน Phase 3 — ตอนนี้ใช้ bar placeholder
          </p>
        </section>

        <section className="mt-6 bg-surface rounded-lg p-4 border border-border">
          <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            ข้อความจาก designer
          </p>
          <p className="text-[14px] text-ink-3 mt-2">
            ยังไม่มี insight ใหม่ — designer จะส่งให้หลัง review check-in
          </p>
        </section>

        <section className="mt-3 bg-surface rounded-lg p-4 border border-border">
          <p className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            session ถัดไป
          </p>
          <p className="text-[14px] text-ink-3 mt-2">ยังไม่มีนัด</p>
        </section>
      </div>
    </main>
  );
}
