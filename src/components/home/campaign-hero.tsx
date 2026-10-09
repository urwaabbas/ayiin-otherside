"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { productBySlug } from "@/lib/catalog/products";
import { photoUrl, productPhoto } from "@/lib/images";

/**
 * Home hero: a banner. Seven product photographs drift slowly across the panel at different heights,
 * with a short headline and one way in set over a white fade on the left. The drift pauses under the
 * pointer or keyboard focus; each photograph is a link to its product page and shows its name and
 * price on hover. Nothing here is decoration: every image is a real, buyable product.
 */

/** Each photograph with the share of the panel's height it stands at. */
const REEL: { slug: string; h: number }[] = [
  { slug: "aurel-anc-over-ear", h: 66 },
  { slug: "loom-lounge-chair", h: 80 },
  { slug: "pour-gooseneck-kettle", h: 54 },
  { slug: "ergo-task-chair-pro", h: 74 },
  { slug: "stride-runner-2", h: 60 },
  { slug: "transit-daypack-22", h: 82 },
  { slug: "ember-soy-candle", h: 52 },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function CampaignHero() {
  const reduce = useReducedMotion();
  const rise = (delay: number, y = 24) => (reduce ? {} : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.9, ease: EASE, delay } });

  return (
    <section aria-label="Shop Ayiin" className="shell pt-3 sm:pt-4">
      <div className="relative isolate flex h-[clamp(560px,calc(100svh-200px),760px)] flex-col overflow-hidden rounded-panel bg-white shadow-[var(--shadow-hair)] lg:block lg:h-[clamp(540px,calc(100svh-132px),860px)]">
        {/* The reel */}
        <div className="relative order-2 min-h-0 flex-1 [container-type:size] lg:absolute lg:inset-y-0 lg:left-[42%] lg:right-0 lg:[mask-image:linear-gradient(to_right,transparent,black_14%)]">
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}
            className="hero-reel absolute inset-y-0 left-0 flex w-max items-center"
          >
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 ? true : undefined} aria-label={copy === 0 ? "Featured products" : undefined} className="flex shrink-0 items-center">
                {REEL.map((item, i) => (
                  <Photo key={item.slug} {...item} index={i} hiddenCopy={copy === 1} reduce={Boolean(reduce)} />
                ))}
              </ul>
            ))}
          </motion.div>
        </div>

        {/* Message */}
        <div className="relative order-1 flex flex-col items-center px-6 pb-2 pt-[clamp(1.5rem,6svh,2.5rem)] text-center lg:absolute lg:inset-y-0 lg:left-0 lg:z-10 lg:w-[46%] lg:items-start lg:justify-center lg:px-[clamp(2rem,5vw,5rem)] lg:pb-0 lg:pt-0 lg:text-left">
          <h1 className="display text-[clamp(2.4rem,min(calc(1.2rem+8.4svh),11vw),6.5rem)] leading-[0.95] tracking-[-0.045em] text-ink">
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="inline-block" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.1 }}>
                Shop what&apos;s
              </motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span className="inline-block" initial={reduce ? false : { y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.2 }}>
                <span className="relative inline-block text-brand-deep">
                  worth
                  <svg aria-hidden viewBox="0 0 220 14" preserveAspectRatio="none" className="absolute -bottom-[0.02em] left-0 h-[0.15em] w-full text-brand">
                    <motion.path
                      d="M3 9 C 40 2, 90 2, 130 6 S 195 10, 217 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.95 }}
                    />
                  </svg>
                </span>{" "}
                it.
              </motion.span>
            </span>
          </h1>

          <motion.div {...rise(0.4)} className="mt-[clamp(1rem,3.2svh,2rem)] flex flex-wrap items-center justify-center gap-x-6 gap-y-3 lg:justify-start">
            <Link
              href="/search"
              className="group inline-flex h-12 items-center gap-2.5 rounded-full bg-ink px-7 text-body font-medium text-white shadow-[0_10px_24px_-10px_rgb(var(--rgb-ink)/0.6)] transition-[background-color,transform] duration-300 hover:bg-graphite-2 active:scale-[0.98]"
            >
              Shop now
              <Icon name="arrowRight" size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link href="/search?deal=1" className="border-b-2 border-brand pb-0.5 text-body font-medium text-ink transition-colors hover:border-brand-deep hover:text-brand-deep">
              Today&apos;s deals
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Photo({ slug, h, index, hiddenCopy, reduce }: { slug: string; h: number; index: number; hiddenCopy: boolean; reduce: boolean }) {
  const p = productBySlug(slug);
  const photo = p && productPhoto(p, undefined, "hero");
  if (!p || !photo) return null;
  return (
    <motion.li
      className="mr-[clamp(0.75rem,1.4vw,1.25rem)] shrink-0"
      style={{ height: `${h}cqh`, aspectRatio: "4 / 5" }}
      initial={reduce ? false : { opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE, delay: 0.25 + index * 0.08 }}
    >
      <Link
        href={`/p/${p.slug}`}
        tabIndex={hiddenCopy ? -1 : undefined}
        aria-label={`${p.brand} ${p.name}`}
        className="group relative block h-full w-full overflow-hidden rounded-[1.25rem] bg-mist shadow-[0_26px_50px_-24px_rgb(var(--rgb-ink)/0.5)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- Unsplash CDN crop at 4:5 around the photo's focal point */}
        <img
          src={photoUrl(photo, 640, 80, 1.25)}
          srcSet={`${photoUrl(photo, 420, 78, 1.25)} 420w, ${photoUrl(photo, 640, 80, 1.25)} 640w, ${photoUrl(photo, 900, 82, 1.25)} 900w`}
          sizes="(min-width: 1024px) 22vw, 50vw"
          alt=""
          loading="eager"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
        />
        <span aria-hidden className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-ink/65 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
        <span className="absolute inset-x-0 top-0 -translate-y-2 p-4 text-white opacity-0 transition-[opacity,transform] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
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
