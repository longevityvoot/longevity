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
  { key: "snack",      label: CATEGORY_LABEL.snack },
  { key: "dessert",    label: CATEGORY_LABEL.dessert },
  { key: "supplement", label: CATEGORY_LABEL.supplement },
];

type Rating = -2 | -1 | 0 | 1 | 2 | null;

const QUALITY_AXES: Array<{
  key: "proteinRating" | "vegRating" | "carbRating" | "fatRating";
  label: string;
  hint: string;
}> = [
  { key: "proteinRating", label: "เนื้อสัตว์ / โปรตีน", hint: "เนื้อ ปลา ไข่ ถั่ว เต้าหู้" },
  { key: "vegRating",     label: "ผัก / ใยอาหาร",       hint: "รวมวิตามินและแร่ธาตุ" },
  { key: "carbRating",    label: "ข้าว / แป้ง",          hint: "ข้าว ก๋วยเตี๋ยว ขนมปัง" },
  { key: "fatRating",     label: "ไขมัน",                hint: "ของทอด กะทิ น้ำมัน" },
];

const RATING_STEPS: Array<{ v: -2 | -1 | 0 | 1 | 2; label: string; cls: string }> = [
  { v: -2, label: "ขาดมาก",  cls: "bg-pillar-activity text-white border-pillar-activity" },
  { v: -1, label: "ขาดนิด",  cls: "bg-pillar-stress-wash text-pillar-stress border-pillar-stress/50" },
  { v:  0, label: "พอดี",    cls: "bg-pillar-social text-white border-pillar-social" },
  { v:  1, label: "เกินนิด", cls: "bg-pillar-stress-wash text-pillar-stress border-pillar-stress/50" },
  { v:  2, label: "เกินมาก", cls: "bg-pillar-activity text-white border-pillar-activity" },
];

