import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { submitOnboarding } from "./actions";

const INTEREST_TAGS = [
  { key: "energy",     label: "เพิ่มพลังงาน" },
  { key: "sleep",      label: "นอนหลับดี" },
  { key: "fitness",    label: "ฟิตเนสกล้ามเนื้อ" },
  { key: "weight",     label: "น้ำหนัก" },
  { key: "stress",     label: "ลดความเครียด" },
  { key: "longevity",  label: "ชะลอความเสื่อม" },
  { key: "nutrition",  label: "โภชนาการ" },
  { key: "metabolism", label: "เผาผลาญ" },
];

const WEARABLES = [
  { key: "garmin",  label: "Garmin" },
  { key: "fitbit",  label: "Fitbit" },
  { key: "apple",   label: "Apple Watch" },
  { key: "samsung", label: "Samsung" },
  { key: "other",   label: "อื่นๆ" },
  { key: "none",    label: "ไม่มี" },
];

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const existing = await prisma.clientProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) redirect("/client");

  return (
    <main className="min-h-screen bg-canvas pb-16">
      <header className="sticky top-0 z-20 bg-canvas/90 backdrop-blur border-b border-border">
        <div className="max-w-[420px] mx-auto px-5 py-3">
          <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
            Onboarding
          </p>
          <p className="text-[14px] font-semibold text-ink mt-0.5">
            ตั้งค่าโปรไฟล์ครั้งเดียว
          </p>
        </div>
      </header>

      <div className="max-w-[420px] mx-auto px-5 pt-5">
        <h1 className="text-[26px] font-semibold tracking-tight text-ink leading-tight">
          ยินดีต้อนรับ
          <br />
          <span className="text-ink-3 text-[18px] font-medium">
            มาเริ่มดูแลสุขภาพกันเลย
          </span>
        </h1>
        <p className="text-[13px] text-ink-3 mt-2">
          ใช้เวลาประมาณ 2 นาที — designer จะใช้ข้อมูลนี้ปรับโปรแกรมให้คุณ
        </p>

        <form action={submitOnboarding} className="mt-6 space-y-4">
          <Section title="ข้อมูลพื้นฐาน" stepLabel="01">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">วันเกิด</span>
              <input
                name="dateOfBirth"
                type="date"
                required
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num focus:outline-none focus:border-ink"
              />
            </label>
            <fieldset className="mt-3">
              <legend className="text-[12px] text-ink-3 font-semibold">เพศ</legend>
              <div className="mt-1.5 flex gap-2">
                {[
                  { v: "male", label: "ชาย" },
                  { v: "female", label: "หญิง" },
                  { v: "other", label: "อื่นๆ" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="inline-flex flex-1 items-center justify-center px-3 h-11 rounded-md border border-border-strong text-[13.5px] font-semibold cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={o.v}
                      required
                      className="sr-only"
                    />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <NumberField name="heightCm" label="ส่วนสูง" unit="cm" step="0.5" min={100} max={220} />
              <NumberField name="weightKg" label="น้ำหนัก" unit="kg" step="0.1" min={30} max={200} />
            </div>
          </Section>

          <Section title="ประวัติสุขภาพ" stepLabel="02" optional>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">
                โรคประจำตัว / ยาที่กิน
              </span>
              <textarea
                name="medicalHistory"
                rows={3}
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
                placeholder="เช่น เบาหวานชนิด 2 · allopurinol 100mg เช้า"
              />
            </label>
            <label className="block mt-3">
              <span className="text-[12px] text-ink-3 font-semibold">แพ้อะไร</span>
              <input
                name="allergies"
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] focus:outline-none focus:border-ink"
                placeholder="เช่น penicillin, กุ้ง"
              />
            </label>
          </Section>

          <Section title="เป้าหมาย" stepLabel="03">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">
                เหตุผลที่อยากดูแลตัวเอง
              </span>
              <textarea
                name="longevityGoal"
                rows={3}
                required
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none focus:outline-none focus:border-ink"
                placeholder="เล่าให้ designer ฟัง..."
              />
            </label>
            <fieldset className="mt-3">
              <legend className="text-[12px] text-ink-3 font-semibold">
                หัวข้อที่สนใจ <span className="text-ink-4 font-normal">เลือกได้หลายข้อ</span>
              </legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {INTEREST_TAGS.map((t) => (
                  <label
                    key={t.key}
                    className="inline-flex items-center px-3 h-9 rounded-pill border border-border-strong text-[12px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
                  >
                    <input
                      type="checkbox"
                      name="interestTags"
                      value={t.key}
                      className="sr-only"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section title="Wearable" stepLabel="04" optional>
            <fieldset>
              <legend className="text-[12px] text-ink-3 font-semibold">ใช้อะไรอยู่</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {WEARABLES.map((w) => (
                  <label
                    key={w.key}
                    className="inline-flex items-center justify-center px-3 h-10 rounded-md border border-border-strong text-[12px] font-semibold cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
                  >
                    <input
                      type="radio"
                      name="wearableType"
                      value={w.key}
                      defaultChecked={w.key === "none"}
                      className="sr-only"
                    />
                    {w.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-[11px] text-ink-4 mt-3">
              เชื่อม Google Health API ทีหลังได้ในหน้า settings
            </p>
          </Section>

          <button
            type="submit"
            className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
            style={{ boxShadow: "0 4px 12px rgba(255, 107, 107, 0.25)" }}
          >
            เสร็จ — เริ่มใช้งาน
          </button>
          <p className="text-[10px] text-ink-4 text-center">
            แก้ไขโปรไฟล์ภายหลังได้ที่หน้า "โปรไฟล์"
          </p>
        </form>
      </div>
    </main>
  );
}

function Section({
  title,
  stepLabel,
  optional,
  children,
}: {
  title: string;
  stepLabel: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-surface rounded-lg p-4 border border-border">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-ink-4 tracking-wider">
          {stepLabel}
        </span>
        <h2 className="text-[14px] font-semibold text-ink flex-1">{title}</h2>
        {optional ? (
          <span className="text-[10px] text-ink-4 italic">optional</span>
        ) : null}
      </div>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function NumberField({
  name,
  label,
  unit,
  step,
  min,
  max,
}: {
  name: string;
  label: string;
  unit: string;
  step: string;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="text-[12px] text-ink-3 font-semibold">{label}</span>
      <div className="mt-1 relative">
        <input
          name={name}
          type="number"
          step={step}
          min={min}
          max={max}
          required
          className="w-full h-11 rounded-md border border-border-strong pl-3 pr-10 text-[16px] font-num focus:outline-none focus:border-ink"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">
          {unit}
        </span>
      </div>
    </label>
  );
}
