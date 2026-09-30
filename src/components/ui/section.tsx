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
    <div className={clsx("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <Eyebrow index={index} tone={tone}>
          {kicker}
        </Eyebrow>
        <h2 className={clsx("display mt-4 text-balance text-[44px] sm:text-[60px] lg:text-[72px] short:mt-[clamp(6px,1.2vh,12px)] short:text-[clamp(36px,6.4vh,52px)]", tone === "dark" && "text-porcelain")}>{title}</h2>
        {description && <p className={clsx("mt-4 max-w-xl text-[16px] leading-relaxed short:mt-[clamp(6px,1.2vh,10px)] short:text-[clamp(13.5px,2vh,15px)]", tone === "dark" ? "text-mute-dark" : "text-mute")}>{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className={clsx("btn shrink-0 self-start md:self-auto", tone === "dark" ? "btn-on-dark" : "btn-ghost")}>
          {action.label} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}
