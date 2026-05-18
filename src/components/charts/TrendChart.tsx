type Point = { x: Date; y: number };

type Props = {
  data: Point[];
  width?: number;
  height?: number;
  color?: string;
  target?: number; // optional horizontal target line
  yPadding?: number; // padding above/below extremes
};

// Lightweight area-under-line SVG chart. No axes — designed for compact
// inline use on hero cards. Values are normalised against min/max of the
// visible window so small fluctuations stay readable.
export function TrendChart({
  data,
  width = 320,
  height = 120,
  color = "#14142B",
  target,
  yPadding = 0.5,
}: Props) {
  if (data.length === 0) {
    return (
      <div
        style={{ height }}
        className="w-full flex items-center justify-center text-[12px] text-ink-4"
      >
        ยังไม่มีข้อมูล
      </div>
    );
  }
  const xs = data.map((p) => p.x.getTime());
  const ys = data.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys) - yPadding;
  const yMax = Math.max(...ys) + yPadding;
  const xSpan = xMax - xMin || 1;
  const ySpan = yMax - yMin || 1;

  const padL = 6;
  const padR = 6;
  const padT = 6;
  const padB = 6;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;

  const px = (x: number) => padL + ((x - xMin) / xSpan) * innerW;
  const py = (y: number) => padT + (1 - (y - yMin) / ySpan) * innerH;

  const points = data.map((p) => ({ x: px(p.x.getTime()), y: py(p.y) }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const areaPath = `${path} L ${points[points.length - 1].x.toFixed(2)} ${padT + innerH} L ${points[0].x.toFixed(2)} ${padT + innerH} Z`;
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      width="100%"
      height={height}
      style={{ display: "block" }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {target != null && target >= yMin && target <= yMax ? (
        <line
          x1={padL}
          x2={width - padR}
          y1={py(target)}
          y2={py(target)}
          stroke="#C4C4D4"
          strokeDasharray="3 3"
          strokeWidth={1}
        />
      ) : null}
      <path d={areaPath} fill="url(#trend-area)" />
      <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r={4} fill={color} />
      <circle cx={last.x} cy={last.y} r={8} fill={color} opacity={0.18} />
    </svg>
  );
}
