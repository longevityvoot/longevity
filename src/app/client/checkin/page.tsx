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

  // Count filled vs total — gives the "X/7" header progress feel
  const totalFields = 7;
  let filled = 0;
  if (existing?.energyLevel != null) filled++;
  if (existing?.moodLevel != null) filled++;
  if (existing?.sleepQuality != null) filled++;
  if (existing?.stressLevel != null) filled++;
  if (existing?.socialKind || existing?.socialActivities) filled++;
  if (
    (existing?.alcoholUnits ?? 0) > 0 ||
    (existing?.caffeineCount ?? 0) > 0 ||
    (existing?.sugaryDrinkCount ?? 0) > 0 ||
    existing?.smokedToday
  )
    filled++;
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
        />
        <ScaleSection
          name="moodLevel"
          title="อารมณ์"
          question="โดยรวมวันนี้รู้สึกยังไง?"
          defaultValue={existing?.moodLevel ?? null}
          lowLabel="แย่"
          highLabel="ดีมาก"
        />
        <ScaleSection
          name="sleepQuality"
          title="การนอน"
          question="คุณภาพการนอนเมื่อคืน?"
          defaultValue={existing?.sleepQuality ?? null}
          lowLabel="แย่"
          highLabel="หลับสนิทดี"
        />
        <ScaleSection
          name="stressLevel"
          title="ความเครียด"
          question="ตึงเครียดวันนี้แค่ไหน?"
          defaultValue={existing?.stressLevel ?? null}
          lowLabel="สบาย"
          highLabel="เครียดมาก"
        />

        <Section title="สังคม" question="วันนี้ปฏิสัมพันธ์กับคนแบบไหน?">
          <SocialKindPicker defaultValue={existing?.socialKind ?? null} />
          <textarea
            name="socialActivities"
            defaultValue={existing?.socialActivities ?? ""}
            rows={2}
            placeholder="รายละเอียดเพิ่ม (optional) — เช่น ดินเนอร์กับครอบครัว"
            className="mt-3 w-full rounded-md border border-border-strong px-3 py-2 text-[13px] resize-none focus:outline-none focus:border-ink"
          />
        </Section>

        <Section title="สารต่างๆ" question="แอลกอฮอล์ · เครื่องดื่มน้ำตาลสูง · บุหรี่">
          <div className="grid grid-cols-3 gap-3">
            <NumField name="alcoholUnits" label="drinks" defaultValue={existing?.alcoholUnits ?? 0} step="0.5" min="0" max="20" />
            <NumField name="sugaryDrinkCount" label="น้ำตาลสูง" defaultValue={existing?.sugaryDrinkCount ?? 0} step="1" min="0" max="20" />
            <NumField name="caffeineCount" label="กาแฟดำ" defaultValue={existing?.caffeineCount ?? 0} step="1" min="0" max="20" />
          </div>
          <p className="mt-2 text-[10.5px] text-ink-4 leading-snug">
            <span className="font-semibold text-ink-3">น้ำตาลสูง</span> = น้ำอัดลม · น้ำหวาน · น้ำผลไม้ · ชานมไข่มุก · กาแฟใส่น้ำตาล/นม
            <br />
            <span className="font-semibold text-ink-3">กาแฟดำ</span> ไม่ใส่น้ำตาล/นม — ไม่ลดคะแนน (info-only)
          </p>
          <label className="mt-3 flex items-center gap-2.5 cursor-pointer">
            <input
              name="smokedToday"
              type="checkbox"
              defaultChecked={existing?.smokedToday ?? false}
              className="size-5 accent-ink"
            />
            <span className="text-[14px] text-ink-2">วันนี้สูบบุหรี่ / พ่นไอ / เคี้ยวยาเส้น</span>
          </label>
        </Section>

        <TextSection
          name="notes"
          title="บันทึกอื่นๆ"
          question="ไม่บังคับ · designer จะอ่าน"
          defaultValue={existing?.notes ?? ""}
          placeholder="อยากเล่าให้ designer ฟัง..."
          rows={3}
        />

        <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
          <div className="max-w-[420px] mx-auto">
            <button
              type="submit"
              className="w-full h-12 rounded-md bg-ink text-white font-semibold text-[15px] inline-flex items-center justify-center gap-2"
              style={{ boxShadow: "0 4px 12px rgba(20, 20, 43, 0.18)" }}
            >
              <CheckIcon />
              <span>บันทึกประเมิน</span>
            </button>
            <p className="mt-1.5 text-[10px] text-ink-4 text-center">
              แก้ไขทีหลังได้ · designer เห็นข้อมูลของคุณ
            </p>
          </div>
        </div>
      </form>
    </main>
  );
}

function ScaleSection({
  name,
  title,
  question,
  defaultValue,
  lowLabel,
  highLabel,
}: {
  name: string;
  title: string;
  question: string;
  defaultValue: number | null;
  lowLabel: string;
  highLabel: string;
}) {
  return (
    <Section title={title} question={question}>
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
}: {
  name: string;
  title: string;
  question: string;
  defaultValue: string;
  placeholder: string;
  rows?: number;
}) {
  return (
    <Section title={title} question={question}>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        placeholder={placeholder}
        className="w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
      />
    </Section>
  );
}

function Section({
  title,
  question,
  children,
}: {
  title: string;
  question?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface rounded-xl p-5 border border-border">
      <div className="mb-3">
        <h2 className="text-[16px] font-semibold text-ink leading-tight">{title}</h2>
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
  label,
  defaultValue,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  defaultValue: number;
  step: string;
  min: string;
  max: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] text-ink-3 font-semibold">{label}</span>
      <input
        name={name}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        defaultValue={defaultValue}
        className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center focus:outline-none focus:border-ink"
      />
    </label>
  );
}

function CheckIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

// Single-choice social engagement picker — ordered low to high mortality
// benefit per Holt-Lunstad 2010 + Harvard 75-year study.
function SocialKindPicker({ defaultValue }: { defaultValue: string | null }) {
  const options: Array<{ v: string; label: string; hint: string }> = [
    { v: "none",      label: "ไม่มี",        hint: "ไม่ได้คุยกับใคร" },
    { v: "text",      label: "ข้อความ",      hint: "chat / social media" },
    { v: "call",      label: "โทร/วิดีโอ",   hint: "ได้ยินเสียง" },
    { v: "in-person", label: "พบตัว",        hint: "1-2 คน" },
    { v: "group",     label: "กิจกรรมกลุ่ม", hint: "ครอบครัว / community" },
  ];
  return (
    <div className="grid grid-cols-5 gap-1.5">
      {options.map((o) => (
        <label
          key={o.v}
          className="cursor-pointer rounded-md border border-border bg-canvas px-1.5 py-2 text-center has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
          title={o.hint}
        >
          <input
            type="radio"
            name="socialKind"
            value={o.v}
            defaultChecked={defaultValue === o.v}
            className="sr-only"
          />
          <span className="block text-[11px] font-semibold leading-tight">{o.label}</span>
          <span className="block text-[9px] opacity-70 mt-0.5 leading-tight">{o.hint}</span>
        </label>
      ))}
    </div>
  );
}
