import { describeArc } from "./donut-math";

export type Ring = {
  value: number | null;
  color: string;
  key: string;
};

type Props = {
  rings: Ring[];
  size?: number;
  segments?: number;
  gapDeg?: number;
  thickness?: number;
  ringGap?: number;
  trackColor?: string;
  /** Big center label (e.g. overall score). */
  centerValue?: string;
  /** Small label under center value. */
  centerLabel?: string;
};

// Concentric Garmin-style rings, one per pillar. Outer ring = first item.
export function MultiDonut({
  rings,
  size = 220,
  segments = 18,
  gapDeg = 3,
  thickness = 9,
  ringGap = 4,
  trackColor = "#ECECF2",
  centerValue,
  centerLabel,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const segDeg = (360 - segments * gapDeg) / segments;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {rings.map((ring, ringIdx) => {
        const r = size / 2 - thickness / 2 - ringIdx * (thickness + ringGap);
        if (r <= thickness) return null;
        const filled = ring.value == null ? 0 : Math.round((ring.value / 100) * segments);
        return (
          <g key={ring.key}>
            {Array.from({ length: segments }).map((_, i) => {
              const start = i * (segDeg + gapDeg);
              const end = start + segDeg;
              const isFilled = i < filled;
              return (
                <path
                  key={i}
                  d={describeArc(cx, cy, r, start, end)}
                  stroke={isFilled ? ring.color : trackColor}
                  strokeWidth={thickness}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </g>
        );
      })}
      {centerValue ? (
        <text
          x={cx}
          y={cy - (centerLabel ? size * 0.03 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={size * 0.22}
          fontWeight={700}
          fill="#14142B"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {centerValue}
        </text>
      ) : null}
      {centerLabel ? (
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          fontSize={size * 0.07}
          fill="#5A5A7A"
          fontWeight={500}
        >
          {centerLabel}
        </text>
      ) : null}
    </svg>
  );
}
