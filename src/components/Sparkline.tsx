export function Sparkline({
  points,
  width = 320,
  height = 100,
  stroke = "url(#sparkGradient)",
  fill = "url(#sparkFill)",
  className,
}: {
  points: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  className?: string;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = height - ((p - min) / range) * (height - 8) - 4;
    return [x, y] as const;
  });

  // smooth path
  const d = coords
    .map((c, i, arr) => {
      if (i === 0) return `M ${c[0]} ${c[1]}`;
      const prev = arr[i - 1];
      const cx = (prev[0] + c[0]) / 2;
      return `Q ${prev[0]} ${prev[1]} ${cx} ${(prev[1] + c[1]) / 2} T ${c[0]} ${c[1]}`;
    })
    .join(" ");

  const area = `${d} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.70 0.16 245)" />
          <stop offset="100%" stopColor="oklch(0.66 0.22 295)" />
        </linearGradient>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.66 0.22 295 / 0.45)" />
          <stop offset="100%" stopColor="oklch(0.66 0.22 295 / 0)" />
        </linearGradient>
      </defs>
      <path d={area} fill={fill} />
      <path d={d} fill="none" stroke={stroke} strokeWidth={2.5} strokeLinecap="round" />
    </svg>
  );
}
