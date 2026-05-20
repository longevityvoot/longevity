"use client";

import { useState } from "react";

// Muscle mass input with a kg / % unit toggle. Smart scales report
// either way — some give absolute kg, others give percentage of body
// weight. Stored as-entered with unit preserved on the BodyMeasurement
// row so the user can see whichever they originally typed.
export function MuscleMassInput() {
  const [unit, setUnit] = useState<"kg" | "%">("kg");
  const [value, setValue] = useState("");
  const max = unit === "%" ? 70 : 120;
  const min = unit === "%" ? 10 : 10;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-ink-3">มวลกล้ามเนื้อ</span>
        <UnitToggle unit={unit} onChange={setUnit} />
      </div>
      <div className="relative mt-1">
        <input
          type="number"
          inputMode="decimal"
          step={0.1}
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder=""
          className="w-full h-11 rounded-md border border-border-strong pl-3 pr-10 text-[16px] font-num focus:outline-none focus:border-ink"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-ink-4 pointer-events-none">
          {unit}
        </span>
      </div>
      <input type="hidden" name="muscleMassValue" value={value} />
      <input type="hidden" name="muscleMassUnit" value={unit} />
    </label>
  );
}

function UnitToggle({
  unit,
  onChange,
}: {
  unit: "kg" | "%";
  onChange: (u: "kg" | "%") => void;
}) {
  return (
    <div className="inline-flex items-center bg-canvas border border-border rounded-pill p-0.5 gap-0.5">
      {(["kg", "%"] as const).map((u) => (
        <button
          key={u}
          type="button"
          onClick={() => onChange(u)}
          className={`text-[10px] font-semibold h-5 px-2 rounded-pill ${
            unit === u ? "bg-pillar-activity text-white" : "text-ink-3"
          }`}
        >
          {u}
        </button>
      ))}
    </div>
  );
}
