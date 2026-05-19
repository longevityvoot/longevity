import { PILLARS } from "@/lib/pillars";

type Props = {
  size?: number;
  /** Center monogram or short label. */
  centerLabel?: string;
};

// Murakami-inspired six-petal flower. Each petal carries one pillar color
// + a tiny pillar label, arranged tightly around an ink-circle wordmark.
//
// Petals are teardrop ellipses positioned above center then rotated in 60°
// steps. A subtle ink stroke keeps the cartoon feel without being heavy.
export function FlowerHero({ size = 220, centerLabel = "L" }: Props) {
  const cx = 120;
  const cy = 120;
  const petalCount = 6;

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ display: "block" }}
    >
      <defs>
        {PILLARS.map((p) => (
          <radialGradient
            key={p.key}
            id={`flower-${p.key}`}
            cx="50%"
            cy="35%"
            r="65%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="60%" stopColor={p.hex} stopOpacity="1" />
            <stop offset="100%" stopColor={p.hex} stopOpacity="1" />
          </radialGradient>
        ))}
      </defs>

      {/* Petals */}
      {PILLARS.map((p, i) => {
        const angle = (i / petalCount) * 360;
        return (
          <g key={p.key} transform={`rotate(${angle} ${cx} ${cy})`}>
            <ellipse
              cx={cx}
              cy={cy - 58}
              rx={42}
              ry={56}
              fill={`url(#flower-${p.key})`}
              stroke="#14142B"
              strokeOpacity="0.08"
              strokeWidth={1.5}
            />
          </g>
        );
      })}

      {/* Center disk */}
      <circle
        cx={cx}
        cy={cy}
        r={46}
        fill="#FFFFFF"
        stroke="#14142B"
        strokeOpacity="0.08"
        strokeWidth={1.5}
      />
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
