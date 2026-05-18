import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PILLARS, type PillarKey } from "@/lib/pillars";
import { scoreFromCheckIn, type PillarScores } from "@/lib/scoring";
import { DonutScore } from "@/components/charts/DonutScore";
import { TrendChart } from "@/components/charts/TrendChart";

const PILLAR_DESCRIPTIONS: Record<PillarKey, { intro: string; drivers: string[] }> = {
  nutrition: {
    intro: "อาหารและ supplement ที่กิน ส่งผลต่อพลังงาน, น้ำหนัก, lab ในระยะยาว",
    drivers: ["บันทึก nutrition notes ใน check-in", "supplements / medications", "lab biomarkers ที่เกี่ยวข้อง (lipids, vitamins)"],
  },
  sleep: {
    intro: "การนอนคือ recovery — กระทบทุก pillar อื่น",
    drivers: ["Subjective sleep quality (1-10)", "Sleep duration จาก wearable (Phase 6)", "HRV ตอนนอน (Phase 6)"],
  },
  activity: {
    intro: "การออกกำลังกาย + การเคลื่อนไหวรวม สำคัญต่ออายุยืน",
    drivers: ["Energy proxy จาก check-in", "Steps + Zone 2 minutes (Phase 6)", "VO2 Max (Phase 6)"],
  },
  stress: {
    intro: "ความเครียดสะสมระยะยาวเป็น marker ของหลายปัญหา",
    drivers: ["Subjective stress (1-10)", "HRV trend (Phase 6)", "Stress score จาก wearable (Phase 6)"],
  },
  social: {
    intro: "การมีปฏิสัมพันธ์ทางสังคมที่มีความหมาย",
    drivers: ["บันทึก social activities ใน check-in"],
  },
  substances: {
    intro: "แอลกอฮอล์ · caffeine · บุหรี่ — มี baseline ที่ designer แนะนำ",
    drivers: ["จำนวน drinks", "จำนวนแก้วกาแฟ", "สูบบุหรี่ yes/no"],
  },
};

export default async function PillarDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { key } = await params;
  const pillar = PILLARS.find((p) => p.key === key);
  if (!pillar) notFound();

  // Pull last 30 days of check-ins, compute per-day score for this pillar.
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const checkIns = await prisma.dailyCheckIn.findMany({
    where: { userId: session.user.id, date: { gte: since } },
    orderBy: { date: "asc" },
  });

  type Point = { x: Date; y: number };
  const points: Point[] = checkIns
    .map((ci) => {
      const scores = scoreFromCheckIn(ci);
      if (!scores) return null;
      return { x: ci.date, y: scores[pillar.key as PillarKey] };
    })
    .filter((p): p is Point => p !== null);

  const latest: number | null = points.length
    ? points[points.length - 1].y
    : null;
  const prev: number | null = points.length > 1
    ? points[points.length - 2].y
    : null;
  const delta = latest != null && prev != null ? latest - prev : null;
  const avg30 = points.length
    ? Math.round(points.reduce((s, p) => s + p.y, 0) / points.length)
    : null;
  const meta = PILLAR_DESCRIPTIONS[pillar.key as PillarKey];

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ dashboard
        </Link>

        <header className="mt-3">
          <p
            className="text-[11px] uppercase tracking-wider font-semibold"
            style={{ color: pillar.hex }}
          >
            {pillar.label}
          </p>
          <h1 className="text-[24px] font-semibold tracking-tight text-ink mt-0.5">
            รายละเอียด
          </h1>
        </header>

        <section className="mt-5 bg-surface rounded-xl p-5 border border-border flex items-center gap-5">
          <DonutScore
            value={latest}
            size={120}
            thickness={9}
            segments={18}
            gapDeg={3}
            color={pillar.hex}
          />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold">
              คะแนนล่าสุด
            </p>
            <p
              className="text-[36px] font-bold font-num leading-none mt-1"
              style={{ color: pillar.hex }}
            >
              {latest ?? "—"}
            </p>
            {delta != null ? (
              <p
                className={`text-[12px] font-semibold mt-1 ${
                  delta > 0 ? "text-pillar-social" : delta < 0 ? "text-pillar-activity" : "text-ink-3"
                }`}
              >
                {delta > 0 ? "↑ " : delta < 0 ? "↓ " : ""}
                {Math.abs(delta)} จากเมื่อวาน
              </p>
            ) : null}
            {avg30 != null ? (
              <p className="text-[11px] text-ink-4 mt-0.5">
                เฉลี่ย 30 วัน: <span className="font-num font-semibold">{avg30}</span>
              </p>
            ) : null}
          </div>
        </section>

        <section className="mt-5 bg-surface rounded-lg p-4 border border-border">
          <h2 className="text-[13px] font-semibold text-ink-2">Trend 30 วันล่าสุด</h2>
          <div className="mt-3 -mx-1">
            <TrendChart
              data={points}
              width={360}
              height={140}
              color={pillar.hex}
              target={70}
              yPadding={5}
            />
          </div>
          <p className="text-[10px] text-ink-4 mt-2">
            เส้นประ = เป้าหมาย 70 · จุดล่าสุดเป็นค่าวันนี้
          </p>
        </section>

        <section className="mt-3 bg-surface rounded-lg p-4 border border-border">
          <h2 className="text-[13px] font-semibold text-ink-2">เกี่ยวกับ pillar นี้</h2>
          <p className="text-[13px] text-ink-3 mt-2">{meta.intro}</p>
          <div className="mt-3">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-semibold mb-2">
              สิ่งที่ส่งผลต่อคะแนน
            </p>
            <ul className="space-y-1.5">
              {meta.drivers.map((d, i) => (
                <li key={i} className="text-[13px] text-ink-2 flex gap-2">
                  <span
                    className="inline-block size-1.5 mt-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: pillar.hex }}
                  />
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-3 bg-surface rounded-lg p-4 border border-border">
          <h2 className="text-[13px] font-semibold text-ink-2">ข้อความจาก designer</h2>
          <p className="text-[13px] text-ink-3 mt-2">
            ยังไม่มี note เฉพาะ pillar นี้ — designer จะใส่หลัง review check-in
          </p>
        </section>
      </div>
    </main>
  );
}
