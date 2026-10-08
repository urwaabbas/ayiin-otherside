"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function CompactPromoBanner({
  headline = "Up to 34% off considered essentials.",
  ctaLabel = "Shop Today's Deals",
  ctaHref = "/search?deal=1",
}: {
  headline?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <aside
      aria-label="Promotional campaign"
      className="group relative overflow-hidden rounded-surface border border-brand/30 bg-gradient-to-r from-ink via-ink-2 to-ink text-white p-5 sm:p-6"
    >
      {/* Ambient Glow */}
      <div
        aria-hidden
        className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/15 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl"
      />

      <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        {/* Left: Message */}
        <div className="max-w-2xl">
          <h3 className="display text-balance text-heading leading-tight tracking-[-0.01em] text-white sm:text-display-xs">
            {headline}
          </h3>
        </div>

        {/* Right: CTA & Verification Signals */}
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={ctaHref}
            className="btn btn-primary h-11 px-5 text-support font-semibold shadow-[0_2px_12px_rgba(255,166,36,0.35)] transition-transform hover:scale-[1.02]"
          >
            <span>{ctaLabel}</span>
            <Icon name="arrowRight" size={15} />
          </Link>
        </div>
      </div>
    </aside>
  );
}
