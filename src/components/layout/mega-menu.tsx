"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { categories } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { ProductArt } from "@/components/product/product-art";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { deliveryLabel } from "@/lib/commerce";
import { SignalDot } from "@/components/ui/signal";

export function MegaMenu({ onClose }: { onClose: () => void }) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const ordered = business ? [...categories].sort((a, b) => Number(b.business) - Number(a.business)) : categories;
  const [active, setActive] = useState(ordered[0].slug);
  const cat = categories.find((c) => c.slug === active)!;
  const items = productsByCategory(cat.slug);
  const featured = [...items].sort((a, b) => b.soldLastWeek - a.soldLastWeek)[0];
  const fastCount = items.filter((p) => p.delivery.max <= 1).length;

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
                  "group flex items-center justify-between rounded-xl px-3 py-2.5 text-[15px] transition-colors",
                  active === c.slug ? "bg-white text-ink shadow-[var(--shadow-hair)]" : "text-ink-2 hover:text-ink",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: active === c.slug ? c.accent : "transparent", boxShadow: `inset 0 0 0 1.5px ${c.accent}` }} />
                  {c.name}
                </span>
                {business && c.business && <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">Bulk</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="display text-[40px]">{cat.name}</h2>
          <Link href={`/c/${cat.slug}`} onClick={onClose} className="link-underline shrink-0 text-[14px] font-medium">
            Shop all {cat.short.toLowerCase()} →
          </Link>
        </div>
        <p className="mt-2 max-w-xl text-[15px] text-mute">{cat.blurb}</p>
        <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 sm:grid-cols-3">
          {cat.subcategories.map((s) => (
            <Link
              key={s}
              href={`/c/${cat.slug}?sub=${encodeURIComponent(s)}`}
              onClick={onClose}
              className="border-b border-line py-2.5 text-[14.5px] text-ink-2 transition-colors hover:border-ink hover:text-ink"
            >
              {s}
            </Link>
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-[var(--shadow-hair)]">
          <p className="eyebrow flex items-center gap-2">
            <Icon name="sparkle" size={13} /> {cat.guide.title}
          </p>
          <ul className="mt-3 grid gap-2 text-[13.5px] text-ink-2 sm:grid-cols-3">
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

      {featured && (
        <Link
          href={`/p/${featured.slug}`}
          onClick={onClose}
          className="group hidden overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-hair)] lg:block"
        >
          <ProductArt
            kind={featured.kind}
            color={featured.variants[0].color}
            accent={featured.variants[0].accent}
            tint={featured.tint}
            className="aspect-[4/3.4] w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
          />
          <div className="p-5">
            <p className="eyebrow">Most bought this week</p>
            <p className="mt-1.5 text-[15px] font-medium leading-snug">{featured.name}</p>
            <div className="mt-2 flex items-center justify-between text-[13px]">
              <span className="num font-medium">{fmt(business ? featured.b2b.tiers[featured.b2b.tiers.length - 1].price : featured.price)}{business && <span className="text-mute"> at volume</span>}</span>
              <span className="inline-flex items-center gap-1.5 text-mute">
                <SignalDot /> {deliveryLabel(featured)}
              </span>
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
