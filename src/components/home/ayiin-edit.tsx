"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { productBySlug } from "@/lib/catalog/products";
import { productPhoto, photoUrl } from "@/lib/images";
import { ProductCard } from "@/components/product/product-card";
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
      "kova-vista-27-4k",
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
      "guji-single-origin-1kg",
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
      "aurel-buds-pro",
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
      "clarity-niacinamide-serum",
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
  // Cropped at the CDN to the card's 4:5 frame, so the whole photograph is shown.
  const photo = featured ? productPhoto(featured, undefined, story.featuredView ?? "hero") : undefined;

  return (
    <section aria-label="The Ayiin Edit" className="fold lg:py-6">
      {/* Editorial Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-heading tracking-[-0.02em] sm:text-display-sm">
            The Ayiin Edit.
          </h2>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Ayiin Edit collections"
          className="flex flex-wrap gap-1.5 sm:max-w-[55%] sm:justify-end"
        >
          {EDITS.map((e) => {
            const active = e.id === activeId;
            return (
              <button
                key={e.id}
                role="tab"
                id={`edit-tab-${e.id}`}
                aria-selected={active}
                aria-controls="edit-panel"
                onClick={() => setActiveId(e.id)}
                suppressHydrationWarning
                className={clsx(
                  "chip text-support transition-all",
                  active ? "!border-ink !bg-ink !text-white" : "hover:bg-mist",
                )}
              >
                {e.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* Composition: full-bleed editorial card + 3 companion product cards */}
      <div
        id="edit-panel"
        role="tabpanel"
        aria-labelledby={`edit-tab-${story.id}`}
        className="fold-body mt-8 lg:mt-6 lg:flex lg:items-start"
      >
        <div className="fold-grid fold-grid-lead">
          {featured && (
            <div className="group relative col-span-full aspect-[4/5] overflow-hidden rounded-surface bg-ink text-white sm:aspect-[16/10] lg:col-span-1 lg:aspect-auto">
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={photo.id}
                  src={photoUrl(photo, 900, 82, 1.25)}
                  alt={featured.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                />
              )}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

              <div className="relative flex h-full flex-col justify-end p-6 lg:p-7">
                <div>
                  <h3 className="display text-heading leading-[0.98] tracking-[-0.02em] text-white">
                    {story.title}
                  </h3>
                  <Link
                    href={story.href}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-support font-semibold text-ink transition-colors duration-300 hover:bg-brand"
                  >
                    <span>{story.ctaLabel}</span>
                    <Icon name="arrowRight" size={15} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {sideProducts.map((p) => (
            <div key={p.id} className="animate-fade">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
