"use client";

import type { Product } from "@/lib/types";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { ClarityCard } from "@/components/home/clarity-card";
import { AskForm } from "@/components/home/ask-form";
import { Icon } from "@/components/ui/icon";

export function HeroDiscovery({
  clarityItems,
  alternatives,
}: {
  clarityItems: Product[];
  alternatives?: Record<string, Product | null>;
}) {
  return (
    <section
      aria-label="Intelligent product discovery"
      className="relative overflow-hidden border-b border-line/60 bg-gradient-to-b from-white/60 via-porcelain to-porcelain py-8 sm:py-12 lg:py-16"
    >
      {/* Subtle backdrop grid texture */}
      <div
        aria-hidden
        className="grid-texture pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
      />

      <div className="shell relative">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Left: The "Describe what you need" Discovery Command */}
          <div className="flex flex-col justify-center lg:col-span-7 lg:pt-2">
            <div className="flex items-center gap-2">
              <Eyebrow index="01" className="animate-fade">
                Intelligent Discovery
              </Eyebrow>
              <span className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand-deep sm:inline-flex">
                <SignalDot tone="brand" live />
                Live marketplace
              </span>
            </div>

            <h1 className="display mt-4 text-display-md leading-[0.94] tracking-[-0.04em] sm:text-display-lg xl:text-display-xl">
              <span className="block animate-rise">Describe what</span>
              <span className="block animate-rise [animation-delay:100ms] text-ink">
                you need.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-body leading-relaxed text-ink-2 sm:text-emphasis [animation-delay:200ms] animate-rise">
              Tell AYIIN your budget, deadline, or exact use case. We parse your intent
              and match verified products with honest pricing and exact arrival dates.
            </p>

            {/* Elevated Natural-Language Discovery Input */}
            <div className="mt-7 max-w-2xl animate-rise [animation-delay:260ms]">
              <AskForm tone="light" />
            </div>

            {/* Certainty Signals Bar */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-line/80 pt-6 sm:grid-cols-3 sm:gap-4">
              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-hair)]">
                  <Icon name="shield" size={14} className="text-brand-deep" />
                </span>
                <div>
                  <p className="text-support font-medium text-ink">12-Week Price History</p>
                  <p className="text-meta text-mute leading-snug">Every deal is verified against actual 12-week low pricing.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-hair)]">
                  <Icon name="truck" size={14} className="text-brand-deep" />
                </span>
                <div>
                  <p className="text-support font-medium text-ink">Exact Delivery Dates</p>
                  <p className="text-meta text-mute leading-snug">No vague ranges. Exact dates with real-time dispatch cutoffs.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-ink shadow-[var(--shadow-hair)]">
                  <Icon name="check" size={14} className="text-brand-deep" />
                </span>
                <div>
                  <p className="text-support font-medium text-ink">Vetted Merchants</p>
                  <p className="text-meta text-mute leading-snug">Public scorecards for on-time rates and verified buyer reviews.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Live Clarity Card */}
          <div className="lg:col-span-5 animate-rise [animation-delay:200ms]">
            <div className="relative">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <span className="eyebrow flex items-center gap-1.5 text-mute">
                  <Icon name="sparkle" size={12} className="text-brand-deep" />
                  Ayiin Clarity · Live answers before you buy
                </span>
                <span className="num text-meta text-mute">Rotating</span>
              </div>
              <ClarityCard items={clarityItems} alternatives={alternatives} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
