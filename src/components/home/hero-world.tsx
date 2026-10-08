"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { HeroCampaignSlide, HeroShowcaseItem } from "@/lib/campaigns";
import { productBySlug } from "@/lib/catalog/products";
import { photoCutoutUrl, productPhoto } from "@/lib/images";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";


/**
 * Showcase hero slide. Left: the message — eyebrow pill, headline, two actions and the three
 * marketplace promises. Right: a field of the brand's sunlit amber with real product photography
 * (backgrounds removed by the Unsplash CDN) standing on white pedestals, plus two promise badges.
 *
 * The pointer moves products at different depths; hovering a product lifts it and shows its
 * brand, name and price.
 */
export function HeroWorld({ slide, active, first }: { slide: HeroCampaignSlide; active: boolean; first: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  // First load: the amber disc opens, the headline rises, and the products settle onto their
  // pedestals one after another. Once, only for the first slide, never with reduced motion.
  useEffect(() => {
    const el = root.current;
    if (!el || !first || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hs-field", { clipPath: "circle(0% at 14% 52%)", duration: 1.4, ease: "power2.inOut" }, 0)
        .from(".hs-copy > *", { y: 36, opacity: 0, duration: 1, stagger: 0.12 }, 0.15)
        .from(".hs-pedestal", { clipPath: "inset(100% 0% 0% 0%)", duration: 0.9, stagger: 0.12, clearProps: "clipPath" }, 0.5)
        .from(".hs-box", { y: 90, opacity: 0, scale: 0.9, duration: 1.1, stagger: 0.14, clearProps: "transform,opacity" }, 0.7);
    }, el);
    return () => ctx.revert();
  }, [first]);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !root.current) return;
    const r = root.current.getBoundingClientRect();
    const mx = (e.clientX - r.left) / r.width - 0.5;
    const my = (e.clientY - r.top) / r.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      root.current?.style.setProperty("--mx", mx.toFixed(3));
      root.current?.style.setProperty("--my", my.toFixed(3));
    });
  };
  const onLeave = () => {
    root.current?.style.setProperty("--mx", "0");
    root.current?.style.setProperty("--my", "0");
  };

  const item = (slot: HeroShowcaseItem["slot"]) => slide.showcase?.find((s) => s.slot === slot);
  const Heading = first ? "h1" : "h2";
  // The headline's last word is the accent line, in the brand's deep amber.
  const words = slide.title.split(" ");
  const last = words.pop();
  const lead = words.join(" ");

  return (
    <div ref={root} onPointerMove={onMove} onPointerLeave={onLeave} data-active={active} className="hs absolute inset-0 overflow-hidden bg-white">
      <div aria-hidden className="hs-field" />

      <div className="shell relative grid h-full grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,11fr)_minmax(0,9fr)] lg:grid-rows-1">
        {/* ── Message ── */}
        <div className="hs-copy relative z-10 flex flex-col justify-center pt-6 sm:pt-10 lg:pt-0">
          <Heading className="text-[2.6rem] font-semibold leading-[0.98] tracking-[-0.045em] text-ink sm:text-[3.5rem] lg:text-[clamp(3.25rem,4.9vw,5rem)]">
            {lead}
            <span className="block text-brand-deep">{last}</span>
          </Heading>
          <div className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 lg:mt-10">
            <Link href={slide.cta.href} className="hs-cta inline-flex h-12 items-center gap-3 rounded-control bg-ink px-7 text-body font-medium text-white shadow-[0_10px_24px_-10px_rgb(var(--rgb-ink)/0.6)] transition-[background-color,transform] duration-300 hover:bg-graphite-2 active:scale-[0.98] sm:h-14">
              {slide.cta.label}
              <Icon name="arrowRight" size={18} className="hs-cta-arrow" />
            </Link>
            {slide.secondaryCta && (
              <Link href={slide.secondaryCta.href} className="border-b-2 border-brand pb-0.5 text-body font-medium text-ink transition-colors hover:border-brand-deep hover:text-brand-deep">
                {slide.secondaryCta.label}
              </Link>
            )}
          </div>

        </div>

        {/* ── Showcase ── */}
        <div className="hs-stage relative" role="list" aria-label="Featured products">
          <span aria-hidden className="hs-pedestal hs-pedestal--anchor" />
          <span aria-hidden className="hs-pedestal hs-pedestal--accent" />
          {(["tall", "anchor", "accent"] as const).map((slot) => {
            const it = item(slot);
            return it ? <Product key={slot} item={it} eager={first} /> : null;
          })}
        </div>
      </div>
    </div>
  );
}

function Product({ item: it, eager }: { item: HeroShowcaseItem; eager: boolean }) {
  const p = productBySlug(it.slug);
  const photo = p && productPhoto(p, undefined, "hero");
  if (!p || !photo) return null;
  const [x0, y0, x1, y1] = it.crop;
  const bw = x1 - x0;
  const bh = y1 - y0;
  // The box is the product's own bounds; the photo is scaled and shifted so those bounds fill it.
  const box = { aspectRatio: `${(bw * it.aspect) / bh}` } as React.CSSProperties;
  const img = { width: `${100 / bw}%`, left: `${(-x0 / bw) * 100}%`, top: `${(-y0 / bh) * 100}%` } as React.CSSProperties;
  return (
    <Link role="listitem" href={`/p/${p.slug}`} className={clsx("hs-product", `hs-product--${it.slot}`)} aria-label={`${p.brand} ${p.name}`}>
      <span className="hs-box relative block overflow-hidden" style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- CDN-processed cut-out; srcset sized by hand */}
        <img
          src={photoCutoutUrl(photo, 900)}
          srcSet={`${photoCutoutUrl(photo, 600)} 600w, ${photoCutoutUrl(photo, 900)} 900w, ${photoCutoutUrl(photo, 1400)} 1400w`}
          sizes="(min-width: 1024px) 34vw, 70vw"
          alt=""
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager && it.slot === "anchor" ? "high" : undefined}
          draggable={false}
          className="absolute max-w-none"
          style={img}
        />
      </span>
      <span className="hs-tag">
        <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{p.brand}</span>
        <span className="mt-0.5 block text-support font-medium text-ink">{p.name}</span>
        <span className="mt-1 flex items-center justify-between gap-4">
          <Money usd={p.price} className="text-support font-medium text-ink" />
          <span className="flex items-center gap-1 text-meta font-medium text-brand-deep">
            Explore <Icon name="arrowRight" size={12} />
          </span>
        </span>
      </span>
    </Link>
  );
}
