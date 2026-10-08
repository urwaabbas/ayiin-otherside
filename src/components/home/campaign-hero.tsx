"use client";

import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { products, productBySlug } from "@/lib/catalog/products";
import { photoUrl, productPhoto } from "@/lib/images";

/**
 * Home hero: a centred headline, two ways in, and a fan of real products rising from the bottom edge.
 * The fan opens from the middle card outwards; resting the pointer on a card straightens and lifts it
 * while its neighbours step aside, and the whole fan leans a few pixels toward the pointer.
 * Everything below the headline is a link to a real product page.
 */

/** Left to right; the middle card leads. */
const FAN = ["ergo-task-chair-pro", "pour-gooseneck-kettle", "aurel-anc-over-ear", "loom-lounge-chair", "stride-runner-2"] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

// Reviews across the whole catalogue, weighted by how many each product has.
const reviewTotal = products.reduce((s, p) => s + p.reviewCount, 0);
const averageRating = products.reduce((s, p) => s + p.rating * p.reviewCount, 0) / reviewTotal;

export function CampaignHero() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState<number | null>(null);

  // The fan leans toward the pointer.
  const px = useMotionValue(0);
  const lean = useSpring(px, { stiffness: 90, damping: 20, mass: 0.6 });
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * -26);
  };

  const rise = (delay: number, y = 22) => (reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay } });

  return (
    <section aria-label="Shop Ayiin" className="shell pt-3 sm:pt-4">
      <div
        onPointerMove={onMove}
        onPointerLeave={() => px.set(0)}
        className="relative isolate flex h-[clamp(560px,calc(100svh-200px),760px)] flex-col overflow-hidden rounded-panel bg-white shadow-[var(--shadow-hair)] lg:h-[clamp(540px,calc(100svh-132px),860px)]"
      >
        {/* Sunlit ground: the logo's amber, rising from the bottom edge */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 108%, rgb(var(--rgb-brand) / 0.42), transparent 70%), radial-gradient(35% 30% at 50% 100%, rgb(253 210 7 / 0.28), transparent 70%)",
          }}
        />
        <svg aria-hidden viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 -z-10 h-full w-full text-ink/[0.07]">
          {[260, 400, 540, 680].map((r, i) => (
            <motion.circle
              key={r}
              cx="600"
              cy="640"
              r={r}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.2 + i * 0.12 }}
              style={{ transformOrigin: "600px 640px" }}
            />
          ))}
        </svg>

        {/* Message */}
        <div className="relative z-10 mx-auto flex max-w-[56rem] shrink-0 flex-col items-center px-5 pt-[clamp(1.25rem,5.4svh,4.25rem)] text-center">
          <motion.p {...rise(0.05, 10)} className="inline-flex items-center gap-2 rounded-full bg-mist/80 px-3.5 py-1.5 text-support text-ink-2 ring-1 ring-line max-sm:hidden">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
            Every price checked against 12 weeks of history
          </motion.p>

          <h1 className="display mt-[clamp(0.75rem,2.4svh,1.5rem)] text-[clamp(2.1rem,min(calc(1.4rem+7.2svh),13vw),6rem)] leading-[0.96] tracking-[-0.045em] text-ink">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="inline-block" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.12 }}>
                Shop what&apos;s{" "}
                <span className="relative inline-block text-brand-deep">
                  worth
                  <svg aria-hidden viewBox="0 0 220 14" preserveAspectRatio="none" className="absolute -bottom-[0.06em] left-0 h-[0.16em] w-full text-brand">
                    <motion.path
                      d="M3 9 C 40 2, 90 2, 130 6 S 195 10, 217 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
                    />
                  </svg>
                </span>{" "}
                it.
              </motion.span>
            </span>
          </h1>

          <motion.p {...rise(0.35)} className="mt-[clamp(0.5rem,1.8svh,1.25rem)] max-w-[34rem] text-[clamp(0.95rem,1.1rem+0.1vw,1.2rem)] leading-snug text-mute">
            Real prices, real reviews, and a delivery date before you pay.
          </motion.p>

          <motion.div {...rise(0.45)} className="mt-[clamp(0.875rem,2.8svh,2rem)] flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/search"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-body font-medium text-white shadow-[0_10px_24px_-10px_rgb(var(--rgb-ink)/0.6)] transition-[background-color,transform] duration-300 hover:bg-graphite-2 active:scale-[0.98]"
            >
              Shop now
              <Icon name="arrowRight" size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/search?deal=1" className="inline-flex h-12 items-center rounded-full bg-white px-6 text-body font-medium text-ink ring-1 ring-line-strong transition-[box-shadow,transform] duration-300 hover:ring-ink active:scale-[0.98]">
              Today&apos;s deals
            </Link>
          </motion.div>

          <motion.p {...rise(0.55, 10)} className="mt-[clamp(0.625rem,1.8svh,1.25rem)] flex items-center gap-2 text-support text-mute">
            <span className="flex items-center gap-0.5 text-brand-deep" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <Icon key={i} name="star" size={14} />
              ))}
            </span>
            <span>
              <span className="num font-medium text-ink">{averageRating.toFixed(1)}</span> average from {reviewTotal.toLocaleString("en-US")} reviews
            </span>
          </motion.p>
        </div>

        {/* The fan: fills what is left under the message, and sizes its cards to fit that space */}
        <div className="relative min-h-0 flex-1 [container-type:size]">
          <motion.ul
            style={{ x: lean }}
            aria-label="Featured products"
            className="absolute inset-0 [--cw:clamp(5.5rem,min(17cqw,70cqh),16.5rem)] max-sm:[--cw:min(11.5rem,66cqh)]"
          >
            {FAN.map((slug, i) => (
              <FanCard key={slug} slug={slug} index={i - 2} hovered={hovered === null ? null : hovered - 2} onHover={(h) => setHovered(h ? i : null)} reduce={Boolean(reduce)} />
            ))}
          </motion.ul>
        </div>
      </div>
    </section>
  );
}

