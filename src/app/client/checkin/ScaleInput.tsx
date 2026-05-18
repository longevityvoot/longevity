"use client";

import { useState } from "react";

export function ScaleInput({ name, defaultValue }: { name: string; defaultValue: number }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        name={name}
        min={1}
        max={10}
        step={1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="flex-1 accent-ink"
      />
      <output className="w-8 text-right text-[16px] font-num font-semibold text-ink">
        {value}
      </output>
    </div>
  );
}
