import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getClientDetail, ageFromDOB } from "@/lib/clients";
import { PILLARS } from "@/lib/pillars";
import { MultiDonut } from "@/components/charts/MultiDonut";
import { listSessionsForClient } from "@/lib/sessions";
import { listInvoicesForClient, invoiceTone } from "@/lib/invoices";
import { listMessages, threadIdForClient } from "@/lib/messages";
import { toggleInvoicePaid } from "./invoices/new/actions";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const client = await getClientDetail(id);
  if (!client) notFound();

  const [sessions, invoices, messages] = await Promise.all([
    listSessionsForClient(id),
    listInvoicesForClient(id),
    listMessages(threadIdForClient(id), 5),
  ]);
  const lastMessage = messages[messages.length - 1] ?? null;

  const rings = PILLARS.map((p) => ({
    key: p.key,
    color: p.hex,
    value: client.todayScores?.[p.key] ?? null,
  }));

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[1280px] mx-auto px-6 py-6">
        <Link href="/coach" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ designer console
        </Link>

        <header className="mt-3 flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              client
            </p>
            <h1 className="text-[24px] font-semibold tracking-tight text-ink mt-0.5">
              {client.name}
            </h1>
            <p className="text-[12px] text-ink-4 mt-0.5">{client.email}</p>
          </div>
        </header>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-5">
          {/* LEFT: profile */}
          <aside className="space-y-4">
            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                ข้อมูลพื้นฐาน
              </h2>
              {client.profile ? (
                <dl className="mt-3 space-y-2 text-[13px]">
                  <Row k="อายุ" v={`${ageFromDOB(client.profile.dateOfBirth)} ปี`} />
                  <Row
                    k="เพศ"
                    v={
                      client.profile.gender === "male"
                        ? "ชาย"
                        : client.profile.gender === "female"
                        ? "หญิง"
                        : client.profile.gender
                    }
                  />
                  <Row k="ส่วนสูง" v={`${client.profile.heightCm} cm`} />
                  <Row k="น้ำหนัก" v={`${client.profile.weightKg} kg`} />
                  <Row
                    k="wearable"
                    v={client.profile.wearableType ?? "ไม่มี"}
                  />
                </dl>
              ) : (
                <p className="mt-2 text-[13px] text-ink-3">ยังไม่ได้ onboard</p>
              )}
            </section>

            {client.profile?.longevityGoal ? (
              <section className="bg-surface border border-border rounded-lg p-4">
                <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                  เป้าหมาย
                </h2>
                <p className="mt-2 text-[13px] text-ink-2">
                  {client.profile.longevityGoal}
                </p>
                {client.profile.interestTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {client.profile.interestTags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex px-2 py-0.5 rounded-pill text-[11px] font-semibold bg-canvas text-ink-2 border border-border"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {(client.profile?.medicalHistory || client.profile?.allergies) && (
              <section className="bg-surface border border-border rounded-lg p-4">
                <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                  ประวัติสุขภาพ
                </h2>
                {client.profile?.medicalHistory && (
                  <p className="mt-2 text-[13px] text-ink-3">
                    {client.profile.medicalHistory}
                  </p>
                )}
                {client.profile?.allergies && (
                  <p className="mt-2 text-[13px] text-ink-3">
                    <span className="text-ink-4">แพ้: </span>
                    {client.profile.allergies}
                  </p>
                )}
              </section>
            )}
          </aside>

          {/* CENTER: scores + recent check-ins */}
          <section className="space-y-5">
            <div className="bg-surface border border-border rounded-xl p-5 flex items-center gap-5">
              <MultiDonut
                rings={rings}
                size={180}
                thickness={9}
                ringGap={3}
                centerValue={client.todayOverall != null ? String(client.todayOverall) : "—"}
                centerLabel="คะแนนวันนี้"
              />
              <div className="flex-1">
                <h2 className="text-[14px] font-semibold text-ink-2">6 ด้านวันนี้</h2>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {PILLARS.map((p) => {
                    const v = client.todayScores?.[p.key] ?? null;
                    return (
                      <div key={p.key} className="flex items-center gap-2">
                        <span
                          className="inline-block size-2.5 rounded-full"
                          style={{ backgroundColor: p.hex }}
                        />
                        <span className="text-[12px] text-ink-3 flex-1 min-w-0 truncate">
                          {p.label}
                        </span>
                        <span
                          className="text-[14px] font-bold font-num tabular-nums"
                          style={{ color: p.hex }}
                        >
                          {v ?? "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-lg p-5">
              <h2 className="text-[14px] font-semibold text-ink-2">Check-in 14 วันล่าสุด</h2>
              {client.recentCheckIns.length === 0 ? (
                <p className="mt-3 text-[13px] text-ink-3">ยังไม่มี check-in</p>
              ) : (
                <table className="mt-3 w-full text-[13px]">
                  <thead>
                    <tr className="text-ink-4 text-[11px] uppercase tracking-wider">
                      <th className="text-left font-semibold pb-2">วัน</th>
                      <th className="text-center font-semibold pb-2">รวม</th>
                      {PILLARS.map((p) => (
                        <th
                          key={p.key}
                          className="text-center font-semibold pb-2"
                          title={p.label}
                        >
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: p.hex }}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {client.recentCheckIns.map((ci, i) => (
                      <tr key={i} className="border-t border-border">
                        <td className="py-2 text-ink-2">
                          {ci.date.toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                          })}
                        </td>
                        <td className="py-2 text-center font-num font-semibold text-ink">
                          {ci.overall ?? "—"}
                        </td>
                        {PILLARS.map((p) => (
                          <td
                            key={p.key}
                            className="py-2 text-center font-num text-ink-3 tabular-nums"
                          >
                            {ci.scores?.[p.key] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          {/* RIGHT: actions / chat / sessions / invoices */}
          <aside className="space-y-4">
            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                Quick actions
              </h2>
              <div className="mt-3 space-y-2">
                <Link
                  href={`/coach/clients/${id}/sessions/new`}
                  className="w-full h-10 inline-flex items-center justify-center rounded-md bg-ink text-white text-[13px] font-semibold"
                >
                  + Session ใหม่
                </Link>
                <Link
                  href={`/coach/clients/${id}/chat`}
                  className="w-full h-10 inline-flex items-center justify-center rounded-md border border-border-strong text-[13px] font-semibold text-ink-2"
                >
                  เปิดแชท
                </Link>
                <Link
                  href={`/coach/clients/${id}/invoices/new`}
                  className="w-full h-10 inline-flex items-center justify-center rounded-md border border-border-strong text-[13px] font-semibold text-ink-2"
                >
                  + Invoice
                </Link>
              </div>
              {lastMessage ? (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
                    ข้อความล่าสุด
                  </p>
                  <p className="mt-1 text-[12px] text-ink-3 line-clamp-2">
                    {lastMessage.content}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                Sessions ล่าสุด
              </h2>
              {sessions.length === 0 ? (
                <p className="mt-2 text-[13px] text-ink-3">ยังไม่มี</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {sessions.slice(0, 5).map((s) => (
                    <li key={s.id}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded-pill ${
                            s.status === "upcoming"
                              ? "bg-pillar-sleep-wash text-pillar-sleep"
                              : s.status === "completed"
                              ? "bg-pillar-social-wash text-pillar-social"
                              : "bg-canvas text-ink-3"
                          }`}
                        >
                          {s.status}
                        </span>
                        <span className="text-[11px] text-ink-4">{s.type}</span>
                      </div>
                      <p className="text-[12px] text-ink-2 mt-1">
                        {s.scheduledAt
                          ? s.scheduledAt.toLocaleString("th-TH", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : s.createdAt.toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                        {s.durationMin ? ` · ${s.durationMin} นาที` : ""}
                      </p>
                      {s.summary ? (
                        <p className="text-[12px] text-ink-3 mt-0.5 line-clamp-2">
                          {s.summary}
                        </p>
                      ) : null}
                      {s.actionItems.length > 0 ? (
                        <ul className="mt-1 space-y-0.5 text-[12px] text-ink-3">
                          {s.actionItems.slice(0, 3).map((ai, i) => (
                            <li key={i}>• {ai.text}</li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                Invoices
              </h2>
              {invoices.length === 0 ? (
                <p className="mt-2 text-[13px] text-ink-3">ยังไม่มี</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {invoices.slice(0, 5).map((inv) => {
                    const tone = invoiceTone(inv.status);
                    const toneCls =
                      tone === "ok"
                        ? "bg-pillar-social-wash text-pillar-social"
                        : tone === "danger"
                        ? "bg-pillar-activity-wash text-pillar-activity"
                        : tone === "warning"
                        ? "bg-pillar-stress-wash text-pillar-stress"
                        : "bg-canvas text-ink-3";
                    return (
                      <li
                        key={inv.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[12px] text-ink-2 truncate">
                            {inv.description}
                          </p>
                          <p className="text-[11px] text-ink-4">
                            {inv.amount.toLocaleString()} {inv.currency} ·{" "}
                            {inv.issuedDate.toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        </div>
                        <form
                          action={toggleInvoicePaid.bind(null, inv.id, id)}
                        >
                          <button
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-pill ${toneCls}`}
                          >
                            {inv.status}
                          </button>
                        </form>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-4">{k}</dt>
      <dd className="text-ink-2 font-medium text-right">{v}</dd>
    </div>
  );
}
