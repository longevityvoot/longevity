import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getClientDetail, ageFromDOB } from "@/lib/clients";
import { PILLARS } from "@/lib/pillars";
import { MultiDonut } from "@/components/charts/MultiDonut";
import { DonutScore } from "@/components/charts/DonutScore";

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

          {/* RIGHT: actions + chat placeholder */}
          <aside className="space-y-4">
            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                Quick actions
              </h2>
              <div className="mt-3 space-y-2">
                <button
                  disabled
                  className="w-full h-10 rounded-md border border-border-strong text-[13px] font-semibold text-ink-3"
                >
                  + Session ใหม่ (Phase 5)
                </button>
                <button
                  disabled
                  className="w-full h-10 rounded-md border border-border-strong text-[13px] font-semibold text-ink-3"
                >
                  ส่งข้อความ (Phase 5)
                </button>
              </div>
            </section>

            <section className="bg-surface border border-border rounded-lg p-4">
              <h2 className="text-[12px] uppercase tracking-wider text-ink-4 font-semibold">
                Action items
              </h2>
              <p className="mt-2 text-[13px] text-ink-3">มาใน Phase 5</p>
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
