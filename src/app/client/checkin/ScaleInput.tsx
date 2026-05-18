"use client";

import { useState } from "react";

export function ScaleInput({
  name,
  defaultValue,
  lowLabel,
  highLabel,
  onChange,
}: {
  name: string;
  defaultValue: number | null;
  lowLabel?: string;
  highLabel?: string;
  onChange?: () => void;
}) {
  const [value, setValue] = useState<number | null>(defaultValue);
  return (
    <div>
      <div className="grid grid-cols-10 gap-1.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const active = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => {
                setValue(n);
                onChange?.();
              }}
              className={`h-11 rounded-md text-[13px] font-num font-semibold transition-colors ${
                active
                  ? "bg-ink text-white"
                  : "bg-canvas text-ink-3 hover:bg-surface-soft"
              }`}
              aria-pressed={active}
              aria-label={`${name} ${n}`}
            >
              {n}
            </button>
          );
        })}
      </div>
      {(lowLabel || highLabel) ? (
        <div className="mt-2 flex justify-between text-[10px] text-ink-4">
          <span>{lowLabel ?? "1"}</span>
          <span>{highLabel ?? "10"}</span>
        </div>
      ) : null}
      <input type="hidden" name={name} value={value ?? ""} />
    </div>
  );
}
