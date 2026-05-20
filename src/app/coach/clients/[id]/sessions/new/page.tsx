import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createSession } from "./actions";

export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id: clientId } = await params;

  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: { id: true, name: true, clientProfile: { select: { id: true } } },
  });
  if (!client || !client.clientProfile) notFound();

  return (
    <main className="min-h-screen bg-canvas">
      <div className="max-w-[720px] mx-auto px-6 py-6">
        <Link
          href={`/coach/clients/${clientId}`}
          className="text-[13px] text-ink-3 inline-flex items-center gap-1"
        >
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          New session — {client.name}
        </h1>

        <form
          action={createSession.bind(null, clientId)}
          className="mt-6 space-y-4 bg-surface border border-border rounded-lg p-5"
        >
          <fieldset>
            <legend className="text-[12px] text-ink-3 font-semibold">ประเภท</legend>
            <div className="mt-2 flex gap-3">
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="type"
                  value="scheduled"
                  defaultChecked
                  className="accent-ink"
                />
                Scheduled (นัด)
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input type="radio" name="type" value="async" className="accent-ink" />
                Async (chat-based)
              </label>
            </div>
          </fieldset>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">วันเวลา</span>
            <input
              name="scheduledAt"
              type="datetime-local"
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
            />
            <span className="text-[11px] text-ink-4 mt-1 block">
              เว้นว่างได้ถ้าเป็น async
            </span>
          </label>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">เวลา (นาที)</span>
            <input
              name="durationMin"
              type="number"
              min="0"
              defaultValue={45}
              className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">สรุป / notes</span>
            <textarea
              name="summary"
              rows={4}
              className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
              placeholder="หลังนัด — สรุปประเด็นที่คุย, สิ่งที่ลูกค้าบอก, observation"
            />
          </label>

          <label className="block">
            <span className="text-[12px] text-ink-3 font-semibold">
              Action items (บรรทัดละหนึ่ง)
            </span>
            <textarea
              name="actionItems"
              rows={4}
              className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none font-mono"
              placeholder="เพิ่ม Zone 2 อย่างน้อย 90 นาที/สัปดาห์&#10;ลด caffeine หลังบ่าย 2&#10;ประเมินทุกวัน"
            />
          </label>

          <fieldset>
            <legend className="text-[12px] text-ink-3 font-semibold">สถานะ</legend>
            <div className="mt-2 flex gap-3">
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="status"
                  value="upcoming"
                  defaultChecked
                  className="accent-ink"
                />
                Upcoming
              </label>
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="radio"
                  name="status"
                  value="completed"
                  className="accent-ink"
                />
                Completed
              </label>
            </div>
          </fieldset>

          <div className="pt-2 flex gap-3">
            <Link
              href={`/coach/clients/${clientId}`}
              className="h-11 px-5 inline-flex items-center rounded-md border border-border-strong text-[14px] text-ink-2"
            >
              ยกเลิก
            </Link>
            <button
              type="submit"
              className="flex-1 h-11 rounded-md bg-ink text-white font-semibold text-[14px]"
            >
              บันทึก session
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
