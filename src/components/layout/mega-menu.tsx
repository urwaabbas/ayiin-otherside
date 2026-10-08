"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import { categories } from "@/lib/catalog/categories";
import { productBySlug, productsByCategory } from "@/lib/catalog/products";
import { productPhoto, photoUrl } from "@/lib/images";
import { Icon } from "@/components/ui/icon";
import { CategoryIcon } from "@/components/ui/category-icon";
import { usePrefs } from "@/components/providers";
import { priceInsight } from "@/lib/commerce";
import { SignalDot } from "@/components/ui/signal";

const CATEGORY_FEATURE_SLUGS: Record<string, string> = {
  "audio-tech": "aurel-anc-over-ear",
  "home-living": "loom-lounge-chair",
  "kitchen": "pour-gooseneck-kettle",
  "fashion": "transit-daypack-22",
  "beauty": "night-recovery-oil",
  "office": "ergo-task-chair-pro",
  "supplies": "double-wall-cartons-12x10x8",
  "safety": "nitrile-gloves-4mil",
};

export function MegaMenu({ onClose }: { onClose: () => void }) {
  const { mode } = usePrefs();
  const business = mode === "business";
  const ordered = business
    ? [...categories].sort((a, b) => Number(b.business) - Number(a.business))
    : categories;

  const [active, setActive] = useState(ordered[0].slug);
  const cat = categories.find((c) => c.slug === active) ?? categories[0];
  const items = productsByCategory(cat.slug);
  const fastCount = items.filter((p) => p.delivery.max <= 1).length;
  const dealCount = items.filter((p) => priceInsight(p).verifiedDeal).length;

  const featuredSlug = CATEGORY_FEATURE_SLUGS[cat.slug] ?? items[0]?.slug;
  const featuredProduct = featuredSlug ? productBySlug(featuredSlug) : null;
  const featuredPhoto = featuredProduct
    ? productPhoto(featuredProduct, undefined, "hero")
    : null;
  const featuredPhotoSrc = featuredPhoto ? photoUrl(featuredPhoto, 800, 85, 1.25) : null;

  return (
    <div className="shell grid gap-8 py-8 lg:grid-cols-[260px_1fr_320px]">
      {/* 1. Category selector list */}
      <nav aria-label="Departments">
        <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute mb-3">
          {business ? "BUSINESS DEPARTMENTS" : "SELECT DEPARTMENT"}
        </p>
        <ul className="space-y-1" role="list">
          {ordered.map((c) => {
            const isSelected = active === c.slug;
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  onClick={() => setActive(c.slug)}
                  onMouseEnter={() => setActive(c.slug)}
                  onFocus={() => setActive(c.slug)}
                  className={clsx(
                    "group flex w-full items-center justify-between rounded-control px-3.5 py-2.5 text-left text-body transition-colors",
                    isSelected
                      ? "bg-white text-ink shadow-[var(--shadow-hair)]"
                      : "text-ink-2 hover:bg-soft/70 hover:text-ink",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <CategoryIcon
                      slug={c.slug}
                      className={clsx(
                        "shrink-0 transition-colors",
                        isSelected ? "text-ink" : "text-mute group-hover:text-ink",
                      )}
                    />
                    <span className="font-medium">{c.name}</span>
                  </span>
                  {business && c.business && (
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-mute">
                      Bulk
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 2. Department Content: Subcategories & Guide */}
      <div className="min-w-0">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-brand">
              DEPARTMENT · {cat.short}
            </span>
            <h2 className="display mt-0.5 text-heading">{cat.name}</h2>
          </div>
          <Link
            href={`/c/${cat.slug}`}
            onClick={onClose}
            className="group flex items-center gap-1.5 text-support font-medium text-ink hover:text-brand transition-colors shrink-0"
          >
            <span>Shop all {cat.name}</span>
            <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <p className="mt-2 max-w-xl text-support leading-relaxed text-mute">{cat.blurb}</p>

        {/* Subcategories */}
        <div className="mt-6">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute mb-2">
            EXPLORE SUBCATEGORIES
          </p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
            {cat.subcategories.map((s) => (
              <Link
                key={s}
                href={`/c/${cat.slug}?sub=${encodeURIComponent(s)}`}
                onClick={onClose}
                className="group flex items-center justify-between border-b border-line py-2.5 text-support text-ink-2 transition-colors hover:border-ink hover:text-ink"
              >
                <span>{s}</span>
                <span className="text-meta text-mute opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Shopping Guide Box */}
        <div className="mt-6 rounded-surface border border-line/70 bg-white p-4 shadow-[var(--shadow-hair)]">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-mute flex items-center gap-2">
            <Icon name="sparkle" size={12} className="text-brand" /> {cat.guide.title}
          </p>
          <ul className="mt-2.5 grid gap-2 text-support text-ink-2 sm:grid-cols-3">
            {cat.guide.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                <span className="leading-snug">{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Context Filter Pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/c/${cat.slug}?fast=1`} onClick={onClose} className="chip">
            <SignalDot /> {fastCount > 0 ? `${fastCount} arrive tomorrow` : "Fastest delivery"}
          </Link>
          <Link href={`/c/${cat.slug}?deal=1`} onClick={onClose} className="chip">
            <Icon name="tag" size={13} /> {dealCount > 0 ? `${dealCount} verified deals` : "Verified deals"}
          </Link>
          {business && (
            <Link href={`/business?tab=quotes`} onClick={onClose} className="chip">
              <Icon name="file" size={13} /> Request wholesale quote
            </Link>
          )}
        </div>
      </div>

      {/* 3. Real Editorial Category Photo Spotlight */}
      <Link
        href={`/c/${cat.slug}`}
        onClick={onClose}
        className="group relative hidden flex-col justify-between overflow-hidden rounded-surface border border-line bg-white shadow-[var(--shadow-hair)] lg:flex"
      >
        {/* Real Product Image Stage */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-porcelain">
          {featuredPhotoSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={featuredPhotoSrc}
              alt={cat.name}
              className="h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-soft" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-3 inset-x-3 text-white">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/80">
              FEATURED IN {cat.short.toUpperCase()}
            </p>
            <p className="mt-0.5 text-[0.9375rem] font-semibold text-white truncate">
              {featuredProduct?.name ?? cat.name}
            </p>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-meta text-mute">
            <span>{items.length} curated products</span>
            <span>Audited makers</span>
          </div>
          <span className="mt-3 flex items-center gap-1.5 text-support font-medium text-ink group-hover:text-brand transition-colors">
            <span>Explore full collection</span>
            <Icon name="arrowRight" size={14} className="transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </div>
  );
}
