import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPanelsForUser, getPreviousValuesMap } from "@/lib/labs";
import { CATEGORY_LABEL, type LabCategory } from "@/lib/lab-ranges";
import { RangeBar } from "@/components/charts/RangeBar";

const CATEGORY_HEX: Record<LabCategory, string> = {
  lipids: "#FF6B6B",
  glucose: "#FFA940",
  liver: "#52C41A",
  kidney: "#2E5BFF",
  inflammation: "#722ED1",
  vitamins: "#00C9A7",
  other: "#5A5A7A",
};

export default async function LabsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const panels = await listPanelsForUser(session.user.id);
  const published = panels.filter((p) => p.status === "published");
  const drafts = panels.filter((p) => p.status === "draft");
  const latest = published[0] ?? null;

  // Pull previous values to show delta on the latest panel
  const prevMap = latest
    ? await getPreviousValuesMap(session.user.id, latest.date)
    : new Map();

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ
        </Link>
        <header className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              Labs
            </p>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink mt-0.5">
              ผลตรวจของคุณ
            </h1>
          </div>
          <Link
            href="/client/labs/new"
            className="px-3 h-10 inline-flex items-center rounded-md bg-ink text-white text-[13px] font-semibold"
          >
            + เพิ่มผล
          </Link>
        </header>

        {drafts.length > 0 ? (
          <section className="mt-4 bg-pillar-stress-wash border border-pillar-stress rounded-lg p-3 flex items-start gap-2.5">
            <span className="text-[16px]">⏳</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-pillar-stress">
                ส่ง draft รอ designer review {drafts.length} รายการ
              </p>
              <p className="text-[11px] text-ink-3 mt-0.5">
                จะเห็นค่าหลัง designer publish
              </p>
            </div>
          </section>
        ) : null}

        {!latest ? (
          <section className="mt-5 bg-surface border border-border rounded-lg p-8 text-center">
            <div className="size-14 rounded-full bg-pillar-nutrition-wash flex items-center justify-center text-[24px] mx-auto">
              🧪
            </div>
            <p className="mt-3 text-[14px] font-semibold text-ink-2">ยังไม่มีผลตรวจ</p>
            <p className="mt-1 text-[12px] text-ink-3">
              เริ่มจากผลตรวจล่าสุดของคุณ designer จะช่วยอ่าน
            </p>
            <Link
              href="/client/labs/new"
              className="mt-4 inline-flex items-center px-4 h-10 rounded-md bg-pillar-activity text-white text-[13px] font-semibold"
            >
              เพิ่มผลตรวจแรก
            </Link>
          </section>
        ) : (
          <PanelView panel={latest} prevMap={prevMap} />
        )}

        {published.length > 1 ? (
          <section className="mt-6">
            <h2 className="text-[13px] font-semibold text-ink-2 mb-2 px-1">
              ประวัติย้อนหลัง
            </h2>
            <ul className="space-y-2">
              {published.slice(1).map((p) => {
                const flagged = p.results.filter((r) => r.flag !== "normal");
                return (
                  <li
                    key={p.id}
                    className="bg-surface border border-border rounded-lg p-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-ink">
                        {p.date.toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        {p.labName ? ` · ${p.labName}` : ""}
                      </p>
                      <p className="text-[11px] text-ink-4 mt-0.5">
                        {p.results.length} รายการ
                        {flagged.length > 0
                          ? ` · ${flagged.length} ค่าผิดปกติ`
                          : " · ทุกค่าปกติ"}
                      </p>
                    </div>
                    {flagged.length > 0 ? (
                      <span className="size-2 rounded-full bg-pillar-stress" />
                    ) : (
                      <span className="size-2 rounded-full bg-pillar-social" />
                    )}
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
  prevMap: Map<string, { value: number; date: Date }>;
};

function PanelView({ panel, prevMap }: PanelViewProps) {
  const watchOrFlagged = panel.results.filter(
    (r) => r.watch || r.flag === "high" || r.flag === "low" || r.flag === "critical",
  );

  const byCategory: Record<string, typeof panel.results> = {};
  for (const r of panel.results) (byCategory[r.category] ??= []).push(r);

  const totals = {
    n: panel.results.length,
    flagged: panel.results.filter((r) => r.flag !== "normal").length,
  };

  return (
    <>
      <section className="mt-5 bg-ink text-white rounded-xl p-5">
        <p className="text-[11px] uppercase tracking-wider text-ink-5 font-semibold">
          ผลล่าสุด
        </p>
        <p className="text-[18px] font-semibold mt-1">
          {panel.date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        {panel.labName ? (
          <p className="text-[12px] text-ink-5 mt-0.5">{panel.labName}</p>
        ) : null}
        <div className="mt-3 flex items-baseline gap-4">
          <div>
            <p className="text-[32px] font-bold font-num tabular-nums leading-none">
              {totals.n}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-5">รายการ</p>
          </div>
          <div>
            <p
              className={`text-[32px] font-bold font-num tabular-nums leading-none ${
                totals.flagged > 0 ? "text-pillar-stress" : "text-pillar-social"
              }`}
            >
              {totals.flagged}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-ink-5">
              ค่าที่ผิดปกติ
            </p>
          </div>
        </div>
        {panel.summary ? (
          <p className="mt-3 text-[13px] text-ink-5 italic">
            “{panel.summary}”
          </p>
        ) : null}
      </section>

      {watchOrFlagged.length > 0 ? (
        <section className="mt-3 bg-surface border border-border rounded-lg p-4">
          <h3 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
            ค่าที่ต้องดู
          </h3>
          <ul className="mt-3 space-y-4">
            {watchOrFlagged.map((r) => {
              const prev = prevMap.get(r.name);
              return (
                <li key={r.id}>
                  <ResultRow r={r} prev={prev} />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {Object.entries(byCategory).map(([cat, results]) => {
        const hex = CATEGORY_HEX[cat as LabCategory] ?? "#5A5A7A";
        return (
          <section
            key={cat}
            className="mt-3 bg-surface border border-border rounded-lg p-4"
          >
            <h3 className="flex items-center gap-2 text-[12px] uppercase tracking-wider font-semibold">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: hex }}
              />
              <span className="text-ink-2">
                {CATEGORY_LABEL[cat as LabCategory] ?? cat}
              </span>
            </h3>
            <ul className="mt-3 space-y-4">
              {results.map((r) => {
                const prev = prevMap.get(r.name);
                return (
                  <li key={r.id}>
                    <ResultRow r={r} prev={prev} />
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </>
  );
}

function ResultRow({
  r,
  prev,
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
  prev?: { value: number; date: Date };
}) {
  const delta = prev ? +(r.value - prev.value).toFixed(2) : null;
  const goodDirection =
    r.name.toLowerCase().includes("hdl") ||
    r.name.toLowerCase().includes("egfr") ||
    r.name.toLowerCase().includes("vitamin");
  const isImprovement =
    delta != null
      ? goodDirection
        ? delta > 0
        : delta < 0
      : null;

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-ink-2 font-medium">{r.name}</span>
        <div className="text-right">
          <span className="text-[15px] font-bold font-num tabular-nums text-ink">
            {r.value}
          </span>
          <span className="text-[10px] text-ink-4 ml-1">{r.unit}</span>
        </div>
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
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-ink-4">
        <span>
          {r.refLow != null && r.refLow > 0 ? r.refLow : "—"}
          {" - "}
          {r.refHigh != null && r.refHigh < 999 ? r.refHigh : "—"} {r.unit}
        </span>
        {delta != null ? (
          <span
            className={`font-semibold ${
              isImprovement
                ? "text-pillar-social"
                : delta === 0
                ? "text-ink-4"
                : "text-pillar-stress"
            }`}
          >
            {delta > 0 ? "↑" : delta < 0 ? "↓" : "="} {Math.abs(delta)} {r.unit} vs ครั้งก่อน
          </span>
        ) : null}
      </div>
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
