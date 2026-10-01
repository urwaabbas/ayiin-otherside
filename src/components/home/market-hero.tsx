"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";

export type HeroSlide = { href: string; kicker: string; title: string; text: string; cta: string; image: string; position: string };

/**
 * Marketplace hero: a wide, auto-advancing banner of departments.
 * The bottom fades into the page so the category cards can sit over it.
 */
export function MarketHero({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = slides.length;

  useEffect(() => {
    if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setI((x) => (x + 1) % n), 6500);
    return () => window.clearTimeout(t);
  }, [i, paused, n]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured departments"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative h-[320px] overflow-hidden bg-ink sm:h-[400px] lg:h-[520px]"
    >
      {slides.map((s, k) => (
        <div
          key={s.href}
          role="group"
          aria-roledescription="slide"
          aria-label={`${k + 1} of ${n}: ${s.title}`}
          aria-hidden={k !== i}
          inert={k !== i}
          className={clsx("absolute inset-0 transition-opacity duration-700", k === i ? "opacity-100" : "opacity-0")}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.image} alt="" loading={k === 0 ? "eager" : "lazy"} className="absolute inset-0 h-full w-full object-cover" style={{ objectPosition: s.position }} />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--rgb-ink)/0.82)_0%,rgb(var(--rgb-ink)/0.45)_45%,transparent_75%)]" />
          <div className="relative mx-auto flex h-full max-w-[1520px] flex-col justify-start px-5 pt-8 sm:px-10 sm:pt-12 lg:pt-14">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-brand">{s.kicker}</p>
            <p className="mt-2 max-w-[560px] text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[44px]">{s.title}</p>
            <p className="mt-3 hidden max-w-[460px] text-[15px] leading-relaxed text-white/85 sm:block">{s.text}</p>
            <Link href={s.href} className="btn btn-brand mt-5 h-10 w-fit px-5 text-[14px]">
              {s.cta} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </div>
      ))}

      {/* Fade into the page, so category cards can overlap the banner */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_bottom,transparent,var(--color-porcelain))]" />

      {n > 1 && (
        <>
          <button type="button" aria-label="Previous" onClick={() => setI((x) => (x - 1 + n) % n)} className="absolute left-0 top-0 hidden h-[60%] w-14 place-items-center text-white/80 hover:text-white focus-visible:outline-2 sm:grid">
            <Icon name="chevronLeft" size={34} />
          </button>
          <button type="button" aria-label="Next" onClick={() => setI((x) => (x + 1) % n)} className="absolute right-0 top-0 hidden h-[60%] w-14 place-items-center text-white/80 hover:text-white focus-visible:outline-2 sm:grid">
            <Icon name="chevronRight" size={34} />
          </button>
          <div className="absolute right-5 top-5 flex gap-1.5 sm:right-16">
            {slides.map((s, k) => (
              <button key={s.href} type="button" aria-label={`Show ${s.title}`} aria-current={k === i} onClick={() => setI(k)} className="grid h-5 place-items-center">
                <span className={clsx("block h-1.5 rounded-full transition-all", k === i ? "w-6 bg-brand" : "w-1.5 bg-white/60")} />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
