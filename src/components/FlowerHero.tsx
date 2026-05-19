import { PILLARS, COLOR_WHEEL_ORDER } from "@/lib/pillars";

type Props = {
  size?: number;
};

// Six-petal flower. Petals are flat fills (no gradient) in matte
// primary+secondary colors arranged in color-wheel order starting at
// 12 o'clock and going clockwise: red, orange, yellow, green, blue,
// purple.
//
// Center disk carries the "Longevity" wordmark.
export function FlowerHero({ size = 220 }: Props) {
  const cx = 120;
  const cy = 120;
  const petalCount = COLOR_WHEEL_ORDER.length;

  const orderedColors = COLOR_WHEEL_ORDER.map((key) => {
    const p = PILLARS.find((p) => p.key === key);
    return p?.hex ?? "#5A5A7A";
  });

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Petals — rotated 30° so no petal sits at 12 or 6 o'clock */}
      {orderedColors.map((color, i) => {
        const angle = (i / petalCount) * 360 + 30;
        return (
          <g key={`${color}-${i}`} transform={`rotate(${angle} ${cx} ${cy})`}>
            <ellipse
              cx={cx}
              cy={cy - 58}
              rx={42}
              ry={56}
              fill={color}
            />
          </g>
        );
      })}

      {/* Center disk */}
      <circle cx={cx} cy={cy} r={50} fill="#F6F7FB" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight={800}
        fill="#14142B"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ letterSpacing: "0.08em" }}
      >
        LONGEVITY
      </text>
      <text
        x={cx}
        y={cy + 10}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight={500}
        fill="#5A5A7A"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ letterSpacing: "0em" }}
      >
        designer
      </text>
    </svg>
  );
}
