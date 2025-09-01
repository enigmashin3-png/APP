export default function Sparkline({
  points,
  width = 240,
  height = 64,
  strokeWidth = 2,
  className = "",
}: {
  points: Array<{ t: number; v: number }>;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}) {
  if (points.length === 0) return <div className="text-xs opacity-70">No data</div>;
  const xs = points.map((p) => p.t);
  const ys = points.map((p) => p.v);
  const minX = Math.min(...xs),
    maxX = Math.max(...xs);
  const minY = Math.min(...ys),
    maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  const path = points
    .map((p, i) => {
      const x = ((p.t - minX) / dx) * (width - 8) + 4;
      const y = height - (((p.v - minY) / dy) * (height - 8) + 4);
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
    </svg>
  );
}
