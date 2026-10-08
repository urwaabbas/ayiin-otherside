import Link from "next/link";
import { clsx } from "clsx";
import { Eyebrow } from "@/components/ui/signal";

export function SectionHeader({
  index,
  kicker,
  title,
  description,
  action,
  tone,
  compact,
  className,
}: {
  index?: string;
  kicker?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  tone?: "dark";
  /** On laptops the heading scales with the screen height so a one-screen section keeps room for its body */
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {kicker && (
          <Eyebrow index={index} tone={tone}>
            {kicker}
          </Eyebrow>
        )}
        <h2
          className={clsx(
            "display",
            kicker && "mt-4",
            kicker && compact && "lg:mt-[clamp(0.25rem,1.2svh,1rem)]",
            " text-balance text-display-sm sm:text-display-md lg:text-display-md",
            compact && "lg:!text-[clamp(1.75rem,calc(1rem+3.6svh),3.5rem)] lg:!leading-[0.98]",
            tone === "dark" && "text-porcelain",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={clsx(
              "mt-4 max-w-xl text-body leading-relaxed",
              compact && "lg:mt-[clamp(0.25rem,1.2svh,1rem)] lg:text-support [@media(min-width:1024px)_and_(max-height:820px)]:hidden",
              tone === "dark" ? "text-mute-dark" : "text-mute",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="btn btn-secondary shrink-0 self-start md:self-auto"
        >
          {action.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
