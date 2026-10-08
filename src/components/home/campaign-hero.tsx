"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { HeroCampaignSlide } from "@/lib/campaigns";
import { HeroWorld } from "@/components/home/hero-world";

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
  // Product-world slides are light rooms; the rail switches to ink over them.
  const light = Boolean(slides[activeIdx]?.showcase);

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured marketplace campaigns"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      className={clsx("relative w-full overflow-hidden transition-colors duration-1000 h-[calc(100svh-112px)] lg:h-[calc(100svh-152px)] min-h-[560px] lg:min-h-[520px] max-h-[720px]", light ? "bg-white" : "bg-ink")}
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
            {slide.showcase ? (
              <HeroWorld slide={slide} active={isActive} first={idx === 0} />
            ) : (
            <>
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
            <div className="shell relative flex h-full flex-col justify-center pt-6 pb-20 sm:pt-8 sm:pb-22">
              <div className="max-w-2xl">
                {/* Headline in Funnel Display */}
                <h1 className="display text-balance text-heading leading-[1.0] tracking-[-0.035em] text-white sm:text-display-sm lg:text-display-md xl:text-display-lg">
                  {slide.title}
                </h1>

                {/* Call-to-Action Group */}
                <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-3">
                  <Link
                    href={slide.cta.href}
                    className="btn btn-primary h-11 px-6 text-support font-semibold shadow-[0_4px_16px_rgba(255,166,36,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>{slide.cta.label}</span>
                    <Icon name="arrowRight" size={17} />
                  </Link>

                  {slide.secondaryCta && (
                    <Link
                      href={slide.secondaryCta.href}
                      className="btn h-11 border border-white/30 bg-white/10 px-5 text-support font-medium text-white backdrop-blur-md transition-all hover:border-white/60 hover:bg-white/20 hover:text-white active:scale-[0.98]"
                    >
                      <span>{slide.secondaryCta.label}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            </>
            )}
          </div>
        );
      })}

      {/* Intentional Bottom Progress & Navigation Rail */}
      <div className="absolute inset-x-0 bottom-5 sm:bottom-6 z-20 pointer-events-none">
        <div className={clsx("shell flex items-end gap-4 pointer-events-auto", light ? "justify-start" : "justify-between")}>
          {/* Segmented Slide Indicators with Labels */}
          <div className={clsx("flex max-w-2xl flex-1 items-center gap-2 transition-opacity duration-500 sm:gap-4", light && "hidden")}>
            {slides.map((s, k) => {
              const isCurrent = k === activeIdx;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Go to slide ${k + 1}: ${s.title}`}
                  aria-current={isCurrent}
                  onClick={() => setActiveIdx(k)}
                  className="group flex min-w-0 flex-1 flex-col gap-1.5 py-1 text-left transition-opacity cursor-pointer"
                >
                  <div className="flex min-w-0 items-center gap-2 text-meta">
                    <span
                      className={clsx(
                        "shrink-0 font-mono font-medium transition-colors",
                        isCurrent ? (light ? "text-brand-deep" : "text-brand") : light ? "text-ink/45 group-hover:text-ink/75" : "text-white/50 group-hover:text-white/80",
                      )}
                    >
                      0{k + 1}
                    </span>
                    <span
                      className={clsx(
                        "hidden min-w-0 truncate text-[11px] tracking-wide transition-colors sm:block",
                        isCurrent ? (light ? "text-ink font-medium" : "text-white/90 font-medium") : light ? "text-ink/40 group-hover:text-ink/70" : "text-white/40 group-hover:text-white/70",
                      )}
                    >
                      {s.tag}
                    </span>
                  </div>
                  <div className={clsx("relative h-[3px] w-full overflow-hidden rounded-full transition-colors", light ? "bg-ink/12 group-hover:bg-ink/20" : "bg-white/20 group-hover:bg-white/30")}>
                    <div
                      key={`${k}-${activeIdx}-${isPaused}`}
                      className={clsx(
                        "absolute inset-y-0 left-0 rounded-full bg-brand transition-all",
                        k < activeIdx && "w-full",
                        k > activeIdx && "w-0",
                        isCurrent && !isPaused && "animate-[hero-progress_6.8s_linear_forwards]",
                        isCurrent && isPaused && "w-full",
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation Capsule */}
          <div className={clsx("flex items-center gap-1.5 rounded-full border p-1 backdrop-blur-md transition-colors duration-700", light ? "border-ink/10 bg-white/60 text-ink" : "border-white/20 bg-black/30 text-white")}>
            <button
              type="button"
              aria-label="Previous campaign"
              onClick={() => setActiveIdx((prev) => (prev - 1 + count) % count)}
              className={clsx("grid h-8 w-8 place-items-center rounded-full transition-all", light ? "text-ink/70 hover:bg-ink/5 hover:text-ink" : "text-white/80 hover:bg-white/20 hover:text-white")}
            >
              <Icon name="chevronLeft" size={17} />
            </button>
            <span className={clsx("px-2 font-mono text-meta select-none", light ? "text-ink/60" : "text-white/70")}>
              0{activeIdx + 1} / 0{count}
            </span>
            <button
              type="button"
              aria-label="Next campaign"
              onClick={() => setActiveIdx((prev) => (prev + 1) % count)}
              className={clsx("grid h-8 w-8 place-items-center rounded-full transition-all", light ? "text-ink/70 hover:bg-ink/5 hover:text-ink" : "text-white/80 hover:bg-white/20 hover:text-white")}
            >
              <Icon name="chevronRight" size={17} />
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
