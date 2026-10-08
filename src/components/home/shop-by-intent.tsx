"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { products } from "@/lib/catalog/products";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow } from "@/components/ui/signal";
import { Icon, type IconName } from "@/components/ui/icon";

type IntentDef = {
  id: string;
  label: string;
  icon: IconName;
  query: string;
  kicker: string;
  description: string;
  match: (p: Product) => boolean;
  sort?: (a: Product, b: Product) => number;
};

const INTENTS: IntentDef[] = [
  {
    id: "workspace",
    label: "For Your Workspace",
    icon: "sparkle",
    query: "/search?q=for+work",
    kicker: "Focus & Productivity",
    description: "Quiet keyboards, 4K color-accurate displays, and task seating built for long hours.",
    match: (p) =>
      p.category === "office" ||
      p.useCases.includes("office") ||
      p.subcategory === "Laptops" ||
      p.subcategory === "Monitors" ||
      p.subcategory === "Peripherals",
    sort: (a, b) => b.soldLastWeek - a.soldLastWeek,
  },
  {
    id: "travel",
    label: "For Travel",
    icon: "truck",
    query: "/search?q=for+travel",
    kicker: "Considered In Transit",
    description: "Adaptive flight noise cancelling, weatherproof carry, and all-day hydration.",
    match: (p) => p.useCases.includes("travel") || p.useCases.includes("commute"),
    sort: (a, b) => b.rating - a.rating,
  },
  {
    id: "home",
    label: "For Your Home",
    icon: "box",
    query: "/search?q=for+home",
    kicker: "Spaces for Living",
    description: "Sculptural lamps, hand-finished stoneware, and cozy natural fibers.",
    match: (p) => p.category === "home-living" || p.useCases.includes("home"),
    sort: (a, b) => b.soldLastWeek - a.soldLastWeek,
  },
  {
    id: "gifting",
    label: "For Gifting",
    icon: "sparkle",
    query: "/search?q=gift",
    kicker: "Considered Presents",
    description: "Wheel-thrown bud vases, automatic timepieces, and gift-wrapped fragrances.",
    match: (p) => p.useCases.includes("gift"),
    sort: (a, b) => b.rating - a.rating,
  },
  {
    id: "under50",
    label: "Under $50",
    icon: "tag",
    query: "/search?q=under+%2450",
    kicker: "Everyday Value",
    description: "High-grade essentials, ceramics, and serums without excess markup.",
    match: (p) => p.price <= 50,
    sort: (a, b) => b.soldLastWeek - a.soldLastWeek,
  },
  {
    id: "tomorrow",
    label: "Arrives Tomorrow",
    icon: "clock",
    query: "/search?fast=1",
    kicker: "Fast Dispatch",
    description: "In-stock products with same-day order cutoffs for next-day delivery.",
    match: (p) => p.delivery.min <= 1 || p.delivery.max <= 1,
    sort: (a, b) => b.soldLastWeek - a.soldLastWeek,
  },
  {
    id: "bestRated",
    label: "Best Rated",
    icon: "star",
    query: "/search?sort=rating",
    kicker: "Verified Buyer Praise",
    description: "Products with 4.7+ customer ratings and zero compromises on materials.",
    match: (p) => p.rating >= 4.7,
    sort: (a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount,
  },
];

export function ShopByIntent() {
  const [activeId, setActiveId] = useState<string>("workspace");
  const activeIntent = INTENTS.find((i) => i.id === activeId) ?? INTENTS[0];

  const matchedProducts = useMemo(() => {
    const list = products.filter(activeIntent.match);
    if (activeIntent.sort) list.sort(activeIntent.sort);
    return list.slice(0, 4);
  }, [activeIntent]);

  return (
    <section
      aria-label="Shop by intent"
      className="fold rounded-panel border border-line bg-white p-5 sm:p-7 lg:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow index="02">Intent Discovery</Eyebrow>
          <h2 className="display mt-3 text-heading tracking-[-0.02em] sm:text-display-sm">
            Shop by intent.
          </h2>
          <p className="mt-2 text-body text-mute">
            Start from what it&apos;s for — the right pieces from every department, in one place.
          </p>
        </div>
        <Link
          href={activeIntent.query}
          className="link-underline inline-flex items-center gap-1.5 text-support font-medium text-brand-deep self-start sm:self-auto"
        >
          <span>View all in {activeIntent.label}</span>
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>

      {/* Intent switcher pills */}
      <div
        role="tablist"
        aria-label="Discovery intents"
        className="scroll-x -mx-5 mt-5 flex shrink-0 gap-2 px-5 pb-1 sm:-mx-7 sm:px-7 lg:-mx-8 lg:px-8"
      >
        {INTENTS.map((intent) => {
          const isSelected = intent.id === activeId;
          return (
            <button
              key={intent.id}
              role="tab"
              id={`intent-tab-${intent.id}`}
              aria-selected={isSelected}
              aria-controls={`intent-panel-${intent.id}`}
              onClick={() => setActiveId(intent.id)}
              suppressHydrationWarning
              className={clsx(
                "group flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-support font-medium transition-all duration-200",
                isSelected
                  ? "bg-ink text-white shadow-[0_2px_10px_rgb(var(--rgb-ink)/0.2)]"
                  : "bg-porcelain text-ink-2 hover:bg-mist hover:text-ink ring-1 ring-line",
              )}
            >
              <Icon
                name={intent.icon}
                size={14}
                className={clsx(
                  isSelected ? "text-brand" : "text-mute group-hover:text-ink",
                )}
              />
              <span>{intent.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active intent mood line */}
      <div
        id={`intent-panel-${activeIntent.id}`}
        role="tabpanel"
        aria-labelledby={`intent-tab-${activeIntent.id}`}
        className="mt-4 flex shrink-0 flex-col gap-2 rounded-control bg-porcelain/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-meta uppercase tracking-wider text-brand-deep font-semibold">
            {activeIntent.kicker}
          </span>
          <span className="text-mute">·</span>
          <p className="text-support text-ink-2">{activeIntent.description}</p>
        </div>
        <Link
          href={activeIntent.query}
          className="shrink-0 text-meta font-medium text-ink hover:text-brand-deep hover:underline"
        >
          Explore collection →
        </Link>
      </div>

      {/* Matched product cards */}
      <div className="fold-body mt-6 lg:flex lg:items-end lg:justify-center">
        <div className="fold-grid [--cols:4]">
          {matchedProducts.map((p) => (
            <div key={p.id} className="animate-fade">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
