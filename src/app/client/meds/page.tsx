import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  listMedications,
  getTodaySchedule,
  adherence7d,
  TYPE_LABEL,
  SOURCE_LABEL,
  SOURCE_TONE,
  MED_SLOTS,
} from "@/lib/medications";
import { toggleSlot } from "./actions";

export default async function MedsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [meds, todaySlots] = await Promise.all([
    listMedications(session.user.id),
    getTodaySchedule(session.user.id),
  ]);

  const active = meds.filter((m) => m.status === "active");
  const discontinued = meds.filter((m) => m.status === "discontinued");

  // Group active by type
  const byType: Record<string, typeof active> = { rx: [], supplement: [], prn: [] };
  for (const m of active) (byType[m.type] ??= []).push(m);

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ dashboard
        </Link>

        <header className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">
              ยา · อาหารเสริม
            </h1>
            <p className="text-[12px] text-ink-3 mt-1">
              {active.length} active · {discontinued.length} หยุดแล้ว
            </p>
          </div>
        </header>

        <section className="mt-5 bg-surface border border-border rounded-xl p-4">
          <h2 className="text-[13px] font-semibold text-ink-2">ตารางวันนี้</h2>
          <div className="mt-3 space-y-3">
            {MED_SLOTS.map((slot) => {
              const items = todaySlots[slot] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={slot}>
                  <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
                    {slot}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {items.map((it) => (
                      <form
                        key={`${it.med.id}-${slot}`}
                        action={toggleSlot.bind(null, it.med.id, slot)}
                      >
                        <button
                          className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-pill text-[12px] font-semibold ${
                            it.taken
                              ? "bg-pillar-social text-white"
                              : "bg-surface border border-border-strong text-ink-2"
                          }`}
                        >
                          {it.taken ? "✓" : "○"} {it.med.name}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.values(todaySlots).every((arr) => arr.length === 0) ? (
              <p className="text-[13px] text-ink-3">ไม่มียาตามตารางวันนี้</p>
            ) : null}
          </div>
        </section>

        {(["rx", "supplement", "prn"] as const).map((type) => {
          const items = byType[type] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={type} className="mt-5">
              <h2 className="text-[14px] font-semibold text-ink-2 mb-2">
                {TYPE_LABEL[type]}
              </h2>
              <ul className="space-y-3">
                {items.map((m) => (
                  <MedCard key={m.id} med={m} />
                ))}
              </ul>
            </section>
          );
        })}

        {discontinued.length > 0 ? (
          <section className="mt-5 opacity-60">
            <h2 className="text-[14px] font-semibold text-ink-2 mb-2">หยุดแล้ว</h2>
            <ul className="space-y-3">
              {discontinued.map((m) => (
                <MedCard key={m.id} med={m} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function MedCard({
  med,
}: {
  med: {
    id: string;
    name: string;
    dose: string;
    schedule: string[];
    reason: string | null;
    source: string;
    sourceName: string | null;
    startedDate: Date;
    stoppedDate: Date | null;
    status: string;
    type: string;
    logs: Array<{ taken: boolean }>;
  };
}) {
  const pct = adherence7d(med.logs);
  const adherenceCls =
    pct >= 80 ? "text-pillar-social" : pct >= 50 ? "text-pillar-stress" : "text-pillar-activity";

  return (
    <li className="bg-surface border border-border rounded-lg p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[15px] font-semibold ${
              med.status === "discontinued" ? "line-through text-ink-3" : "text-ink"
            }`}
          >
            {med.name}
          </p>
          <p className="text-[12px] text-ink-3 mt-0.5">
            {med.dose} · {med.schedule.join(" / ") || "เมื่อจำเป็น"}
          </p>
        </div>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${SOURCE_TONE[med.source] ?? SOURCE_TONE.self}`}
        >
          {SOURCE_LABEL[med.source] ?? med.source}
        </span>
      </div>

      {med.reason ? (
        <p className="text-[12px] text-ink-3 mt-2">{med.reason}</p>
      ) : null}

      {med.status === "active" ? (
        <div className="mt-3 flex items-center gap-3">
          <span className={`text-[12px] font-bold font-num ${adherenceCls}`}>
            {pct}%
          </span>
          <span className="text-[11px] text-ink-4">7 วันล่าสุด</span>
        </div>
      ) : (
        <p className="text-[11px] text-ink-4 mt-2">
          หยุดเมื่อ{" "}
          {med.stoppedDate?.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}
    </li>
  );
}
