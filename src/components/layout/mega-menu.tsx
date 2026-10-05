"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { categories } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { priceInsight } from "@/lib/commerce";
import { SignalDot } from "@/components/ui/signal";

export function MegaMenu({ onClose }: { onClose: () => void }) {
  const { mode } = usePrefs();
  const business = mode === "business";
  const ordered = business ? [...categories].sort((a, b) => Number(b.business) - Number(a.business)) : categories;
  const [active, setActive] = useState(ordered[0].slug);
  const cat = categories.find((c) => c.slug === active)!;
  const items = productsByCategory(cat.slug);
  const fastCount = items.filter((p) => p.delivery.max <= 1).length;
  const dealCount = items.filter((p) => priceInsight(p).verifiedDeal).length;

  return (
    <div className="shell grid gap-8 py-8 lg:grid-cols-[260px_1fr_320px]">
      <nav aria-label="Categories">
        <p className="eyebrow mb-3">{business ? "Business categories first" : "Browse"}</p>
        <ul className="space-y-0.5" role="list">
          {ordered.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/c/${c.slug}`}
                onClick={onClose}
                onMouseEnter={() => setActive(c.slug)}
                onFocus={() => setActive(c.slug)}
                className={clsx(
                  "group flex items-center justify-between rounded-control px-3 py-2.5 text-body transition-colors",
                  active === c.slug ? "bg-white text-ink shadow-[var(--shadow-hair)]" : "text-ink-2 hover:text-ink",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: active === c.slug ? c.accent : "transparent", boxShadow: `inset 0 0 0 1.5px ${c.accent}` }} />
                  {c.name}
                </span>
                {business && c.business && <span className="font-mono text-meta uppercase tracking-[0.12em] text-mute">Bulk</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="display text-display-sm">{cat.name}</h2>
          <Link href={`/c/${cat.slug}`} onClick={onClose} className="link-underline shrink-0 text-support font-medium">
            Shop all {cat.short.toLowerCase()} →
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-body text-mute">{cat.blurb}</p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
          {cat.subcategories.map((s) => (
            <Link
              key={s}
              href={`/c/${cat.slug}?sub=${encodeURIComponent(s)}`}
              onClick={onClose}
              className="border-b border-line py-2.5 text-support text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-surface bg-white p-5 shadow-[var(--shadow-hair)]">
          <p className="eyebrow flex items-center gap-2">
            <Icon name="sparkle" size={13} /> {cat.guide.title}
          </p>
          <ul className="mt-3 grid gap-2 text-support text-ink-2 sm:grid-cols-3">
            {cat.guide.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/c/${cat.slug}?fast=1`} onClick={onClose} className="chip">
            <SignalDot /> {fastCount > 0 ? `${fastCount} arrive tomorrow` : "Fastest delivery"}
          </Link>
          <Link href={`/c/${cat.slug}?deal=1`} onClick={onClose} className="chip">
            <Icon name="tag" size={13} /> Verified deals
          </Link>
          {business && (
            <Link href={`/business?tab=quotes`} onClick={onClose} className="chip">
              <Icon name="file" size={13} /> Request a quote
            </Link>
          )}
        </div>
      </div>

      {/* Category summary. Deliberately product-free: the menu overlays every
          page, so a featured product here would repeat one already on screen. */}
      <Link
        href={`/c/${cat.slug}`}
        onClick={onClose}
        className="group relative hidden flex-col justify-between overflow-hidden rounded-surface p-6 shadow-[var(--shadow-hair)] lg:flex"
        style={{ background: cat.tint }}
      >
        <div>
          <p className="eyebrow">{business && cat.business ? "Bulk-ready department" : "This department"}</p>
          <p className="display mt-3 text-heading leading-[1.02]">{cat.short}</p>
        </div>
        <dl className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5">
          {[
            [String(items.length), "edited products"],
            [String(fastCount), "arrive tomorrow"],
            [String(dealCount), "verified deals"],
            [String(cat.subcategories.length), "subcategories"],
          ].map(([v, l]) => (
            <div key={l}>
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="num block text-heading font-medium tracking-[-0.03em]">{v}</span>
                <span className="block text-meta text-ink-2">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
        <span className="mt-8 inline-flex items-center gap-2 text-support font-medium">
          Shop {cat.short.toLowerCase()}
          <Icon name="arrowRight" size={16} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </Link>
    </div>
  );
}
