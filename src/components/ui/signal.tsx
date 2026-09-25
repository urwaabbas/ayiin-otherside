import { clsx } from "clsx";

export function SignalDot({ tone = "lime", live, className }: { tone?: "lime" | "amber" | "blue" | "mute" | "danger"; live?: boolean; className?: string }) {
  return <span aria-hidden className={clsx("signal-dot", className)} data-tone={tone} data-live={live ? "true" : undefined} />;
}

export function Eyebrow({ index, children, className, tone }: { index?: string; children: React.ReactNode; className?: string; tone?: "dark" }) {
  return (
    <p className={clsx("eyebrow flex items-center gap-2", tone === "dark" && "!text-mute-dark", className)}>
      {index && <span className={tone === "dark" ? "text-porcelain" : "text-ink"}>{index}</span>}
      {index && <span aria-hidden className={clsx("h-px w-6", tone === "dark" ? "bg-graphite-line" : "bg-line-strong")} />}
      <span>{children}</span>
    </p>
  );
}
