"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";
import type { HeroCampaignSlide } from "@/lib/campaigns";

export function CampaignHero({ slides }: { slides: HeroCampaignSlide[] }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (
      isPaused ||
      count < 2 ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIdx((prev) => (prev + 1) % count);
    }, 6800);
    return () => window.clearTimeout(timer);
  }, [activeIdx, isPaused, count]);

  if (!slides.length) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured marketplace campaigns"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className="relative h-[420px] w-full overflow-hidden bg-ink sm:h-[480px] lg:h-[520px] xl:h-[560px] max-h-[calc(100dvh-150px)] min-h-[400px]"
    >
      {slides.map((slide, idx) => {
        const isActive = idx === activeIdx;
        return (
          <div
            key={slide.id}
            role="group"
            aria-roledescription="slide"
            aria-label={`${idx + 1} of ${count}: ${slide.title}`}
            aria-hidden={!isActive}
            inert={!isActive}
            className={clsx(
              "absolute inset-0 transition-opacity duration-1000 ease-[var(--ease-out-expo)]",
              isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none",
            )}
          >
            {/* Background Photography with subtle slow motion */}
            {slide.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={slide.image}
                alt=""
                loading={idx === 0 ? "eager" : "lazy"}
                className={clsx(
                  "absolute inset-0 h-full w-full object-cover transition-transform duration-[7000ms] ease-linear",
                  isActive ? "scale-105" : "scale-100",
                )}
                style={{ objectPosition: slide.position || "center" }}
              />
            )}

            {/* Editorial Multi-layer Lighting & Scrim */}
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--rgb-ink)/0.92)_0%,rgb(var(--rgb-ink)/0.78)_36%,rgb(var(--rgb-ink)/0.35)_68%,transparent_90%)]"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgb(var(--rgb-ink)/0.85),transparent)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,166,36,0.12),transparent_55%)]"
            />

            {/* Content Presentation */}
            <div className="shell relative flex h-full flex-col justify-center pb-14 pt-6 sm:pb-16 sm:pt-8">
              <div className="max-w-2xl">
                {/* Campaign Tag Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-meta font-medium tracking-wide text-white backdrop-blur-md">
                  <SignalDot tone="brand" live />
                  <span className="font-mono uppercase tracking-[0.14em] text-brand">
                    {slide.kicker}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/90">{slide.tag}</span>
                </div>

                {/* Headline in Funnel Display */}
                <h1 className="display mt-3.5 sm:mt-4 text-balance text-display-sm leading-[0.95] tracking-[-0.035em] text-white sm:text-display-md lg:text-display-lg xl:text-display-xl">
                  {slide.title}
                </h1>

                {/* Supporting Editorial Copy */}
                <p className="mt-3 sm:mt-4 max-w-xl text-balance text-body leading-relaxed text-white/85 sm:text-emphasis sm:leading-relaxed">
                  {slide.description}
                </p>

                {/* Call-to-Action Group */}
                <div className="mt-6 sm:mt-7 flex flex-wrap items-center gap-3.5">
                  <Link
                    href={slide.cta.href}
                    className="btn btn-primary h-11 px-5.5 text-support font-semibold shadow-[0_4px_16px_rgba(255,166,36,0.35)] transition-transform hover:scale-[1.02]"
                  >
                    <span>{slide.cta.label}</span>
                    <Icon name="arrowRight" size={17} />
                  </Link>

                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryCta.href}
                      className="btn h-11 border border-white/35 bg-white/10 px-5 text-support font-medium text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/20 hover:text-white"
                    >
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Progress & Pagination Bar */}
      <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-20">
        <div className="shell flex items-center justify-between gap-4">
          {/* Segmented Slide Indicators with Animated Fill */}
          <div className="flex flex-1 max-w-md items-center gap-2">
            {slides.map((s, k) => {
              const isCurrent = k === activeIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${k + 1}: ${s.title}`}
                  aria-current={isCurrent}
                  onClick={() => setActiveIdx(k)}
                  suppressHydrationWarning
                  className="group relative flex h-7 flex-1 items-center"
                >
                  <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-white/25 transition-all group-hover:bg-white/40">
                    <span
                      key={`${k}-${activeIdx}-${isPaused}`}
                      className={clsx(
                        "absolute inset-y-0 left-0 rounded-full bg-brand transition-all",
                        k < activeIdx && "w-full",
                        k > activeIdx && "w-0",
                        isCurrent && !isPaused && "animate-[hero-progress_6.8s_linear_forwards]",
                        isCurrent && isPaused && "w-full",
                      )}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous campaign"
              onClick={() => setActiveIdx((prev) => (prev - 1 + count) % count)}
              suppressHydrationWarning
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/25"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              aria-label="Next campaign"
              onClick={() => setActiveIdx((prev) => (prev + 1) % count)}
              suppressHydrationWarning
              className="grid h-10 w-10 place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all hover:border-white hover:bg-white/25"
            >
              <Icon name="chevronRight" size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
