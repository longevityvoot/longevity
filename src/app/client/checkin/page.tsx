import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate } from "@/lib/dates";
import { saveCheckIn } from "./actions";
import { ScaleInput } from "./ScaleInput";

export default async function CheckInPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();
  const existing = await prisma.dailyCheckIn.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  });

  const dateLabel = today.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <main className="min-h-screen bg-canvas pb-32">
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3 flex items-center gap-3">
          <Link
            href="/client"
            className="size-9 inline-flex items-center justify-center rounded-full bg-surface border border-border text-ink-3"
            aria-label="กลับ"
          >
            ←
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold text-ink leading-tight">
              Check-in วันนี้
            </p>
            <p className="text-[11px] text-ink-3 leading-tight">{dateLabel}</p>
          </div>
          {existing ? (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-pill bg-pillar-social-wash text-pillar-social">
              กรอกแล้ว
            </span>
          ) : null}
        </div>
      </header>

      <form action={saveCheckIn} className="max-w-[420px] mx-auto px-5 pt-5 space-y-4">
        <Section title="พลังงาน" subtitle="วันนี้รู้สึกมีแรงแค่ไหน">
          <ScaleInput
            name="energyLevel"
            defaultValue={existing?.energyLevel ?? 5}
            lowLabel="หมดแรง"
            highLabel="สดชื่นมาก"
          />
        </Section>

        <Section title="อารมณ์" subtitle="ความรู้สึกโดยรวมวันนี้">
          <ScaleInput
            name="moodLevel"
            defaultValue={existing?.moodLevel ?? 5}
            lowLabel="แย่"
            highLabel="ดีมาก"
          />
        </Section>

        <Section title="การนอน" subtitle="คุณภาพการนอนเมื่อคืน">
          <ScaleInput
            name="sleepQuality"
            defaultValue={existing?.sleepQuality ?? 5}
            lowLabel="แย่"
            highLabel="หลับสนิทดี"
          />
        </Section>

        <Section title="ความเครียด" subtitle="ความตึงเครียดวันนี้">
          <ScaleInput
            name="stressLevel"
            defaultValue={existing?.stressLevel ?? 5}
            lowLabel="สบาย"
            highLabel="เครียดมาก"
          />
        </Section>

        <Section title="โภชนาการ" subtitle="มื้อสำคัญ / สิ่งที่กินวันนี้">
          <textarea
            name="nutritionNotes"
            defaultValue={existing?.nutritionNotes ?? ""}
            rows={2}
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
            placeholder="เช่น เช้ากินข้าวต้ม · เที่ยงสลัด · เย็นปลานึ่ง"
          />
        </Section>

        <Section title="สังคม" subtitle="คุยกับใคร / กิจกรรมกับคน">
          <textarea
            name="socialActivities"
            defaultValue={existing?.socialActivities ?? ""}
            rows={2}
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
            placeholder="เช่น ดินเนอร์กับครอบครัว · เจอเพื่อนหลังเลิกงาน"
          />
        </Section>

        <Section title="สารต่างๆ" subtitle="แอลกอฮอล์ · กาแฟ · บุหรี่">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] text-ink-3 font-semibold">แอลกอฮอล์ (drinks)</span>
              <input
                name="alcoholUnits"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                max="20"
                defaultValue={existing?.alcoholUnits ?? 0}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center focus:outline-none focus:border-ink"
              />
            </label>
            <label className="block">
              <span className="text-[11px] text-ink-3 font-semibold">กาแฟ (แก้ว)</span>
              <input
                name="caffeineCount"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="20"
                defaultValue={existing?.caffeineCount ?? 0}
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center focus:outline-none focus:border-ink"
              />
            </label>
          </div>
          <label className="mt-3 flex items-center gap-2 cursor-pointer">
            <input
              name="smokedToday"
              type="checkbox"
              defaultChecked={existing?.smokedToday ?? false}
              className="size-5 accent-ink"
            />
            <span className="text-[14px] text-ink-2">วันนี้สูบบุหรี่</span>
          </label>
        </Section>

        <Section title="บันทึกอื่นๆ" subtitle="ไม่บังคับ · designer จะอ่าน">
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            rows={3}
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
            placeholder="อยากเล่าให้ designer ฟัง..."
          />
        </Section>

        <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10">
          <div className="max-w-[420px] mx-auto">
            <button
              type="submit"
              className="w-full h-13 h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px] shadow"
              style={{ boxShadow: "0 4px 12px rgba(255, 107, 107, 0.25)" }}
            >
              บันทึก check-in
            </button>
            <p className="mt-1.5 text-[10px] text-ink-4 text-center">
              เก็บเป็น snapshot ของวันนี้ — แก้ทีหลังได้
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface rounded-lg p-4 border border-border">
      <div className="mb-3">
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        {subtitle ? (
          <p className="text-[11px] text-ink-4 mt-0.5">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
