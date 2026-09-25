import { clsx } from "clsx";

/** Twelve-week price sparkline. The last point is today's price, marked with the signal dot. */
export function PriceHistory({
  history,
  className,
  tone = "light",
  height = 48,
}: {
  history: number[];
  className?: string;
  tone?: "light" | "dark";
  height?: number;
}) {
  const w = 100;
  const h = 100;
  const pad = 8;
  const min = Math.min(...history);
  const max = Math.max(...history);
  const span = max - min || 1;
  const pts = history.map((v, i) => [(i * w) / (history.length - 1), pad + (1 - (v - min) / span) * (h - pad * 2)] as const);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
  const area = `${d}L${w} ${h}L0 ${h}Z`;
  const last = pts[pts.length - 1];
  const lowY = Math.max(...pts.map((p) => p[1]));
  const stroke = tone === "dark" ? "#9097A0" : "#62666E";
  return (
    <div className={clsx("relative w-full", className)} style={{ height }} role="img" aria-label={`12-week price history, from ${history[0]} to ${history[history.length - 1]}`}>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <path d={area} fill={tone === "dark" ? "rgb(247 247 242 / 0.05)" : "rgb(10 11 13 / 0.04)"} />
        <path d={`M0 ${lowY}L${w} ${lowY}`} stroke={stroke} strokeOpacity="0.3" strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
        <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <span
        aria-hidden
        className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime ring-[1.5px] ring-ink"
        style={{ left: `${last[0]}%`, top: `${last[1]}%` }}
      />
    </div>
  );
}
