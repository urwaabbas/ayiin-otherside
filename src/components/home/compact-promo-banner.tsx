"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";

export function CompactPromoBanner({
  kicker = "VERIFIED PRICE DROPS",
  headline = "Up to 34% off considered essentials.",
  subtext = "Every deal is cross-checked against 12-week historical pricing. No inflated reference prices.",
  ctaLabel = "Shop Today's Deals",
  ctaHref = "/search?deal=1",
}: {
  kicker?: string;
  headline?: string;
  subtext?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <aside
      aria-label="Promotional campaign"
      className="group relative overflow-hidden rounded-[20px] border border-brand/30 bg-gradient-to-r from-ink via-ink-2 to-ink text-white p-5 shadow-[var(--shadow-hair)] sm:p-6"
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-meta font-medium text-white backdrop-blur-md">
              <SignalDot tone="brand" live />
              <span className="font-mono uppercase tracking-[0.14em] text-brand">
                {kicker}
              </span>
            </span>
            <span className="text-meta text-white/50">·</span>
            <span className="text-meta text-white/80">Real-time inventory</span>
          </div>

          <h3 className="display mt-2 text-balance text-heading leading-tight tracking-[-0.01em] text-white sm:text-display-xs">
            {headline}
          </h3>
          <p className="mt-1 text-support text-white/75 leading-relaxed">
            {subtext}
          </p>
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
