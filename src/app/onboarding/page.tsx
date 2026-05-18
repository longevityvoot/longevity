import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { submitOnboarding } from "./actions";

const INTEREST_TAGS = [
  { key: "energy",   label: "เพิ่มพลังงาน" },
  { key: "sleep",    label: "นอนหลับดี" },
  { key: "fitness",  label: "ฟิตเนสกล้ามเนื้อ" },
  { key: "weight",   label: "น้ำหนักลด" },
  { key: "stress",   label: "ลดความเครียด" },
  { key: "longevity", label: "ชะลอความเสื่อม" },
  { key: "nutrition", label: "โภชนาการ" },
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
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-8">
        <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
          ยินดีต้อนรับ
        </p>
        <h1 className="text-[26px] font-semibold tracking-tight text-ink leading-tight mt-1">
          มาเริ่มดูแลสุขภาพ
          <br />
          กันเลย
        </h1>
        <p className="text-[13px] text-ink-3 mt-2">
          ใช้เวลาประมาณ 2 นาที — designer จะเห็นข้อมูลที่กรอก
        </p>

        <form action={submitOnboarding} className="mt-6 space-y-5">
          <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-[14px] font-semibold text-ink">ข้อมูลพื้นฐาน</h2>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">วันเกิด</span>
              <input
                name="dateOfBirth"
                type="date"
                required
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
              />
            </label>
            <fieldset>
              <legend className="text-[12px] text-ink-3 font-semibold">เพศ</legend>
              <div className="mt-1.5 flex gap-2">
                {[
                  { v: "male", label: "ชาย" },
                  { v: "female", label: "หญิง" },
                  { v: "other", label: "อื่นๆ" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="inline-flex items-center px-4 h-10 rounded-pill border border-border-strong text-[13px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
                  >
                    <input type="radio" name="gender" value={o.v} required className="sr-only" />
                    {o.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] text-ink-3 font-semibold">ส่วนสูง (cm)</span>
                <input
                  name="heightCm"
                  type="number"
                  step="0.5"
                  min="100"
                  max="220"
                  required
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-ink-3 font-semibold">น้ำหนัก (kg)</span>
                <input
                  name="weightKg"
                  type="number"
                  step="0.1"
                  min="30"
                  max="200"
                  required
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center"
                />
              </label>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-[14px] font-semibold text-ink">ประวัติสุขภาพ</h2>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">โรคประจำตัว / ยาที่กิน</span>
              <textarea
                name="medicalHistory"
                rows={3}
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
                placeholder="เช่น เบาหวานชนิด 2, allopurinol 100mg เช้า"
              />
            </label>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">แพ้อะไร</span>
              <input
                name="allergies"
                className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
                placeholder="เช่น penicillin, กุ้ง"
              />
            </label>
          </section>

          <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-[14px] font-semibold text-ink">เป้าหมาย</h2>
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">เหตุผลที่อยากดูแลตัวเอง</span>
              <textarea
                name="longevityGoal"
                rows={3}
                required
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
                placeholder="เล่าให้ designer ฟัง..."
              />
            </label>
            <fieldset>
              <legend className="text-[12px] text-ink-3 font-semibold">หัวข้อที่สนใจ (เลือกได้หลายข้อ)</legend>
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
          </section>

          <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <h2 className="text-[14px] font-semibold text-ink">Wearable</h2>
            <fieldset>
              <legend className="text-[12px] text-ink-3 font-semibold">ใช้อะไรอยู่</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEARABLES.map((w) => (
                  <label
                    key={w.key}
                    className="inline-flex items-center px-3 h-9 rounded-pill border border-border-strong text-[12px] cursor-pointer has-[:checked]:bg-ink has-[:checked]:text-white has-[:checked]:border-ink"
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
            <p className="text-[11px] text-ink-4">
              เชื่อม Google Health API ทีหลังได้ในหน้า settings
            </p>
          </section>

          <button
            type="submit"
            className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
          >
            เสร็จ — เริ่มใช้งาน
          </button>
        </form>
      </div>
    </main>
  );
}
