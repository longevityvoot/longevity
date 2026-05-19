import { PILLARS, COLOR_WHEEL_ORDER } from "@/lib/pillars";

type Props = {
  size?: number;
  /** Center monogram or short label. */
  centerLabel?: string;
};

// Six-petal flower. Petals are flat fills (no gradient) in matte
// primary+secondary colors arranged in color-wheel order starting at
// 12 o'clock and going clockwise: red, orange, yellow, green, blue,
// purple.
export function FlowerHero({ size = 220, centerLabel = "L" }: Props) {
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
      {/* Petals */}
      {orderedColors.map((color, i) => {
        const angle = (i / petalCount) * 360;
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
      <circle cx={cx} cy={cy} r={46} fill="#F6F7FB" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="44"
        fontWeight={900}
        fill="#14142B"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ letterSpacing: "-0.05em" }}
      >
        {centerLabel}
      </text>
      <text
        x={cx}
        y={cy + 22}
        textAnchor="middle"
        fontSize="8"
        fontWeight={700}
        fill="#5A5A7A"
        fontFamily="Inter, system-ui, sans-serif"
        style={{ letterSpacing: "0.18em" }}
      >
        LONGEVITY
      </text>
    </svg>
  );
}
