import { clsx } from "clsx";
import { compact } from "@/lib/format";

export function Stars({ value, size = 12, className }: { value: number; size?: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const star = "M12 2.8 14.8 8.6l6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3L2.9 9.5l6.3-.9Z";
  const row = (fill: string) => (
    <svg width={size * 5 + 8} height={size} viewBox={`0 0 ${24 * 5 + 16} 24`} aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={star} transform={`translate(${i * 28} 0)`} fill={fill} />
      ))}
    </svg>
  );
  return (
    <span className={clsx("relative inline-block align-middle", className)} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {row("var(--color-line-strong)")}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("var(--color-ink)")}
      </span>
    </span>
  );
}

export function Rating({ value, count, className, dense }: { value: number; count?: number; className?: string; dense?: boolean }) {
  return (
    <span className={clsx("inline-flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-2", className)}>
      {dense ? (
        <>
          <span className="hidden xl:inline-flex">
            <Stars value={value} />
          </span>
          <span aria-hidden className="xl:hidden">★</span>
        </>
      ) : (
        <Stars value={value} />
      )}
      <span className="num font-medium text-ink">{value.toFixed(1)}</span>
      {count != null && <span className="num text-mute">({compact(count)})</span>}
    </span>
  );
}
