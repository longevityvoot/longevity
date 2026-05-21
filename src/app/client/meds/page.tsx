import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  listMedications,
  getTodaySchedule,
  adherence7d,
  adherenceVector7d,
  TYPE_LABEL,
  SOURCE_LABEL,
  SOURCE_TONE,
  MED_SLOTS,
} from "@/lib/medications";
import { todayLocalDate } from "@/lib/dates";
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

  const byType: Record<string, typeof active> = { rx: [], supplement: [], prn: [] };
  for (const m of active) (byType[m.type] ??= []).push(m);

  const today = todayLocalDate();

  return (
    <main className="min-h-screen bg-canvas pb-6">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ
        </Link>

        <header className="mt-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
            อาหารเสริม
          </p>
          <h1 className="text-[22px] font-semibold tracking-tight text-ink mt-0.5">
            รายการที่กิน
          </h1>
          <p className="text-[12px] text-ink-3 mt-1">
            <span className="font-num font-semibold text-ink">{active.length}</span> active ·{" "}
            <span className="font-num font-semibold text-ink-3">{discontinued.length}</span> หยุดแล้ว
          </p>
        </header>

        <section className="mt-5 bg-surface border border-border rounded-xl p-4">
          <h2 className="text-[13px] font-semibold text-ink-2">ตารางวันนี้</h2>
          <div className="mt-3 space-y-3">
            {MED_SLOTS.map((slot) => {
              const items = todaySlots[slot] ?? [];
              if (items.length === 0) return null;
              return (
                <div key={slot}>
                  <p className="text-[10px] uppercase tracking-wider text-ink-4 font-semibold">
                    {slot}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.map((it) => (
                      <form
                        key={`${it.med.id}-${slot}`}
                        action={toggleSlot.bind(null, it.med.id, slot)}
                      >
                        <button
                          className={`inline-flex items-center gap-1.5 pl-2 pr-3 h-9 rounded-pill text-[12px] font-semibold ${
                            it.taken
                              ? "bg-pillar-social text-white"
                              : "bg-surface border border-border-strong text-ink-2"
                          }`}
                        >
                          <span
                            className={`inline-flex items-center justify-center size-5 rounded-full text-[11px] ${
                              it.taken
                                ? "bg-white/20 text-white"
                                : "border border-border-strong text-ink-4"
                            }`}
                          >
                            {it.taken ? "✓" : ""}
                          </span>
                          {it.med.name}
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              );
            })}
            {Object.values(todaySlots).every((arr) => arr.length === 0) ? (
              <p className="text-[13px] text-ink-3">ไม่มีอาหารเสริมตามตารางวันนี้</p>
            ) : null}
          </div>
        </section>

        {(["rx", "supplement", "prn"] as const).map((type) => {
          const items = byType[type] ?? [];
          if (items.length === 0) return null;
          return (
            <section key={type} className="mt-5">
              <h2 className="text-[13px] font-semibold text-ink-2 mb-2 px-1">
                {TYPE_LABEL[type]}
              </h2>
              <ul className="space-y-2">
                {items.map((m) => (
                  <MedCard key={m.id} med={m} today={today} />
                ))}
              </ul>
            </section>
          );
        })}

        {discontinued.length > 0 ? (
          <section className="mt-5 opacity-60">
            <h2 className="text-[13px] font-semibold text-ink-2 mb-2 px-1">หยุดแล้ว</h2>
            <ul className="space-y-2">
              {discontinued.map((m) => (
                <MedCard key={m.id} med={m} today={today} />
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
  today,
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
    logs: Array<{ date: Date; taken: boolean }>;
  };
  today: Date;
}) {
  const pct = adherence7d(med.logs);
  const adherenceCls =
    pct >= 80
      ? "text-pillar-social"
      : pct >= 50
      ? "text-pillar-stress"
      : "text-pillar-activity";
  const vector = adherenceVector7d(med.logs, today);

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
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-end gap-0.5" aria-label={`adherence: ${pct}%`}>
            {vector.map((d, i) => (
              <span
                key={i}
                title={d.date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                className={`w-1.5 rounded-pill ${
                  d.taken === true
                    ? "h-3.5 bg-pillar-social"
                    : d.taken === false
                    ? "h-3.5 bg-pillar-activity/40"
                    : "h-3.5 bg-canvas border border-border"
                }`}
              />
            ))}
          </div>
          <div className="text-right">
            <p className={`text-[14px] font-bold font-num ${adherenceCls}`}>
              {pct}%
            </p>
            <p className="text-[10px] text-ink-4">7d adherence</p>
          </div>
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
