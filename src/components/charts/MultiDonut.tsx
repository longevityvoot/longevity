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
  /** Color of the centerValue text. Defaults to ink. */
  centerColor?: string;
};

// Concentric Garmin-style rings, one per pillar. Outer ring = first item.
//
// Center text auto-sizes against the inner hole so multi-ring stacks
// (6+ rings) don't punch the label through the innermost arc.
export function MultiDonut({
  rings,
  size = 220,
  segments = 18,
  gapDeg = 3,
  thickness = 6,
  ringGap = 3,
  trackColor = "#ECECF2",
  centerValue,
  centerLabel,
  centerColor = "#14142B",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const segDeg = (360 - segments * gapDeg) / segments;

  // Inner hole radius (where center text lives) = outer radius minus
  // every ring's thickness and the gaps between them. Use the count of
  // rendered rings, not the constant `6`.
  const ringCount = rings.length;
  const holeRadius =
    size / 2 - ringCount * thickness - Math.max(0, ringCount - 1) * ringGap;
  // Fit "67" + label inside 1.6 * holeRadius diameter with margin.
  const valueFont = Math.max(14, Math.min(size * 0.28, holeRadius * 0.95));
  const labelFont = Math.max(9, Math.min(size * 0.07, holeRadius * 0.28));

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
          y={cy - (centerLabel ? labelFont * 0.6 : 0)}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={valueFont}
          fontWeight={700}
          fill={centerColor}
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {centerValue}
        </text>
      ) : null}
      {centerLabel ? (
        <text
          x={cx}
          y={cy + valueFont * 0.55}
          textAnchor="middle"
          fontSize={labelFont}
          fill="#5A5A7A"
          fontWeight={500}
        >
          {centerLabel}
        </text>
      ) : null}
    </svg>
  );
}
