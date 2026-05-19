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
  const [extra, setExtra] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");

  // "พิเศษ" bumps the picked portion by 15%. Doesn't apply to custom entry
  // (the user is typing kcal directly there).
  const extraMultiplier = extra ? 1.15 : 1;

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
    ? Math.round(picked.kcal * portion * extraMultiplier)
    : customKcal
    ? Number(customKcal) || 0
    : 0;
  const effectiveDesc = picked
    ? `${picked.name}${extra ? " (พิเศษ)" : ""} · ${picton(portion)} ${picked.unit}`
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
              ขนาดที่กิน
            </p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {[0.25, 0.5, 0.75, 1].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPortion(p)}
                  className={`h-14 rounded-md text-[13px] font-semibold border flex flex-col items-center justify-center gap-1 ${
                    portion === p
                      ? "bg-ink text-white border-ink"
                      : "bg-canvas border-border text-ink-2"
                  }`}
                >
                  <PlateIcon fill={p} active={portion === p} />
                  <span className="text-[11px] font-num">{plateLabel(p)}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-4">
              กิน 2 จาน? บันทึก 2 ครั้ง
            </p>
            <button
              type="button"
              onClick={() => setExtra(!extra)}
              className={`mt-3 w-full h-10 rounded-md text-[13px] font-semibold border inline-flex items-center justify-center gap-2 ${
                extra
                  ? "bg-ink text-white border-ink"
                  : "bg-canvas border-border-strong text-ink-2"
              }`}
            >
              {extra ? "✓" : "+"} พิเศษ <span className="text-[11px] opacity-80">(+15%)</span>
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[36px] font-bold font-num tabular-nums text-ink leading-none">
              {Math.round(picked.kcal * portion * extraMultiplier)}
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
  if (p === 0.25) return "¼";
  if (p === 0.5) return "½";
  if (p === 0.75) return "¾";
  if (p === 1) return "1";
  if (p === 1.5) return "1½";
  if (Number.isInteger(p)) return String(p);
  return String(p);
}

function plateLabel(p: number): string {
  if (p === 0.25) return "¼ จาน";
  if (p === 0.5) return "½ จาน";
  if (p === 0.75) return "¾ จาน";
  if (p === 1) return "เต็มจาน";
  return `${p} จาน`;
}

// SVG plate filled clockwise per fraction. Active state inverts colors so
// the selected option reads against the ink background.
function PlateIcon({ fill, active }: { fill: number; active: boolean }) {
  const cx = 12;
  const cy = 12;
  const r = 8;
  const ring = active ? "#FFFFFF" : "#5A5A7A";
  const accent = active ? "#FFFFFF" : "#14142B";
  // Path arc from 12 o'clock clockwise by `fill * 360`.
  const angle = fill * 360 - 0.0001; // avoid full-circle == zero arc
  const large = angle > 180 ? 1 : 0;
  const rad = (a: number) => ((a - 90) * Math.PI) / 180;
  const x = cx + r * Math.cos(rad(angle));
  const y = cy + r * Math.sin(rad(angle));
  const d =
    fill >= 0.999
      ? `M ${cx - r} ${cy} a ${r} ${r} 0 1 1 ${r * 2} 0 a ${r} ${r} 0 1 1 ${-r * 2} 0`
      : `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${x.toFixed(2)} ${y.toFixed(2)} Z`;
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ring} strokeWidth={1.5} />
      <path d={d} fill={accent} opacity={fill >= 0.999 ? 1 : 0.85} />
    </svg>
  );
}
