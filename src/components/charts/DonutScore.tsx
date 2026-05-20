import { describeArc, polarToCartesian } from "./donut-math";

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
  /** Optional reference tick on the ring at a given 0-100 position.
   *  `zoneTrackColor` re-colors the UNFILLED track past the mark — used
   *  to highlight a "target zone" (e.g. BMR → TDEE band) so the user
   *  sees the goal area even when the ring isn't filled yet. */
  mark?: { value: number; color?: string; label?: string; zoneTrackColor?: string };
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
  mark,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const segDeg = (360 - segments * gapDeg) / segments;
  const filled = value == null ? 0 : Math.round((value / 100) * segments);
  const text = display ?? (value == null ? "—" : String(value));
  const markAngle =
    mark != null ? (Math.max(0, Math.min(100, mark.value)) / 100) * 360 : null;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {Array.from({ length: segments }).map((_, i) => {
        const start = i * (segDeg + gapDeg);
        const end = start + segDeg;
        const isFilled = i < filled;
        // Past the mark? Tint the UNFILLED track to indicate target zone.
        const past =
          markAngle != null && mark?.zoneTrackColor != null && start + segDeg / 2 >= markAngle;
        const fillColor = isFilled
          ? color
          : past
            ? (mark!.zoneTrackColor as string)
            : trackColor;
        return (
          <path
            key={i}
            d={describeArc(cx, cy, r, start, end)}
            stroke={fillColor}
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
      {mark && markAngle != null && mark.color
        ? (() => {
            const tickColor = mark.color;
            const tickOuter = polarToCartesian(cx, cy, r + thickness / 2 + 5, markAngle);
            const tickInner = polarToCartesian(cx, cy, r - thickness / 2 - 1, markAngle);
            const labelPos = polarToCartesian(cx, cy, r + thickness / 2 + 14, markAngle);
            return (
              <g>
                <line
                  x1={tickInner.x}
                  y1={tickInner.y}
                  x2={tickOuter.x}
                  y2={tickOuter.y}
                  stroke={tickColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {mark.label ? (
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={size * 0.06}
                    fontWeight={700}
                    fill={tickColor}
                  >
                    {mark.label}
                  </text>
                ) : null}
              </g>
            );
          })()
        : null}
    </svg>
  );
}
