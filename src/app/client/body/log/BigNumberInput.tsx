"use client";

import { useState } from "react";

type Props = {
  name: string;
  unit: string;
  step: number;
  min: number;
  max: number;
  presets?: number[];
};

// Hero number input — single big field with quick-pick chip row below
// ("ค่าใกล้เคียง" pattern from artboard 15). Presets become tappable
// chips that fill the input.
export function BigNumberInput({ name, unit, step, min, max, presets }: Props) {
  const [value, setValue] = useState("");
  return (
    <>
      <div className="text-center">
        <input
          name={name}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          max={max}
          required
          autoFocus
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0"
          className="w-full h-20 rounded-md bg-transparent text-[56px] font-num font-bold text-center text-ink focus:outline-none placeholder:text-ink-5"
        />
        <p className="text-[13px] text-ink-3 font-medium mt-0.5">{unit}</p>
      </div>
      {presets && presets.length > 0 ? (
        <div className="mt-4">
          <p className="text-[10px] uppercase tracking-wider text-ink-4 font-bold text-center">
            ค่าใกล้เคียง
          </p>
          <div className="mt-2 flex justify-center gap-1.5 flex-wrap">
            {presets.map((p) => {
              const active = value === String(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setValue(String(p))}
                  className={`h-9 px-3 rounded-pill text-[13px] font-num font-semibold border ${
                    active
                      ? "bg-ink text-white border-ink"
                      : "bg-surface text-ink-2 border-border-strong"
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </>
  );
}
