import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { listClients, isSyntheticLineEmail } from "@/lib/clients";
import { PILLARS } from "@/lib/pillars";
import { DonutScore } from "@/components/charts/DonutScore";

export default async function CoachDashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const clients = await listClients();
  const total = clients.length;
  const stale = clients.filter((c) => !c.hasCheckedInToday).length;
  const lowScore = clients.filter((c) => c.overall != null && c.overall < 50).length;

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <header className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              Designer console
            </p>
            <h1 className="text-[24px] font-semibold tracking-tight text-ink mt-0.5">
              {session.user.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/client"
              className="text-[12px] text-ink-3 hover:underline"
            >
              มุม client →
            </Link>
            <Link
              href="/coach/clients/new"
              className="h-10 px-4 inline-flex items-center rounded-md bg-ink text-white text-[13px] font-semibold"
            >
              + ลูกค้าใหม่
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button className="text-[13px] text-ink-3 hover:underline">
                ออกจากระบบ
              </button>
            </form>
          </div>
        </header>

        <section className="mt-6 grid grid-cols-3 gap-3">
          <Stat label="ลูกค้าทั้งหมด" value={total} />
          <Stat label="ยังไม่ check-in วันนี้" value={stale} tone={stale ? "warning" : "ok"} />
          <Stat label="คะแนนต่ำกว่า 50" value={lowScore} tone={lowScore ? "danger" : "ok"} />
        </section>

        <section className="mt-8">
          <h2 className="text-[14px] font-semibold text-ink-2 mb-3">ลูกค้า</h2>
          {total === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <p className="text-[14px] text-ink-3">ยังไม่มีลูกค้าในระบบ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((c) => (
                <Link
                  key={c.id}
                  href={`/coach/clients/${c.id}`}
                  className="bg-surface border border-border rounded-lg p-4 hover:shadow transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <DonutScore
                      value={c.overall}
                      size={72}
                      thickness={7}
                      segments={14}
                      gapDeg={4}
                      color="#14142B"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-semibold text-ink truncate">
                        {c.name}
                      </p>
                      {isSyntheticLineEmail(c.email) ? null : (
                        <p className="text-[12px] text-ink-4 truncate">{c.email}</p>
                      )}
                      <p className="text-[12px] text-ink-3 mt-1">
                        {c.hasCheckedInToday
                          ? "check-in วันนี้แล้ว"
                          : c.lastCheckInAt
                          ? `ล่าสุด ${formatRelDate(c.lastCheckInAt)}`
                          : "ยังไม่เคย check-in"}
                      </p>
                    </div>
                  </div>

                  {c.scores && (
                    <div className="mt-3 flex gap-1.5">
                      {PILLARS.map((p) => {
                        const v = c.scores![p.key];
                        return (
                          <div
                            key={p.key}
                            className="flex-1 h-1.5 rounded-pill"
                            style={{
                              backgroundColor: "#ECECF2",
                            }}
                            aria-label={`${p.label}: ${v}`}
                          >
                            <div
                              className="h-full rounded-pill"
                              style={{
                                width: `${v}%`,
                                backgroundColor: p.hex,
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {c.alerts.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.alerts.map((a, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-pillar-stress-wash text-pillar-stress"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: number;
  tone?: "ok" | "warning" | "danger";
}) {
  const toneCls =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : "text-ink";
  return (
    <div className="bg-surface rounded-lg border border-border px-4 py-3">
      <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
        {label}
      </p>
      <p className={`text-[28px] font-bold font-num tabular-nums mt-1 ${toneCls}`}>
        {value}
      </p>
    </div>
  );
}

function formatRelDate(d: Date): string {
  const diffDays = Math.round((Date.now() - d.getTime()) / 86400000);
  if (diffDays === 0) return "วันนี้";
  if (diffDays === 1) return "เมื่อวาน";
  if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
  return d.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
