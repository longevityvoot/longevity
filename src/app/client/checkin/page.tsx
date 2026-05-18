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

  return (
    <main className="min-h-screen bg-canvas pb-32">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ dashboard
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          Check-in วันนี้
        </h1>
        <p className="text-[13px] text-ink-3 mt-1">
          {existing ? "แก้ไขข้อมูลที่กรอกไปแล้ว" : "ใช้เวลาประมาณ 1 นาที — 6 ด้านของสุขภาพ"}
        </p>

        <form action={saveCheckIn} className="mt-6 space-y-6">
          {/* 1. Energy */}
          <Section title="พลังงานวันนี้" subtitle="1 = หมดแรง · 10 = สดชื่นมาก">
            <ScaleInput name="energyLevel" defaultValue={existing?.energyLevel ?? 5} />
          </Section>

          {/* 2. Mood */}
          <Section title="อารมณ์" subtitle="1 = แย่มาก · 10 = ดีมาก">
            <ScaleInput name="moodLevel" defaultValue={existing?.moodLevel ?? 5} />
          </Section>

          {/* 3. Sleep */}
          <Section title="คุณภาพการนอนเมื่อคืน" subtitle="1 = แย่ · 10 = หลับสนิทดี">
            <ScaleInput name="sleepQuality" defaultValue={existing?.sleepQuality ?? 5} />
          </Section>

          {/* 4. Stress */}
          <Section title="ความเครียด" subtitle="1 = สบาย · 10 = เครียดมาก">
            <ScaleInput name="stressLevel" defaultValue={existing?.stressLevel ?? 5} />
          </Section>

          {/* 5. Nutrition notes */}
          <Section title="โภชนาการ" subtitle="มื้อสำคัญ / สิ่งที่กินวันนี้">
            <textarea
              name="nutritionNotes"
              defaultValue={existing?.nutritionNotes ?? ""}
              rows={2}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
              placeholder="เช้ากินข้าวต้ม · เที่ยงสลัด · เย็นปลานึ่ง"
            />
          </Section>

          {/* 6. Social */}
          <Section title="สังคม" subtitle="คุยกับใคร / กิจกรรมที่ร่วม">
            <textarea
              name="socialActivities"
              defaultValue={existing?.socialActivities ?? ""}
              rows={2}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
              placeholder="เช่น ดินเนอร์กับครอบครัว · เจอเพื่อนหลังเลิกงาน"
            />
          </Section>

          {/* 7. Substances */}
          <Section title="สารต่างๆ">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] text-ink-3">แอลกอฮอล์ (drinks)</span>
                <input
                  name="alcoholUnits"
                  type="number"
                  inputMode="decimal"
                  step="0.5"
                  min="0"
                  max="20"
                  defaultValue={existing?.alcoholUnits ?? 0}
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[15px] font-num"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-ink-3">กาแฟ (แก้ว)</span>
                <input
                  name="caffeineCount"
                  type="number"
                  inputMode="numeric"
                  step="1"
                  min="0"
                  max="20"
                  defaultValue={existing?.caffeineCount ?? 0}
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[15px] font-num"
                />
              </label>
            </div>
            <label className="mt-3 flex items-center gap-2">
              <input
                name="smokedToday"
                type="checkbox"
                defaultChecked={existing?.smokedToday ?? false}
                className="size-5 accent-ink"
              />
              <span className="text-[14px] text-ink-2">วันนี้สูบบุหรี่</span>
            </label>
          </Section>

          {/* 8. Free notes */}
          <Section title="บันทึกอื่นๆ" subtitle="ไม่บังคับ">
            <textarea
              name="notes"
              defaultValue={existing?.notes ?? ""}
              rows={3}
              className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
              placeholder="อยากเล่าให้ designer ฟัง..."
            />
          </Section>

          <div className="fixed left-0 right-0 bottom-0 bg-surface border-t border-border px-5 py-3 z-10">
            <div className="max-w-[420px] mx-auto">
              <button
                type="submit"
                className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
              >
                บันทึก check-in
              </button>
            </div>
          </div>
        </form>
      </div>
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
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {subtitle && <p className="text-[12px] text-ink-4 mt-0.5">{subtitle}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