function FanCard({ slug, index, hovered, onHover, reduce }: { slug: string; index: number; hovered: number | null; onHover: (h: boolean) => void; reduce: boolean }) {
  const p = productBySlug(slug);
  const photo = p && productPhoto(p, undefined, "hero");
  if (!p || !photo) return null;

  const abs = Math.abs(index);
  const active = hovered === index;
  // Neighbours step away from the card under the pointer.
  const step = hovered === null || active ? 0 : index > hovered ? 7 : -7;
  const rest = { x: `${index * 66 + step}%`, y: `${abs * abs * 5}%`, rotate: index * 7, opacity: 1 };
  const lifted = { x: `${index * 66}%`, y: `${abs * abs * 5 - 9}%`, rotate: index * 1.5, opacity: 1 };

  return (
    <motion.li
      className={`absolute bottom-0 w-[var(--cw)] ${abs === 2 ? "max-sm:hidden" : ""}`}
      style={{ left: "50%", marginLeft: "calc(var(--cw) / -2)", transformOrigin: "50% 135%", zIndex: active ? 10 : 5 - abs }}
      initial={reduce ? false : { x: "0%", y: "130%", rotate: 0, opacity: 0 }}
      animate={active ? lifted : rest}
      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: active || hovered !== null ? 220 : 85, damping: active || hovered !== null ? 22 : 17, delay: hovered === null ? 0.5 + abs * 0.09 : 0 }}
      onHoverStart={() => onHover(true)}
      onHoverEnd={() => onHover(false)}
    >
      <Link
        href={`/p/${p.slug}`}
        onFocus={() => onHover(true)}
        onBlur={() => onHover(false)}
        aria-label={`${p.brand} ${p.name}`}
        className="group relative block aspect-[4/5] overflow-hidden rounded-[1.1rem] bg-mist shadow-[0_24px_50px_-18px_rgb(var(--rgb-ink)/0.45)] ring-4 ring-white"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash CDN crop at 4:5 around the photo's focal point */}
        <img
          src={photoUrl(photo, 520, 80, 1.25)}
          srcSet={`${photoUrl(photo, 360, 78, 1.25)} 360w, ${photoUrl(photo, 520, 80, 1.25)} 520w, ${photoUrl(photo, 760, 82, 1.25)} 760w`}
          sizes="(min-width: 1024px) 15vw, 30vw"
          alt=""
          loading="eager"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
        />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <span className="absolute inset-x-0 top-0 -translate-y-2 p-3.5 text-white opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
          <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em] text-white/70">{p.brand}</span>
          <span className="mt-0.5 flex items-baseline justify-between gap-2">
            <span className="truncate text-support font-medium">{p.name}</span>
            <Money usd={p.price} className="shrink-0 text-support font-medium" />
          </span>
        </span>
      </Link>
    </motion.li>
  );
}
