type Props = {
  value: number;
  low: number | null;
  high: number | null;
  flag: "low" | "normal" | "high" | "critical";
  width?: number;
  height?: number;
};

// Horizontal range bar: dim track + green band for the reference range,
// dot at the measured value. Handles open-ended ranges ("≥ X" → no upper).
export function RangeBar({
  value,
  low,
  high,
  flag,
  width = 200,
  height = 28,
}: Props) {
  // Build a viewport that comfortably contains the band + the dot
  const lo = low ?? value;
  const hi = high != null && high < 999 ? high : Math.max(value, lo) * 1.3;
  const min = Math.min(lo, value) * 0.85;
  const max = Math.max(hi, value) * 1.1;
  const span = max - min || 1;
  const xOf = (v: number) => ((v - min) / span) * width;

  const hasLow = low != null && low > 0;
  const hasHigh = high != null && high < 999;
  const bandX1 = hasLow ? xOf(low) : 0;
  const bandX2 = hasHigh ? xOf(high) : width;
  const bandW = Math.max(2, bandX2 - bandX1);

  const dotX = Math.max(4, Math.min(width - 4, xOf(value)));
  const cy = height / 2;
  const trackY = cy - 3;
  const tickY1 = trackY - 4;
  const tickY2 = trackY + 10;

  const dotFill =
    flag === "critical"
      ? "#FF4D4F"
      : flag === "high" || flag === "low"
      ? "#FFA940"
      : "#52C41A";

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
      <rect x={0} y={trackY} width={width} height={6} fill="#ECECF2" rx={3} />
      <rect x={bandX1} y={trackY} width={bandW} height={6} fill="#E5F7D9" rx={3} />
      {hasLow ? (
        <line
          x1={bandX1}
          y1={tickY1}
          x2={bandX1}
          y2={tickY2}
          stroke="#5A5A7A"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ) : null}
      {hasHigh ? (
        <line
          x1={bandX2}
          y1={tickY1}
          x2={bandX2}
          y2={tickY2}
          stroke="#5A5A7A"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      ) : null}
      <circle cx={dotX} cy={cy} r={6} fill={dotFill} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}
