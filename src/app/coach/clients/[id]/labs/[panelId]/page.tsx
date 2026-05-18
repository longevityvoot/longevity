import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getPanel } from "@/lib/labs";
import { CATEGORY_LABEL, type LabCategory } from "@/lib/lab-ranges";
import { RangeBar } from "@/components/charts/RangeBar";
import { publishPanel, toggleWatch, saveSummary } from "./actions";

export default async function CoachPanelDetail({
  params,
}: {
  params: Promise<{ id: string; panelId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id, panelId } = await params;

  const panel = await getPanel(panelId);
  if (!panel || panel.userId !== id) notFound();
  const clientName = panel.user?.name ?? "";

  const byCategory: Record<string, typeof panel.results> = {};
  for (const r of panel.results) (byCategory[r.category] ??= []).push(r);

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[920px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${id}/labs`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ panels
        </Link>

        <header className="mt-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              {clientName}
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink mt-0.5">
              {panel.date.toLocaleDateString("th-TH", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              {panel.labName ? ` · ${panel.labName}` : ""}
            </h1>
            <span
              className={`mt-1 inline-flex text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-pill ${
                panel.status === "published"
                  ? "bg-pillar-social-wash text-pillar-social"
                  : "bg-pillar-stress-wash text-pillar-stress"
              }`}
            >
              {panel.status}
            </span>
          </div>
          {panel.status === "draft" ? (
            <form action={publishPanel.bind(null, panel.id, id)}>
              <button className="h-10 px-4 rounded-md bg-ink text-white text-[13px] font-semibold">
                Publish ให้ client
              </button>
            </form>
          ) : null}
        </header>

        <section className="mt-5 bg-surface border border-border rounded-lg p-4">
          <form action={saveSummary.bind(null, panel.id, id)}>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">
                Summary (โชว์ให้ client เห็น)
              </span>
              <textarea
                name="summary"
                defaultValue={panel.summary ?? ""}
                rows={3}
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
                placeholder="สรุปสั้นๆ ที่จะส่งให้ client อ่าน"
              />
            </label>
            <div className="mt-2 flex justify-end">
              <button className="h-9 px-4 rounded-md border border-border-strong text-[13px] font-semibold">
                บันทึก summary
              </button>
            </div>
          </form>
        </section>

        {Object.entries(byCategory).map(([cat, results]) => (
          <section key={cat} className="mt-3 bg-surface border border-border rounded-lg p-4">
            <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
              {CATEGORY_LABEL[cat as LabCategory] ?? cat}
            </h2>
            <ul className="mt-3 space-y-3">
              {results.map((r) => (
                <li key={r.id}>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-2 font-medium">{r.name}</span>
                    <span className="text-[14px] font-bold font-num tabular-nums text-ink">
                      {r.value}
                      <span className="text-[11px] text-ink-4 ml-1">{r.unit}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <RangeBar
                      value={r.value}
                      low={r.refLow}
                      high={r.refHigh}
                      flag={r.flag as never}
                      width={280}
                      height={20}
                    />
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${
                        r.flag === "critical"
                          ? "bg-pillar-activity-wash text-pillar-activity"
                          : r.flag === "high" || r.flag === "low"
                          ? "bg-pillar-stress-wash text-pillar-stress"
                          : "bg-pillar-social-wash text-pillar-social"
                      }`}
                    >
                      {r.flag}
                    </span>
                    <form action={toggleWatch.bind(null, r.id, id)}>
                      <button
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${
                          r.watch
                            ? "bg-ink text-white"
                            : "border border-border-strong text-ink-3"
                        }`}
                      >
                        {r.watch ? "watching" : "+ watch"}
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
