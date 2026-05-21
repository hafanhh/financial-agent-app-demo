// Iter3 — Tiny SVG sparkline. No external chart dep.

type Props = {
  values: readonly number[];
  width?: number;
  height?: number;
  stroke?: string;        // CSS var, e.g. "var(--color-gold)"
  fill?: string;          // soft area under the line
  ariaLabel?: string;
};

export function Sparkline({
  values,
  width = 96,
  height = 28,
  stroke = "var(--color-walnut)",
  fill = "var(--color-walnut)",
  ariaLabel,
}: Props) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const step = width / (values.length - 1);

  const points = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * height;
    return [x, y] as const;
  });

  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className="overflow-visible"
    >
      <path d={areaPath} fill={fill} fillOpacity={0.12} />
      <path d={linePath} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
