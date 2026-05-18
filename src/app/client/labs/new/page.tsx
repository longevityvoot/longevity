import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LAB_RANGES, LAB_TEMPLATES, CATEGORY_LABEL } from "@/lib/lab-ranges";
import { submitDraftPanel } from "./actions";

type SearchParams = Promise<{ tmpl?: string }>;

export default async function NewLabPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { tmpl = "lipid" } = await searchParams;
  const active = LAB_TEMPLATES.find((t) => t.key === tmpl) ?? LAB_TEMPLATES[0];
  const tests = active.tests.map((k) => LAB_RANGES[k]).filter(Boolean);

  return (
    <main className="min-h-screen bg-canvas pb-12">
      <div className="max-w-[420px] mx-auto px-5 pt-6">
        <Link href="/client/labs" className="text-[13px] text-ink-3 inline-flex items-center gap-1">
          ← กลับ
        </Link>
        <h1 className="mt-3 text-[22px] font-semibold tracking-tight text-ink">
          เพิ่มผลตรวจ
        </h1>
        <p className="text-[12px] text-ink-3 mt-1">
          กรอกค่าจากใบผลตรวจ — designer จะ review ก่อน publish
        </p>

        <nav className="mt-4 flex flex-wrap gap-2">
          {LAB_TEMPLATES.map((t) => (
            <Link
              key={t.key}
              href={`/client/labs/new?tmpl=${t.key}`}
              className={`h-9 px-3 inline-flex items-center rounded-pill text-[12px] font-semibold ${
                t.key === active.key
                  ? "bg-ink text-white"
                  : "bg-surface border border-border text-ink-2"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <form
          action={submitDraftPanel.bind(null, active.key)}
          className="mt-5 space-y-4"
        >
          <section className="bg-surface border border-border rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-[12px] text-ink-3 font-semibold">วันที่ตรวจ</span>
                <input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px] font-num"
                />
              </label>
              <label className="block">
                <span className="text-[12px] text-ink-3 font-semibold">แล็บ</span>
                <input
                  name="labName"
                  className="mt-1 w-full h-11 rounded-md border border-border-strong px-3 text-[14px]"
                  placeholder="เช่น Bumrungrad"
                />
              </label>
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-4">
            <h2 className="text-[13px] font-semibold text-ink-2">
              {active.label}
            </h2>
            <p className="text-[11px] text-ink-4 mt-0.5">
              {CATEGORY_LABEL[tests[0]?.category] ?? ""}
            </p>
            <div className="mt-3 space-y-3">
              {tests.map((spec) => (
                <label key={spec.key} className="block">
                  <span className="flex items-baseline justify-between">
                    <span className="text-[13px] text-ink-2 font-medium">
                      {spec.name}
                    </span>
                    <span className="text-[11px] text-ink-4">
                      ค่าปกติ {spec.low > 0 ? spec.low : "—"}
                      {"-"}
                      {spec.high < 999 ? spec.high : "—"} {spec.unit}
                    </span>
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      name={`value:${spec.key}`}
                      type="number"
                      step="0.01"
                      inputMode="decimal"
                      className="flex-1 h-11 rounded-md border border-border-strong px-3 text-[16px] font-num text-center"
                      placeholder="—"
                    />
                    <span className="text-[12px] text-ink-4 w-14">{spec.unit}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="bg-surface border border-border rounded-lg p-4">
            <label className="block">
              <span className="text-[12px] text-ink-3 font-semibold">หมายเหตุ (optional)</span>
              <textarea
                name="note"
                rows={2}
                className="mt-1 w-full rounded-md border border-border-strong px-3 py-2 text-[14px] resize-none"
                placeholder="เช่น ตรวจหลังกินอาหารเช้า"
              />
            </label>
          </section>

          <button
            type="submit"
            className="w-full h-12 rounded-md bg-pillar-activity text-white font-semibold text-[15px]"
          >
            ส่งให้ designer review
          </button>
          <p className="text-[11px] text-ink-4 text-center">
            ค่าที่กรอกจะถูกส่งเป็น draft — designer จะ verify + publish ให้
          </p>
        </form>
      </div>
    </main>
  );
}
