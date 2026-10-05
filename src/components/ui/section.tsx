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
  className,
}: {
  index?: string;
  kicker: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: { href: string; label: string };
  tone?: "dark";
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
        <Eyebrow index={index} tone={tone}>
          {kicker}
        </Eyebrow>
        <h2
          className={clsx(
            "display mt-4 text-balance text-display-sm sm:text-display-md lg:text-display-md",
            tone === "dark" && "text-porcelain",
          )}
        >
          {title}
        </h2>
        {description && (
          <p
            className={clsx(
              "mt-4 max-w-xl text-body leading-relaxed",
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
