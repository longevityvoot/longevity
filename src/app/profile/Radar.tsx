"use client";

import { QUESTIONS, type DimScore } from "./questions";

const DIMS = ["D1", "D2", "D3", "D4", "D5", "D6"] as const;

export function Radar({ scores, size = 320 }: { scores: Record<string, DimScore>; size?: number }) {
  const cx = size / 2, cy = size / 2;
  const rMax = size * 0.30;
  const labelR = size * 0.48;

  const angleAt = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / DIMS.length;
  const pt = (i: number, val: number): [number, number] => {
    const r = ((val - 1) / 4) * rMax;
    const a = angleAt(i);
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  };

  const rings = [1, 2, 3, 4, 5].map((level) =>
    DIMS.map((_, i) => {
      const r = ((level - 1) / 4) * rMax;
      const a = angleAt(i);
      return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
    }).join(" "),
  );

  const poly = DIMS.map((d, i) => {
    const v = scores[d]?.value ?? 3;
    const [x, y] = pt(i, v);
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: "block", maxWidth: size, margin: "0 auto", overflow: "visible" }}>
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill={i === 4 ? "var(--paper)" : "none"} stroke="var(--rule)" strokeWidth="1" />
      ))}
      {DIMS.map((d, i) => {
        const [x, y] = pt(i, 5);
        return <line key={d} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--rule)" strokeWidth="1" />;
      })}
      <polygon points={poly} fill="var(--accent)" fillOpacity="0.18" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      {DIMS.map((d, i) => {
        const v = scores[d]?.value ?? 3;
        const [x, y] = pt(i, v);
        return <circle key={d} cx={x} cy={y} r="3.5" fill="var(--accent)" />;
      })}
      {DIMS.map((d, i) => {
        const a = angleAt(i);
        const x = cx + Math.cos(a) * labelR;
        const y = cy + Math.sin(a) * labelR;
        const sc = scores[d];
        const anchor = Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
        const dy = Math.sin(a) > 0.3 ? "1.2em" : Math.sin(a) < -0.3 ? "-0.4em" : "0.35em";
        return (
          <g key={`label-${d}`}>
            <text x={x} y={y} textAnchor={anchor} dy={dy} fill="var(--ink)" style={{ fontSize: 12, fontWeight: 600 }}>
              {sc?.thLabel ?? sc?.label ?? "—"}
            </text>
            <text x={x} y={y} textAnchor={anchor} dy={`calc(${dy} + 1.3em)`} fill="var(--ink-faint)" style={{ fontSize: 9, fontFamily: "IBM Plex Mono, monospace" }}>
              {sc?.value?.toFixed(1) ?? "—"} / 5.0
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function PoleStrip({ dim, scoreObj }: { dim: string; scoreObj: DimScore }) {
  const def = QUESTIONS.dimensions[dim as keyof typeof QUESTIONS.dimensions];
  const v = scoreObj?.value ?? 3;
  const pct = Math.max(3, Math.min(97, ((v - 1) / 4) * 100));
  return (
    <div style={{ padding: "14px 0", borderTop: "1px solid var(--rule)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 11, color: "var(--ink-faint)", fontFamily: "IBM Plex Mono, monospace", letterSpacing: "0.04em" }}>
        <span>{dim}</span>
        <span>{v.toFixed(1)} / 5.0</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 4 }}>
        <div style={{ textAlign: "left" as const }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{def.thLow}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{def.low}</div>
        </div>
        <div style={{ textAlign: "right" as const }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{def.thHigh}</div>
          <div className="mono" style={{ fontSize: 10, color: "var(--ink-faint)" }}>{def.high}</div>
        </div>
      </div>
      <div style={{ position: "relative", marginTop: 10, height: 8 }}>
        <div style={{ position: "absolute", inset: "3px 0", background: "var(--rule)", borderRadius: 999 }} />
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "var(--rule-strong)" }} />
        <div style={{ position: "absolute", left: `calc(${pct}% - 7px)`, top: -1, width: 14, height: 14, borderRadius: "50%", background: "var(--accent)", boxShadow: "0 0 0 3px var(--bg)" }} />
      </div>
    </div>
  );
}