export function FoodPicker() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<FoodCategory | "all">("all");
  const [picked, setPicked] = useState<FoodItem | null>(null);
  const [portion, setPortion] = useState(1);
  const [extra, setExtra] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customKcal, setCustomKcal] = useState("");
  const [ratings, setRatings] = useState<Record<string, Rating>>({
    proteinRating: null,
    vegRating: null,
    carbRating: null,
    fatRating: null,
  });

  // "พิเศษ" bumps the picked portion by 15%. Doesn't apply to custom entry
  // (the user is typing kcal directly there).
  const extraMultiplier = extra ? 1.15 : 1;

  const results = useMemo(() => {
    let pool = THAI_FOODS;
    if (category !== "all") pool = pool.filter((f) => f.category === category);
    // Normalize: lower-case + strip spaces — so "บอดี้ คีย์" matches "บอดี้คีย์"
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, "");
    const q = norm(query);
    if (q) {
      pool = pool.filter(
        (f) =>
          norm(f.name).includes(q) ||
          f.keywords.some((k) => norm(k).includes(q)),
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
    ? `${picked.name}${extra ? " (พิเศษ)" : ""} · ${composePortion(picked.unit, portion)}`
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
                    ? "bg-pillar-nutrition text-white"
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
              {[0.5, 0.75, 1, 2].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPortion(p)}
                  className={`h-14 rounded-md text-[13px] font-semibold border flex flex-col items-center justify-center gap-1 ${
                    portion === p
                      ? "bg-pillar-nutrition text-white border-pillar-nutrition"
                      : "bg-canvas border-border text-ink-2"
                  }`}
                >
                  <PlateIcon fill={p} active={portion === p} />
                  <span className="text-[11px] font-num">{plateLabel(p)}</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[10px] text-ink-4">
              กิน &gt; 2 จาน? บันทึกแยกครั้งเพิ่ม
            </p>
            <button
              type="button"
              onClick={() => setExtra(!extra)}
              className={`mt-3 w-full h-10 rounded-md text-[13px] font-semibold border inline-flex items-center justify-center gap-2 ${
                extra
                  ? "bg-pillar-nutrition text-white border-pillar-nutrition"
                  : "bg-canvas border-border-strong text-ink-2"
              }`}
            >
              {extra ? "✓" : "+"} พิเศษ <span className="text-[11px] opacity-80">(+15%)</span>
            </button>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-[36px] font-bold font-num tabular-nums text-pillar-nutrition leading-none">
              {Math.round(picked.kcal * portion * extraMultiplier)}
            </span>
            <span className="text-[13px] text-pillar-nutrition/70">kcal</span>
          </div>
        </section>
      )}

      {/* Quality bell-curve self-rating — applies once user has named a meal */}
      {effectiveDesc ? (
        <section className="bg-surface border border-border rounded-lg p-4">
          <p className="text-[11px] uppercase tracking-wider text-ink-4 font-bold">
            คุณภาพมื้อนี้ <span className="normal-case font-normal italic">(optional)</span>
          </p>
          <p className="mt-1 text-[11px] text-ink-4">
            ประเมินคร่าว ๆ จากที่กิน — ใช้คำนวณ pillar score
          </p>
          <div className="mt-3 space-y-3">
            {QUALITY_AXES.map((axis) => (
              <div key={axis.key}>
                <div className="flex items-baseline justify-between">
                  <p className="text-[12.5px] font-semibold text-ink-2">{axis.label}</p>
                  <p className="text-[10px] text-ink-4">{axis.hint}</p>
                </div>
                <div className="mt-1.5 grid grid-cols-5 gap-1">
                  {RATING_STEPS.map((step) => {
                    const selected = ratings[axis.key] === step.v;
                    return (
                      <button
                        key={step.v}
                        type="button"
                        onClick={() =>
                          setRatings((r) => ({
                            ...r,
                            [axis.key]: r[axis.key] === step.v ? null : step.v,
                          }))
                        }
                        className={`h-9 rounded-md text-[10.5px] font-semibold border transition-colors ${
                          selected ? step.cls : "bg-canvas border-border text-ink-3"
                        }`}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <input type="hidden" name="description" value={effectiveDesc} />
      <input type="hidden" name="kcal" value={String(effectiveKcal)} />
      <input type="hidden" name="foodKey" value={picked?.key ?? ""} />
      <input type="hidden" name="portion" value={String(portion)} />
      {QUALITY_AXES.map((axis) => (
        <input
          key={axis.key}
          type="hidden"
          name={axis.key}
          value={ratings[axis.key] != null ? String(ratings[axis.key]) : ""}
        />
      ))}

      <div className="fixed left-0 right-0 bottom-0 bg-surface/95 backdrop-blur border-t border-border px-5 py-3 z-10 pb-safe">
        <div className="max-w-[420px] mx-auto">
          <button
            type="submit"
            disabled={!effectiveDesc}
            className={`w-full h-12 rounded-md font-semibold text-[15px] ${
              effectiveDesc
                ? "bg-pillar-nutrition text-white"
                : "bg-canvas border border-border text-ink-4"
            }`}
            style={
              effectiveDesc
                ? { boxShadow: "0 4px 12px rgba(201, 168, 72, 0.30)" }
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

// Compose "{count} {unit-noun}" from a library entry's `unit` field and
// the user-chosen portion. Most library entries already store a leading
// count ("1 ทัพพี", "2 ฟอง"); we multiply that by the portion and render
// once, so portion=1 of "1 ทัพพี" reads "1 ทัพพี" instead of "1 1 ทัพพี".
function composePortion(rawUnit: string, portion: number): string {
  const m = rawUnit.match(/^(\d+(?:\.\d+)?)\s+(.+)$/);
  if (!m) return `${picton(portion)} ${rawUnit}`;
  const baseCount = Number(m[1]);
  const rest = m[2];
  const effective = +(baseCount * portion).toFixed(2);
  return `${picton(effective)} ${rest}`;
}

function picton(p: number): string {
  if (Number.isInteger(p)) return String(p);
  // Mixed numbers: split whole + nice fractional part if it lines up.
  const whole = Math.floor(p);
  const frac = +(p - whole).toFixed(2);
  const fracMap: Record<string, string> = {
    "0.25": "¼",
    "0.5":  "½",
    "0.75": "¾",
  };
  const fracStr = fracMap[String(frac)];
  if (fracStr) return whole === 0 ? fracStr : `${whole}${fracStr}`;
  return p.toFixed(2).replace(/\.?0+$/, "");
}

function plateLabel(p: number): string {
  if (p === 0.5) return "½ จาน";
  if (p === 0.75) return "¾ จาน";
  if (p === 1) return "เต็มจาน";
  if (p === 2) return "2 จาน";
  return `${p} จาน`;
}

// SVG plate filled clockwise per fraction. Active state inverts colors so
// the selected option reads against the ink background.
function PlateIcon({ fill, active }: { fill: number; active: boolean }) {
  // For p > 1, show two stacked plates (offset slightly) to convey
  // "multiple plates". Single plate uses the same arc math as before.
  const ring = active ? "#FFFFFF" : "#C9A848";
  const accent = active ? "#FFFFFF" : "#C9A848";
  if (fill > 1) {
    // 2-plate stack: a smaller back plate offset up-left + a full front plate.
    return (
      <svg width={26} height={22} viewBox="0 0 28 24" aria-hidden="true">
        <circle cx={10} cy={9}  r={7} fill={accent} fillOpacity={0.4} stroke={ring} strokeWidth={1.5} />
        <circle cx={16} cy={13} r={7} fill={accent} stroke={ring} strokeWidth={1.5} />
      </svg>
    );
  }
  const cx = 12;
  const cy = 12;
  const r = 8;
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
