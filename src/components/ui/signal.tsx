import { clsx } from "clsx";

export function SignalDot({ tone = "brand", live, className }: { tone?: "brand" | "success" | "warning" | "danger" | "info" | "mute"; live?: boolean; className?: string }) {
  return <span aria-hidden className={clsx("signal-dot", className)} data-tone={tone} data-live={live ? "true" : undefined} />;
}

/**
 * Section eyebrow: an optional compact index pill, then the kicker.
 * The pill is a quiet tag, not a headline — the section title carries the weight.
 */
export function Eyebrow({ index, children, className, tone }: { index?: string; children: React.ReactNode; className?: string; tone?: "dark" }) {
  return (
    <p className={clsx("eyebrow flex items-center gap-2.5", tone === "dark" && "!text-mute-dark", className)}>
      {index && (
        <span
          className={clsx(
            "inline-flex h-5 items-center rounded-full px-2 font-mono text-[11px] font-medium tracking-[0.04em]",
            tone === "dark" ? "bg-graphite-2 text-porcelain ring-1 ring-graphite-line" : "bg-mist text-ink-2 ring-1 ring-line",
          )}
        >
          {index}
        </span>
      )}
      <span>{children}</span>
    </p>
  );
}
