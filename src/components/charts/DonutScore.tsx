import { describeArc } from "./donut-math";

type Props = {
  /** 0-100 */
  value: number | null;
  size?: number;
  thickness?: number;
  segments?: number;
  gapDeg?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  /** Override the big center number (e.g. "—" when empty). */
  display?: string;
  /** Color of the big center number. Defaults to ink. */
  textColor?: string;
};

// Garmin-style segmented arc donut. N rounded segments with a fixed angular
// gap between them. `value/100 * segments` rounds to determine how many are
// filled.
export function DonutScore({
  value,
  size = 160,
  thickness = 14,
  segments = 18,
  gapDeg = 3,
  color = "#14142B",
  trackColor = "#ECECF2",
  label,
  display,
  textColor = "#14142B",
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const segDeg = (360 - segments * gapDeg) / segments;
  const filled = value == null ? 0 : Math.round((value / 100) * segments);
  const text = display ?? (value == null ? "—" : String(value));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {Array.from({ length: segments }).map((_, i) => {
        const start = i * (segDeg + gapDeg);
        const end = start + segDeg;
        const isFilled = i < filled;
        return (
          <path
            key={i}
            d={describeArc(cx, cy, r, start, end)}
            stroke={isFilled ? color : trackColor}
            strokeWidth={thickness}
            strokeLinecap="round"
            fill="none"
          />
        );
      })}
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size * 0.3}
        fontWeight={700}
        fill={textColor}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {text}
      </text>
      {label ? (
        <text
          x={cx}
          y={cy + size * 0.22}
          textAnchor="middle"
          fontSize={size * 0.08}
          fill="#5A5A7A"
          fontWeight={500}
        >
          {label}
        </text>
      ) : null}
    </svg>
  );
}
