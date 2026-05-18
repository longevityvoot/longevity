import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { listPanelsForUser, getPreviousValuesMap } from "@/lib/labs";
import { CATEGORY_LABEL, formatRangeRaw, type LabCategory } from "@/lib/lab-ranges";
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

  const prevMap = latest
    ? await getPreviousValuesMap(session.user.id, latest.date)
    : new Map();

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
            <p className="text-[10px] uppercase tracking-[0.1em] text-pillar-substances font-bold">
              Labs
            </p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              ผลแล็บ
            </p>
          </div>
          <Link
            href="/client/labs/new"
            className="text-[12px] text-ink-3 font-semibold"
          >
            +เพิ่ม
          </Link>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-4">
        {drafts.length > 0 ? (
          <section className="bg-pillar-stress-wash border border-pillar-stress/30 rounded-lg p-3 flex items-start gap-2.5">
            <span className="size-6 mt-0.5 rounded-full bg-pillar-stress text-white inline-flex items-center justify-center text-[12px] font-bold">
              {drafts.length}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-ink">
                ส่ง draft รอ designer review
              </p>
              <p className="text-[11px] text-ink-3 mt-0.5">
                จะเห็นค่าหลัง designer publish
              </p>
            </div>
          </section>
        ) : null}

        {!latest ? (
          <section className="mt-4 bg-surface border border-border rounded-lg p-8 text-center">
            <div className="size-14 rounded-full bg-pillar-substances-wash text-pillar-substances inline-flex items-center justify-center">
              <FlaskIcon />
            </div>
            <p className="mt-3 text-[14px] font-semibold text-ink-2">
              ยังไม่มีผลตรวจ
            </p>
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
            <h2 className="text-[10px] uppercase tracking-wider text-ink-4 font-bold mb-2 px-1">
              ประวัติย้อนหลัง
            </h2>
            <ul className="space-y-2">
              {published.slice(1).map((p) => {
                const flagged = p.results.filter((r) => r.flag !== "normal");
                return (
                  <li
                    key={p.id}
                    className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-3"
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
                        {p.labName ? `${p.labName} · ` : ""}
                        {p.results.length} รายการ
                        {flagged.length > 0
                          ? ` · ${flagged.length} ผิดปกติ`
                          : ""}
                      </p>
                    </div>
                    <span
                      className={`size-2 rounded-full ${
                        flagged.length > 0 ? "bg-pillar-stress" : "bg-pillar-social"
                      }`}
                    />
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
    note: string | null;
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

  // Human-readable summary "X ค่าที่ต้องดู — A, B"
  const flaggedSummary = (() => {
    if (watchOrFlagged.length === 0) return "ทุกค่าอยู่ในเกณฑ์ปกติ";
    const names = watchOrFlagged.slice(0, 2).map((r) => {
      const direction =
        r.flag === "high" || r.flag === "critical"
          ? "สูง"
          : r.flag === "low"
          ? "ต่ำ"
          : "ต้องดู";
      return `${r.name} ${direction}`;
    });
    const tail =
      watchOrFlagged.length > 2 ? ` · อีก ${watchOrFlagged.length - 2}` : "";
    return `${watchOrFlagged.length} ค่าที่ต้องดู — ${names.join(", ")}${tail}`;
  })();

  return (
    <>
      {/* Hero panel */}
      <section className="mt-4 bg-surface rounded-xl p-5 border border-border">
        <p className="text-[10px] uppercase tracking-[0.08em] text-ink-4 font-bold">
          ผลล่าสุด
        </p>
        <p className="text-[24px] font-bold text-ink leading-tight mt-1">
          {panel.date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-[12px] text-ink-3 mt-1">
          {[panel.labName, panel.note ?? "ผลตรวจประจำ"].filter(Boolean).join(" · ")}
        </p>
        <p
          className={`mt-3 text-[13px] font-medium px-3 py-2 rounded-md ${
            watchOrFlagged.length > 0
              ? "bg-pillar-stress-wash text-pillar-stress"
              : "bg-pillar-social-wash text-pillar-social"
          }`}
        >
          {flaggedSummary}
        </p>
        {panel.summary ? (
          <p className="mt-3 text-[13px] text-ink-3 italic border-l-2 border-border pl-3">
            “{panel.summary}”
          </p>
        ) : null}
      </section>

      {watchOrFlagged.length > 0 ? (
        <section className="mt-3 bg-surface border border-border rounded-lg p-4">
          <h3 className="text-[10px] uppercase tracking-wider text-ink-4 font-bold">
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
            <h3 className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: hex }}
              />
              <span className="text-ink-2">
                {CATEGORY_LABEL[cat as LabCategory] ?? cat}
              </span>
              <span className="text-ink-4 normal-case font-medium ml-auto">
                {results.length} รายการ
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

  // Direction arrow for the value itself (high → up, low → down)
  const valueArrow =
    r.flag === "high" || r.flag === "critical"
      ? "↑"
      : r.flag === "low"
      ? "↓"
      : null;
  const valueTone =
    r.flag === "critical"
      ? "text-pillar-activity"
      : r.flag === "high" || r.flag === "low"
      ? "text-pillar-stress"
      : "text-ink";

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] text-ink-2 font-medium flex items-center gap-1.5">
          {r.name}
          {r.watch ? (
            <span className="text-[9px] text-pillar-stress font-bold uppercase tracking-wider">
              ★
            </span>
          ) : null}
        </span>
        <div className="text-right flex items-baseline gap-1">
          {valueArrow ? (
            <span className={`text-[14px] font-bold ${valueTone}`}>
              {valueArrow}
            </span>
          ) : null}
          <span className={`text-[17px] font-bold font-num tabular-nums ${valueTone}`}>
            {r.value}
          </span>
          <span className="text-[10px] text-ink-4 ml-0.5">{r.unit}</span>
        </div>
      </div>
      <div className="mt-1.5">
        <RangeBar
          value={r.value}
          low={r.refLow}
          high={r.refHigh}
          flag={r.flag as never}
          width={300}
          height={18}
        />
      </div>
      <div className="mt-1 flex items-center justify-between gap-2 text-[10.5px] text-ink-4">
        <span>ปกติ {formatRangeRaw(r.refLow, r.refHigh, r.unit)}</span>
        {delta != null && delta !== 0 ? (
          <span
            className={`font-semibold ${
              isImprovement ? "text-pillar-social" : "text-pillar-stress"
            }`}
          >
            {delta > 0 ? "↑" : "↓"} {Math.abs(delta)} vs ครั้งก่อน
          </span>
        ) : null}
      </div>
    </>
  );
}

function FlaskIcon() {
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3h6M10 3v6.5L4.5 18a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9.5V3" />
      <path d="M7 14h10" />
    </svg>
  );
}
