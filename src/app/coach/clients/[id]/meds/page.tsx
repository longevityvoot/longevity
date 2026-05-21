import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  listMedications,
  adherence7d,
  TYPE_LABEL,
  SOURCE_LABEL,
  SOURCE_TONE,
} from "@/lib/medications";
import { setStatus, deleteMedication } from "./actions";

export default async function CoachMedsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const client = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, clientProfile: { select: { id: true } } },
  });
  if (!client || !client.clientProfile) notFound();

  const meds = await listMedications(id);
  const active = meds.filter((m) => m.status === "active");
  const discontinued = meds.filter((m) => m.status !== "active");

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[920px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${id}`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>

        <header className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight text-ink">
              Supplements — {client.name}
            </h1>
            <p className="text-[12px] text-ink-3 mt-1">
              {active.length} active · {discontinued.length} หยุดแล้ว
            </p>
          </div>
          <Link
            href={`/coach/clients/${id}/meds/new`}
            className="h-10 px-4 inline-flex items-center rounded-md bg-ink text-white text-[13px] font-semibold"
          >
            + อาหารเสริมใหม่
          </Link>
        </header>

        {active.length === 0 ? (
          <p className="mt-6 text-[14px] text-ink-3">ยังไม่มีอาหารเสริม active</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {active.map((m) => (
              <MedRow key={m.id} med={m} clientId={id} />
            ))}
          </ul>
        )}

        {discontinued.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-[14px] font-semibold text-ink-2 mb-2">หยุดแล้ว</h2>
            <ul className="space-y-2 opacity-70">
              {discontinued.map((m) => (
                <MedRow key={m.id} med={m} clientId={id} />
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function MedRow({
  med,
  clientId,
}: {
  med: {
    id: string;
    name: string;
    dose: string;
    schedule: string[];
    reason: string | null;
    source: string;
    type: string;
    status: string;
    logs: Array<{ taken: boolean }>;
  };
  clientId: string;
}) {
  const pct = adherence7d(med.logs);
  const adherenceCls =
    pct >= 80 ? "text-pillar-social" : pct >= 50 ? "text-pillar-stress" : "text-pillar-activity";

  return (
    <li className="bg-surface border border-border rounded-lg p-4 flex items-start gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[15px] font-semibold text-ink">{med.name}</span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-pill ${SOURCE_TONE[med.source] ?? SOURCE_TONE.self}`}
          >
            {SOURCE_LABEL[med.source] ?? med.source}
          </span>
          <span className="text-[10px] text-ink-4">{TYPE_LABEL[med.type] ?? med.type}</span>
        </div>
        <p className="text-[12px] text-ink-3 mt-1">
          {med.dose} · {med.schedule.join(" / ") || "เมื่อจำเป็น"}
        </p>
        {med.reason ? (
          <p className="text-[12px] text-ink-3 mt-0.5">{med.reason}</p>
        ) : null}
      </div>
      {med.status === "active" ? (
        <>
          <div className="text-right">
            <p className={`text-[16px] font-bold font-num ${adherenceCls}`}>{pct}%</p>
            <p className="text-[10px] text-ink-4">adherence 7d</p>
          </div>
          <form action={setStatus.bind(null, med.id, clientId, "discontinued")}>
            <button className="h-9 px-3 rounded-md border border-border-strong text-[12px] text-ink-3">
              หยุด
            </button>
          </form>
        </>
      ) : (
        <form action={setStatus.bind(null, med.id, clientId, "active")}>
          <button className="h-9 px-3 rounded-md border border-border-strong text-[12px] text-ink-3">
            เริ่มอีก
          </button>
        </form>
      )}
      <form action={deleteMedication.bind(null, med.id, clientId)}>
        <button
          type="submit"
          className="size-9 rounded-md border border-border-strong text-[14px] text-pillar-activity hover:bg-pillar-activity-wash"
          title="ลบรายการนี้ (เผื่อใส่ผิด — ลบ log ทั้งหมดด้วย)"
          aria-label="ลบรายการ"
        >
          ✕
        </button>
      </form>
    </li>
  );
}
