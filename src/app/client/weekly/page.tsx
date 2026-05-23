import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { todayLocalDate, mondayOf } from "@/lib/dates";
import { saveWeeklyReflection } from "./actions";
import { SocialKindPicker } from "@/components/SocialKindPicker";

export default async function WeeklyReflectionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const today = todayLocalDate();
  const weekStart = mondayOf(today);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);

  const existing = await prisma.weeklyReflection.findUnique({
    where: { userId_weekStart: { userId: session.user.id, weekStart } },
  });

  const weekLabel = `${weekStart.toLocaleDateString("th-TH", { day: "numeric", month: "short" })} – ${weekEnd.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}`;

  const totalFields = 5;
  let filled = 0;
  if ((existing?.alcoholUnits ?? 0) > 0) filled++;
  if ((existing?.sugaryDrinkCount ?? 0) > 0) filled++;
  if ((existing?.smokeDays ?? 0) > 0) filled++;
  if (existing?.socialKind) filled++;
  if (existing?.notes) filled++;

  return (
    <main className="min-h-screen bg-canvas pb-32">
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
            <p className="text-[11px] text-ink-3 leading-tight">{weekLabel}</p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              สรุปสัปดาห์
            </p>
            <p className="text-[10px] text-ink-4 leading-tight mt-0.5">
              บันทึกพฤติกรรมสะสมของสัปดาห์ — ทำอาทิตย์ละครั้ง
            </p>
          </div>
          <span
            className={`text-[11px] font-num font-bold px-2.5 py-1 rounded-pill ${
              existing
                ? "bg-pillar-social-wash text-pillar-social"
                : "bg-canvas text-ink-3 border border-border"
            }`}
          >
            {filled}/{totalFields}
          </span>
        </div>
      </header>

      <form
        action={saveWeeklyReflection}
        className="max-w-[420px] mx-auto px-5 pt-5 space-y-4"
      >
        <Section title="สังคม" question="สัปดาห์นี้พบปะคนแบบไหนดีที่สุด?" tone="social">
          <SocialKindPicker defaultValue={existing?.socialKind ?? null} />
          <p className="mt-2 text-[10.5px] text-ink-3 leading-snug">
            คะแนน = best engagement ของสัปดาห์ (family dinner วันอาทิตย์เดียวก็พอ)
          </p>
        </Section>

        <Section title="แอลกอฮอล์" question="กี่ drinks ทั้งสัปดาห์?" tone="activity">
          <NumField
            name="alcoholUnits"
            unit="drinks/สัปดาห์"
            defaultValue={existing?.alcoholUnits ?? 0}
            step="0.5"
            min="0"
            max="60"
          />
          <p className="mt-2 text-[10.5px] text-ink-3 leading-snug">
            CDC moderate: ≤14/สัปดาห์ (ชาย) · ≤7 (หญิง)
          </p>
        </Section>

        <Section title="เครื่องดื่มน้ำตาลสูง" question="กี่แก้วทั้งสัปดาห์?" tone="nutrition">
          <NumField
            name="sugaryDrinkCount"
            unit="แก้ว/สัปดาห์"
            defaultValue={existing?.sugaryDrinkCount ?? 0}
            step="1"
            min="0"
            max="60"
          />
          <p className="mt-2 text-[10.5px] text-ink-3 leading-snug">
            น้ำอัดลม · น้ำหวาน · น้ำผลไม้ · ชานมไข่มุก · กาแฟใส่น้ำตาล/นม
          </p>
        </Section>

        <Section title="บุหรี่ / บุหรี่ไฟฟ้า / ยาเส้น" question="กี่วันในสัปดาห์?" tone="substances">
          <NumField
            name="smokeDays"
            unit="วัน/สัปดาห์"
            defaultValue={existing?.smokeDays ?? 0}
            step="1"
            min="0"
            max="7"
          />
        </Section>

        <Section
          title="บันทึก / เป้าหมายสัปดาห์หน้า"
          question="optional · Longeneer อ่าน"
        >
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            rows={3}
            placeholder="ทบทวนสัปดาห์ · ตั้งเป้าสัปดาห์ใหม่..."
            className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
          />
        </Section>

        <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
          <div className="max-w-[420px] mx-auto">
            <button
              type="submit"
              className="w-full h-12 rounded-md bg-pillar-substances text-white font-semibold text-[15px]"
              style={{ boxShadow: "0 4px 12px rgba(125, 92, 149, 0.30)" }}
            >
              บันทึกสรุปสัปดาห์
            </button>
            <p className="mt-1.5 text-[10px] text-ink-4 text-center">
              แก้ไขทีหลังในสัปดาห์เดียวกันได้
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

type SectionTone = "activity" | "stress" | "sleep" | "social" | "nutrition" | "substances";

const TONE_BG: Record<SectionTone, { bg: string; title: string }> = {
  activity:   { bg: "bg-pillar-activity-wash border-pillar-activity/30",     title: "text-pillar-activity" },
  stress:     { bg: "bg-pillar-stress-wash border-pillar-stress/30",         title: "text-pillar-stress" },
  sleep:      { bg: "bg-pillar-sleep-wash border-pillar-sleep/30",           title: "text-pillar-sleep" },
  social:     { bg: "bg-pillar-social-wash border-pillar-social/30",         title: "text-pillar-social" },
  nutrition:  { bg: "bg-pillar-nutrition-wash border-pillar-nutrition/30",   title: "text-pillar-nutrition" },
  substances: { bg: "bg-pillar-substances-wash border-pillar-substances/30", title: "text-pillar-substances" },
};

function Section({
  title,
  question,
  children,
  tone,
}: {
  title: string;
  question?: string;
  children: React.ReactNode;
  tone?: SectionTone;
}) {
  const cls = tone ? TONE_BG[tone] : null;
  return (
    <section
      className={`rounded-xl p-5 border ${
        cls ? cls.bg : "bg-surface border-border"
      }`}
    >
      <div className="mb-3">
        <h2
          className={`text-[16px] font-semibold leading-tight ${
            cls ? cls.title : "text-ink"
          }`}
        >
          {title}
        </h2>
        {question ? (
          <p className="text-[12px] text-ink-3 mt-0.5">{question}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function NumField({
  name,
  unit,
  defaultValue,
  step,
  min,
  max,
}: {
  name: string;
  unit: string;
  defaultValue: number;
  step: string;
  min: string;
  max: string;
}) {
  return (
    <label className="block">
      <div className="relative">
        <input
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          defaultValue={defaultValue}
          className="w-full h-12 rounded-md border border-border-strong pl-3 pr-28 text-[18px] font-num focus:outline-none focus:border-ink"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">
          {unit}
        </span>
      </div>
    </label>
  );
}
