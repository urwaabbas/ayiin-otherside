"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { productBySlug } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";

type EditStory = {
  id: string;
  title: string;
  kicker: string;
  blurb: string;
  featuredSlug: string;
  featuredView?: "scene" | "hero";
  productSlugs: string[];
  ctaLabel: string;
  href: string;
};

const EDITS: EditStory[] = [
  {
    id: "workspace",
    title: "The New Workspace",
    kicker: "Focus & Acoustics",
    blurb:
      "A considered setup for quiet uninterrupted flow: fanless processing, 4D task seating, and low-profile tactile typing.",
    featuredSlug: "kova-book-14-air",
    featuredView: "scene",
    productSlugs: [
      "ergo-task-chair-pro",
      "arc-table-lamp",
      "kova-keys-low-profile",
    ],
    ctaLabel: "Shop Workspace Edit",
    href: "/search?q=office",
  },
  {
    id: "hosting",
    title: "Weekend Hosting",
    kicker: "Morning Gatherings",
    blurb:
      "Precise temperature pour-overs, satin-glazed stoneware mugs, and room-filling 360° sound for slow mornings.",
    featuredSlug: "pour-gooseneck-kettle",
    featuredView: "scene",
    productSlugs: [
      "everyday-stoneware-mugs",
      "ember-soy-candle",
      "halo-speaker-mini",
    ],
    ctaLabel: "Shop Hosting Edit",
    href: "/search?q=coffee+and+home",
  },
  {
    id: "travel",
    title: "Travel Edit",
    kicker: "Considered In Transit",
    blurb:
      "Class-leading -38 dB flight noise cancelling, insulated temperature hold, and clamshell weatherproof packs.",
    featuredSlug: "aurel-anc-over-ear",
    featuredView: "hero",
    productSlugs: [
      "transit-daypack-22",
      "trail-bottle-750",
      "solstice-sunglasses",
    ],
    ctaLabel: "Shop Travel Edit",
    href: "/search?q=travel",
  },
  {
    id: "upgrades",
    title: "Everyday Upgrades",
    kicker: "Tactile Essentials",
    blurb:
      "Small daily essentials engineered with honest materials, unhurried craft, and repairable longevity.",
    featuredSlug: "stride-runner-2",
    featuredView: "hero",
    productSlugs: [
      "stoneware-bud-vases",
      "night-recovery-oil",
      "meridian-automatic-38",
    ],
    ctaLabel: "Shop Upgrades",
    href: "/search?sort=popular",
  },
];

export function AyiinEdit() {
  const [activeId, setActiveId] = useState("workspace");
  const story = EDITS.find((e) => e.id === activeId) ?? EDITS[0];

  const featured = productBySlug(story.featuredSlug);
  const sideProducts = story.productSlugs
    .map(productBySlug)
    .filter(Boolean) as Product[];

  return (
    <section aria-label="The Ayiin Edit" className="space-y-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Eyebrow index="03">Curation</Eyebrow>
          <h2 className="display mt-2 text-heading tracking-[-0.02em] sm:text-display-sm">
            The Ayiin Edit.
          </h2>
          <p className="mt-1 text-body text-mute">
            Considered product collections gathered around real moments of living and work.
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Ayiin Edit collections"
          className="flex flex-wrap gap-1.5"
        >
          {EDITS.map((e) => {
            const active = e.id === activeId;
            return (
              <button
                key={e.id}
                role="tab"
                id={`edit-tab-${e.id}`}
                aria-selected={active}
                onClick={() => setActiveId(e.id)}
                suppressHydrationWarning
                className={clsx(
                  "chip text-support transition-all",
                  active
                    ? "!bg-ink !text-white !border-ink shadow-[0_2px_8px_rgb(var(--rgb-ink)/0.18)]"
                    : "hover:bg-mist",
                )}
              >
                <span>{e.title}</span>
                {active && <SignalDot tone="brand" live />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Composition: Editorial Hero Feature + 3 Companion Product Cards */}
      <div className="grid gap-5 lg:grid-cols-12">
        {/* Left: Curated Story Spotlight */}
        {featured && (
          <div className="overflow-hidden rounded-surface border border-line bg-white shadow-[var(--shadow-hair)] lg:col-span-4 flex flex-col justify-between">
            <Link
              href={`/p/${featured.slug}`}
              className="group relative block aspect-[16/9] w-full overflow-hidden bg-mist"
              aria-label={featured.name}
            >
              <ProductImage
                product={featured}
                view={story.featuredView ?? "hero"}
                sizes="(min-width: 1024px) 420px, 95vw"
                className="h-full w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                imgClassName="!object-cover"
              />
              <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-meta font-medium shadow-[var(--shadow-hair)] backdrop-blur">
                <SignalDot tone="brand" live />
                Curated anchor
              </span>
            </Link>

            <div className="p-5 sm:p-6 flex flex-col flex-1 justify-between">
              <div>
                <p className="eyebrow text-brand-deep">{story.kicker}</p>
                <h3 className="display mt-1.5 text-heading leading-tight tracking-[-0.02em] sm:text-display-xs">
                  {story.title}
                </h3>
                <p className="mt-2 text-support leading-relaxed text-ink-2 line-clamp-3">
                  {story.blurb}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line/80 pt-4">
                <div>
                  <p className="text-meta text-mute">Featured anchor piece</p>
                  <Link
                    href={`/p/${featured.slug}`}
                    className="mt-0.5 block text-support font-semibold text-ink hover:text-brand-deep hover:underline"
                  >
                    {featured.name} →
                  </Link>
                </div>
                <Link
                  href={story.href}
                  className="btn btn-secondary text-support h-10 px-4"
                >
                  <span>{story.ctaLabel}</span>
                  <Icon name="arrowRight" size={14} />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Right: Companion Product Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-8">
          {sideProducts.map((p) => (
            <div key={p.id} className="animate-fade flex flex-col">
              <ProductCard product={p} className="h-full" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
