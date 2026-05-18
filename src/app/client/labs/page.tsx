import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPanelsForUser } from "@/lib/labs";
import { CATEGORY_LABEL, type LabCategory } from "@/lib/lab-ranges";
import { RangeBar } from "@/components/charts/RangeBar";

export default async function LabsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const panels = await listPanelsForUser(session.user.id);
  const published = panels.filter((p) => p.status === "published");
  const drafts = panels.filter((p) => p.status === "draft");
  const latest = published[0] ?? null;

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ dashboard
        </Link>
        <header className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">
              Lab Results
            </h1>
            <p className="text-[12px] text-ink-3 mt-1">
              ผลตรวจเลือดของคุณ
            </p>
          </div>
          <Link
            href="/client/labs/new"
            className="px-3 h-10 inline-flex items-center rounded-md bg-ink text-white text-[13px] font-semibold"
          >
            + เพิ่มผล
          </Link>
        </header>

        {drafts.length > 0 ? (
          <section className="mt-4 bg-pillar-stress-wash border border-pillar-stress rounded-lg p-3">
            <p className="text-[12px] font-semibold text-pillar-stress">
              ส่งให้ designer review {drafts.length} รายการ
            </p>
            <p className="text-[11px] text-ink-3 mt-1">
              จะเห็นค่าหลัง designer publish
            </p>
          </section>
        ) : null}

        {!latest ? (
          <section className="mt-5 bg-surface border border-border rounded-lg p-8 text-center">
            <p className="text-[14px] text-ink-3">ยังไม่มีผลตรวจ</p>
            <Link
              href="/client/labs/new"
              className="mt-3 inline-flex items-center px-4 h-10 rounded-md bg-pillar-activity text-white text-[13px] font-semibold"
            >
              เพิ่มผลตรวจแรก
            </Link>
          </section>
        ) : (
          <PanelView panel={latest} />
        )}

        {published.length > 1 ? (
          <section className="mt-6">
            <h2 className="text-[14px] font-semibold text-ink-2 mb-2">ประวัติย้อนหลัง</h2>
            <ul className="space-y-2">
              {published.slice(1).map((p) => {
                const flagged = p.results.filter((r) => r.flag !== "normal");
                return (
                  <li
                    key={p.id}
                    className="bg-surface border border-border rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink">
                        {p.date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-ink-4 mt-0.5">
                        {p.results.length} รายการ · {flagged.length} ค่าผิดปกติ
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}

type PanelViewProps = {
  panel: {
    id: string;
    date: Date;
    labName: string | null;
    summary: string | null;
    results: Array<{
      id: string;
      category: string;
      name: string;
      value: number;
      unit: string;
      refLow: number | null;
      refHigh: number | null;
      flag: string;
      watch: boolean;
    }>;
  };
};

function PanelView({ panel }: PanelViewProps) {
  const watchOrFlagged = panel.results.filter(
    (r) => r.watch || r.flag === "high" || r.flag === "low" || r.flag === "critical",
  );

  const byCategory: Record<string, typeof panel.results> = {};
  for (const r of panel.results) {
    (byCategory[r.category] ??= []).push(r);
  }

  return (
    <>
      <section className="mt-5 bg-surface border border-border rounded-xl p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-semibold text-ink">
            {panel.date.toLocaleDateString("th-TH", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h2>
          {panel.labName ? (
            <span className="text-[11px] text-ink-4">{panel.labName}</span>
          ) : null}
        </div>
        {panel.summary ? (
          <p className="mt-2 text-[13px] text-ink-3">{panel.summary}</p>
        ) : null}
      </section>

      {watchOrFlagged.length > 0 ? (
        <section className="mt-3 bg-surface border border-border rounded-lg p-4">
          <h3 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            ค่าที่ต้องดู
          </h3>
          <ul className="mt-3 space-y-3">
            {watchOrFlagged.map((r) => (
              <li key={r.id}>
                <ResultRow r={r} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {Object.entries(byCategory).map(([cat, results]) => (
        <section
          key={cat}
          className="mt-3 bg-surface border border-border rounded-lg p-4"
        >
          <h3 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            {CATEGORY_LABEL[cat as LabCategory] ?? cat}
          </h3>
          <ul className="mt-3 space-y-3">
            {results.map((r) => (
              <li key={r.id}>
                <ResultRow r={r} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}

function ResultRow({
  r,
}: {
  r: {
    name: string;
    value: number;
    unit: string;
    refLow: number | null;
    refHigh: number | null;
    flag: string;
    watch: boolean;
  };
}) {
  return (
    <>
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-ink-2 font-medium">{r.name}</span>
        <span className="text-[14px] font-bold font-num tabular-nums text-ink">
          {r.value}
          <span className="text-[11px] text-ink-4 ml-1 font-medium">{r.unit}</span>
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <RangeBar
          value={r.value}
          low={r.refLow}
          high={r.refHigh}
          flag={r.flag as never}
          width={220}
          height={20}
        />
        <FlagPill flag={r.flag} />
      </div>
      {r.refLow != null || r.refHigh != null ? (
        <p className="text-[10px] text-ink-4 mt-1">
          ค่าปกติ:{" "}
          {r.refLow != null && r.refLow > 0 ? r.refLow : "—"}
          {" - "}
          {r.refHigh != null && r.refHigh < 999 ? r.refHigh : "—"} {r.unit}
        </p>
      ) : null}
    </>
  );
}

function FlagPill({ flag }: { flag: string }) {
  const cls =
    flag === "critical"
      ? "bg-pillar-activity-wash text-pillar-activity"
      : flag === "high" || flag === "low"
      ? "bg-pillar-stress-wash text-pillar-stress"
      : "bg-pillar-social-wash text-pillar-social";
  return (
    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${cls}`}>
      {flag}
    </span>
  );
}
