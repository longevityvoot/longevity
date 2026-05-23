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
    month: "short",
  });

  // Count filled vs total — gives the "X/5" header progress feel
  const totalFields = 5;
  let filled = 0;
  if (existing?.energyLevel != null) filled++;
  if (existing?.moodLevel != null) filled++;
  if (existing?.sleepQuality != null) filled++;
  if (existing?.stressLevel != null) filled++;
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
            <p className="text-[11px] text-ink-3 leading-tight">{dateLabel}</p>
            <p className="text-[15px] font-semibold text-ink leading-tight">
              ประเมินวันนี้
            </p>
            <p className="text-[10px] text-ink-4 leading-tight mt-0.5">
              ทำก่อนนอน — สรุปทั้งวัน
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

      <form action={saveCheckIn} className="max-w-[420px] mx-auto px-5 pt-5 space-y-4">
        <ScaleSection
          name="energyLevel"
          title="พลังงานวันนี้"
          question="ในระดับ 1-10 รู้สึกเท่าไหร่?"
          defaultValue={existing?.energyLevel ?? null}
          lowLabel="หมดแรง"
          highLabel="สดชื่นมาก"
          tone="activity"
        />
        <ScaleSection
          name="moodLevel"
          title="อารมณ์"
          question="โดยรวมวันนี้รู้สึกยังไง?"
          defaultValue={existing?.moodLevel ?? null}
          lowLabel="แย่"
          highLabel="ดีมาก"
          tone="stress"
        />
        <ScaleSection
          name="sleepQuality"
          title="การนอน"
          question="คุณภาพการนอนเมื่อคืน?"
          defaultValue={existing?.sleepQuality ?? null}
          lowLabel="แย่"
          highLabel="หลับสนิทดี"
          tone="sleep"
        />
        <ScaleSection
          name="stressLevel"
          title="ความเครียด"
          question="ตึงเครียดวันนี้แค่ไหน?"
          defaultValue={existing?.stressLevel ?? null}
          lowLabel="สบาย"
          highLabel="เครียดมาก"
          tone="stress"
        />

        <section className="bg-pillar-social-wash border border-pillar-social/30 rounded-lg p-3.5">
          <p className="text-[11px] uppercase tracking-wider text-pillar-social font-bold">
            พฤติกรรมสะสม
          </p>
          <p className="text-[12.5px] text-ink-2 mt-1 leading-snug">
            แอลกอฮอล์ · เครื่องดื่มน้ำตาลสูง · บุหรี่ · สังคม — บันทึกในหน้า{" "}
            <Link href="/client/weekly" className="font-semibold text-pillar-social underline">
              สรุปสัปดาห์
            </Link>{" "}
            ทุกอาทิตย์ (อาทิตย์ละครั้ง)
          </p>
        </section>

        <TextSection
          name="notes"
          title="บันทึกอื่นๆ"
          question="ไม่บังคับ · Longeneer จะอ่าน"
          defaultValue={existing?.notes ?? ""}
          placeholder="อยากเล่าให้ Longeneer ฟัง..."
          rows={3}
        />

        <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
          <div className="max-w-[420px] mx-auto">
            <button
              type="submit"
              className="w-full h-12 rounded-md bg-pillar-stress text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 12px rgba(211, 132, 66, 0.30)" }}
            >
              <CheckIcon />
              <span>บันทึกประเมิน</span>
            </button>
            <p className="mt-1.5 text-[10px] text-ink-4 text-center">
              แก้ไขทีหลังได้ · Longeneer เห็นข้อมูลของคุณ
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

type SectionTone = "activity" | "stress" | "sleep" | "social" | "nutrition" | "substances" | undefined;

const TONE_BG: Record<NonNullable<SectionTone>, { bg: string; title: string }> = {
  activity:   { bg: "bg-pillar-activity-wash border-pillar-activity/30",     title: "text-pillar-activity" },
  stress:     { bg: "bg-pillar-stress-wash border-pillar-stress/30",         title: "text-pillar-stress" },
  sleep:      { bg: "bg-pillar-sleep-wash border-pillar-sleep/30",           title: "text-pillar-sleep" },
  social:     { bg: "bg-pillar-social-wash border-pillar-social/30",         title: "text-pillar-social" },
  nutrition:  { bg: "bg-pillar-nutrition-wash border-pillar-nutrition/30",   title: "text-pillar-nutrition" },
  substances: { bg: "bg-pillar-substances-wash border-pillar-substances/30", title: "text-pillar-substances" },
};

function ScaleSection({
  name,
  title,
  question,
  defaultValue,
  lowLabel,
  highLabel,
  tone,
}: {
  name: string;
  title: string;
  question: string;
  defaultValue: number | null;
  lowLabel: string;
  highLabel: string;
  tone?: SectionTone;
}) {
  return (
    <Section title={title} question={question} tone={tone}>
      <ScaleInput
        name={name}
        defaultValue={defaultValue}
        lowLabel={lowLabel}
        highLabel={highLabel}
      />
    </Section>
  );
}

function TextSection({
  name,
  title,
  question,
  defaultValue,
  placeholder,
  rows = 2,
  tone,
}: {
  name: string;
  title: string;
  question: string;
  defaultValue: string;
  placeholder: string;
  rows?: number;
  tone?: SectionTone;
}) {
  return (
    <Section title={title} question={question} tone={tone}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink bg-white/70"
      />
    </Section>
  );
}

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

function CheckIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

