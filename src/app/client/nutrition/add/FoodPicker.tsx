"use client";

import { useMemo, useState } from "react";
import { THAI_FOODS, CATEGORY_LABEL, type FoodItem, type FoodCategory } from "@/lib/thai-foods";

const CATEGORIES: Array<{ key: FoodCategory | "all"; label: string }> = [
  { key: "all",     label: "ทั้งหมด" },
  { key: "rice",    label: CATEGORY_LABEL.rice },
  { key: "noodle",  label: CATEGORY_LABEL.noodle },
  { key: "soup",    label: CATEGORY_LABEL.soup },
  { key: "salad",   label: CATEGORY_LABEL.salad },
  { key: "meat",    label: CATEGORY_LABEL.meat },
  { key: "fruit",   label: CATEGORY_LABEL.fruit },
  { key: "drink",   label: CATEGORY_LABEL.drink },
  { key: "snack",   label: CATEGORY_LABEL.snack },
  { key: "dessert", label: CATEGORY_LABEL.dessert },
];

export function FoodPicker() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  const results = useMemo(() => {
    let pool = THAI_FOODS;
    if (category !== "all") pool = pool.filter((f) => f.category === category);
    const q = query.trim().toLowerCase();
    if (q) {
      pool = pool.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.keywords.some((k) => k.toLowerCase().includes(q)),
      );
    }
    return pool.slice(0, 40);
  }, [query, category]);

  const effectiveKcal = picked
    ? Math.round(picked.kcal * portion)
    : customKcal
    ? Number(customKcal) || 0
    : 0;
  const effectiveDesc = picked
    ? `${picked.name} (${picton(portion)} ${picked.unit})`
    : customName;

  return (
    <>
      {!picked ? (
        <section className="bg-surface border border-border rounded-lg p-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้น เช่น ข้าว, กะเพรา, กาแฟ"
            className="w-full h-11 rounded-md border border-border-strong px-3 text-[14px] focus:outline-none focus:border-ink"
          />
          <nav className="mt-3 -mx-4 px-4 flex gap-2 overflow-x-auto no-scrollbar">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`h-8 px-3 inline-flex items-center rounded-pill text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                  c.key === category
                    ? "bg-ink text-white"
                    : "bg-canvas text-ink-3 border border-border"
                }`}
              >
                {c.label}
              </button>
            ))}
          </nav>
          <ul className="mt-3 -mx-1 max-h-[280px] overflow-y-auto divide-y divide-border">
            {results.map((f) => (
              <li key={f.key}>
                <button
                  type="button"
                  onClick={() => setPicked(f)}
                  className="w-full text-left px-2 py-2 flex items-baseline justify-between gap-3 hover:bg-canvas rounded-md"
                >
                  <span className="text-[14px] text-ink-2 flex-1 min-w-0">
                    {f.name}
                    <span className="text-[11px] text-ink-4 ml-1">· {f.unit}</span>
                  </span>
                  <span className="text-[13px] font-num font-semibold text-ink">
                    {f.kcal}{" "}
                    <span className="text-[10px] text-ink-4">kcal</span>
                  </span>
                </button>
              </li>
            ))}
            {results.length === 0 ? (
              <li className="py-6 text-center text-[12px] text-ink-3">
                ไม่เจอ — พิมพ์เองด้านล่าง
              </li>
            ) : null}
          </ul>

          {/* Custom entry */}
          <div className="mt-4 pt-4 border-t border-border space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
              ไม่อยู่ในลิสต์? พิมพ์เอง
            </p>
            <input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="ชื่อมื้อ"
              className="w-full h-11 rounded-md border border-border-strong px-3 text-[14px] focus:outline-none focus:border-ink"
            />
            <div className="relative">
              <input
                value={customKcal}
                onChange={(e) => setCustomKcal(e.target.value)}
                type="number"
                inputMode="numeric"
                min="0"
                max="5000"
                placeholder="0"
                className="w-full h-11 rounded-md border border-border-strong pl-3 pr-12 text-[16px] font-num focus:outline-none focus:border-ink"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4">
                kcal
              </span>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-surface border border-border rounded-lg p-5">
          <button
            type="button"
            onClick={() => {
              setPicked(null);
              setPortion(1);
            }}
            className="text-[12px] text-ink-3"
          >
            ← เลือกใหม่
          </button>
          <p className="mt-2 text-[18px] font-semibold text-ink">{picked.name}</p>
          <p className="text-[12px] text-ink-3">ต่อ {picked.unit}</p>
          <div className="mt-4">
            <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
              จำนวน
            </p>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[0.5, 1, 1.5, 2, 3].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPortion(p)}
                  className={`h-10 rounded-md text-[13px] font-semibold font-num border ${
                    portion === p
                      ? "bg-ink text-white border-ink"
                      : "bg-canvas border-border text-ink-2"
                  }`}
                >
                  {picton(p)}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[36px] font-bold font-num tabular-nums text-ink leading-none">
              {Math.round(picked.kcal * portion)}
            </span>
            <span className="text-[13px] text-ink-4">kcal</span>
          </div>
        </section>
      )}

      <input type="hidden" name="description" value={effectiveDesc} />
      <input type="hidden" name="kcal" value={String(effectiveKcal)} />
      <input type="hidden" name="foodKey" value={picked?.key ?? ""} />
      <input type="hidden" name="portion" value={String(portion)} />

      <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
        <div className="max-w-[420px] mx-auto">
          <button
            type="submit"
            disabled={!effectiveDesc}
            className={`w-full h-12 rounded-md font-semibold text-[15px] ${
              effectiveDesc
                ? "bg-pillar-activity text-white"
                : "bg-canvas border border-border text-ink-4"
            }`}
            style={
              effectiveDesc
                ? { boxShadow: "0 4px 12px rgba(255, 107, 107, 0.25)" }
                : undefined
            }
          >
            บันทึก {effectiveKcal} kcal
          </button>
        </div>
      </div>
    </>
  );
}

function picton(p: number): string {
  if (p === 0.5) return "½";
  if (p === 1) return "1";
  if (p === 1.5) return "1½";
  if (Number.isInteger(p)) return String(p);
  return String(p);
}
