"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { Price } from "@/components/ui/money";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";
import { AyiinLogo } from "@/components/brand/ayiin-logo";
import { usePrefs } from "@/components/providers";
import { deliveryLabel, priceInsight, stockSignal, tierSavingPct } from "@/lib/commerce";
import { sellerById } from "@/lib/catalog/sellers";
import { products } from "@/lib/catalog/products";
import { useReducedMotion } from "@/lib/use-media";

/** Minutes until the 5pm same-day dispatch cutoff, shopper-local. Client-only. */
export function useCutoff() {
  const [label, setLabel] = useState<string | null>(null);
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const cut = new Date(now);
      cut.setHours(17, 0, 0, 0);
      if (now > cut) cut.setDate(cut.getDate() + 1);
      const mins = Math.round((cut.getTime() - now.getTime()) / 60000);
      setLabel(`${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, "0")}m`);
    };
    tick();
    const t = setInterval(tick, 30000);
    return () => clearInterval(t);
  }, []);
  return label;
}

function alternativeFor(p: Product) {
  const same = products.filter((x) => x.category === p.category && x.id !== p.id && x.subcategory === p.subcategory);
  const pool = same.length ? same : products.filter((x) => x.category === p.category && x.id !== p.id);
  const cheaper = pool.filter((x) => x.price < p.price).sort((a, b) => b.rating - a.rating)[0];
  if (cheaper) return { product: cheaper, diff: Math.round(p.price - cheaper.price), why: "" };
  const faster = pool.filter((x) => x.delivery.max < p.delivery.max)[0];
  if (faster) return { product: faster, diff: 0, why: "arrives sooner" };
  return pool[0] ? { product: pool[0], diff: 0, why: "similar, different style" } : null;
}

/**
 * `alternatives` (product id → better option) lets the page supply answers that
 * don't repeat products shown elsewhere; `null` means none is free to suggest.
 * Without it, the card works out its own alternative from the full catalogue.
 */
function toAlternative(p: Product, product: Product | null) {
  if (!product) return null;
  const diff = Math.round(p.price - product.price);
  return diff > 0 ? { product, diff, why: "" } : { product, diff: 0, why: "similar, different style" };
}

export function ClarityCard({ items, alternatives }: { items: Product[]; alternatives?: Record<string, Product | null> }) {
  const { fmt } = usePrefs();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const cutoff = useCutoff();
  const p = items[i];
  const seller = sellerById(p.sellerId);
  const stock = stockSignal(p);
  const insight = priceInsight(p);
  const alt = alternatives ? toAlternative(p, alternatives[p.id] ?? null) : alternativeFor(p);
  const t2 = p.b2b.tiers[1];

  useEffect(() => {
    if (paused || reduced) return;
    const t = setTimeout(() => setI((n) => (n + 1) % items.length), 7000);
    return () => clearTimeout(t);
  }, [i, paused, reduced, items.length]);

  const rows: { q: string; a: React.ReactNode; icon: "sparkle" | "box" | "truck" | "shield" | "compare" | "layers" | "returns" }[] = [
    { q: "Why buy it", icon: "sparkle", a: p.brief.pros[0] },
    { q: "Available", icon: "box", a: <span className="inline-flex items-center gap-2"><SignalDot tone={stock.tone} live /> {stock.label}</span> },
    {
      q: "Arrives",
      icon: "truck",
      a: (
        <>
          <span className="font-medium">{deliveryLabel(p)}</span>
          {cutoff && <span className="text-mute"> — order within <span className="num">{cutoff}</span></span>}
        </>
      ),
    },
    { q: "Seller", icon: "shield", a: <>{seller.name} · <span className="num">{seller.onTime}%</span> on time</> },
    {
      q: "Better option?",
      icon: "compare",
      a: alt ? (
        <Link href={`/p/${alt.product.slug}`} className="link-underline">
          {alt.product.name} — {alt.diff > 0 ? <span className="num">{fmt(alt.diff)} less</span> : alt.why}
        </Link>
      ) : alternatives ? (
        <Link href={`/c/${p.category}`} className="link-underline">
          Compare similar {p.subcategory.toLowerCase()}
        </Link>
      ) : (
        "This is the top-rated option"
      ),
    },
    { q: "In bulk?", icon: "layers", a: t2 ? <>{tierSavingPct(p, t2.price)}% off from {t2.min} {p.b2b.unit === "unit" ? "units" : p.b2b.unit}</> : "Volume pricing on request" },
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[32px] bg-white shadow-[var(--shadow-lift)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Ayiin Clarity — every answer before you buy"
    >
      {/* Header: the Clarity mark and the carousel progress */}
      <div className="flex items-center justify-between gap-4 px-5 pt-5 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full bg-mist py-1.5 pl-3 pr-3 text-[12px] font-medium ring-1 ring-line">
          <AyiinLogo on="light" className="h-4" />
          Clarity
        </span>
          <div className="flex w-28 gap-1.5">
          {items.map((it, n) => (
            <button
              key={it.id}
              type="button"
              aria-label={`Show ${it.name}`}
              aria-current={n === i}
              onClick={() => setI(n)}
              className="group relative flex h-6 flex-1 items-center"
            >
              <span className="relative h-[3px] w-full overflow-hidden rounded-full bg-ink/10">
              <span
                key={`${i}-${paused}`}
                className={clsx("absolute inset-y-0 left-0 rounded-full bg-ink", n < i && "w-full", n > i && "w-0")}
                style={n === i ? { width: paused || reduced ? "100%" : undefined, animation: paused || reduced ? undefined : "clarity-progress 7s linear forwards" } : undefined}
              />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 pt-4 sm:p-6 sm:pt-4 lg:pb-[clamp(14px,2.4vh,24px)]">
        <div key={p.id} className="animate-fade">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[12.5px] text-mute">{p.brand}</p>
              <h3 className="mt-0.5 text-[18px] font-medium leading-tight tracking-[-0.02em] short:text-[17px]">
                <Link href={`/p/${p.slug}`} className="hover:underline">{p.name}</Link>
              </h3>
            </div>
            <div className="text-right">
              <Price usd={p.price} size="lg" />
              {insight.verifiedDeal && <p className="mt-1 whitespace-nowrap text-[11.5px] font-medium text-brand-deep">✓ {insight.label}</p>}
            </div>
          </div>
          <dl className="mt-4 divide-y divide-line border-t border-line lg:mt-[clamp(10px,1.6vh,16px)]">
            {rows.map((r, n) => (
              <div key={r.q} className="grid animate-rise grid-cols-[118px_1fr] items-baseline gap-3 py-2.5 text-[13.5px] lg:py-[clamp(4px,0.9vh,10px)]" style={{ animationDelay: `${120 + n * 70}ms` }}>
                <dt className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">
                  <Icon name={r.icon} size={13} className="shrink-0 translate-y-[1px]" />
                  {r.q}
                </dt>
                <dd className="text-ink-2">{r.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <style>{`@keyframes clarity-progress{from{width:0}to{width:100%}}`}</style>
    </div>
  );
}
