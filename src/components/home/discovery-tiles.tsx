"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { Icon } from "@/components/ui/icon";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { PRODUCT_PHOTOS } from "@/lib/catalog/photos";
import { photoFullUrl } from "@/lib/images";

type TileConfig = {
  id: string;
  name: string;
  tagline: string;
  count: string;
  href: string;
  image: string;
  position: string;
  spanClass: string;
  aspectClass: string;
  pillColor?: string;
  compact?: boolean;
};

const TILES: TileConfig[] = [
  {
    id: "home",
    name: "Home & Living",
    tagline: "Spaces to restore · Tactile furniture & ceramics",
    count: "1,840 items",
    href: "/c/home-living",
    image: photoFullUrl(PRODUCT_PHOTOS["loom-lounge-chair"]["oat"]["hero"]!, 1200),
    position: "50% 50%",
    spanClass: "lg:col-span-5 lg:row-span-2",
    aspectClass: "aspect-[4/5] sm:aspect-[1/1] lg:aspect-auto lg:h-full min-h-[380px] lg:min-h-[540px]",
    pillColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
  },
  {
    id: "work",
    name: "Office & Focus",
    tagline: "Architectural tools · Precision displays & seating",
    count: "940 items",
    href: "/c/office",
    image: photoFullUrl(PRODUCT_PHOTOS["kova-book-14-air"]["silver"]["scene"]!, 1200),
    position: "50% 40%",
    spanClass: "lg:col-span-7",
    aspectClass: "aspect-[16/9] sm:aspect-[2/1] min-h-[250px]",
    pillColor: "bg-blue-500/20 text-blue-200 border-blue-500/30",
  },
  {
    id: "audio",
    name: "Audio & Tech",
    tagline: "Acoustic precision · ANC & wireless sound",
    count: "620 items",
    href: "/c/audio-tech",
    image: photoFullUrl(PRODUCT_PHOTOS["aurel-anc-over-ear"]["graphite"]["hero"]!, 800),
    position: "50% 55%",
    spanClass: "lg:col-span-4",
    aspectClass: "aspect-[4/5] min-h-[260px]",
    pillColor: "bg-zinc-500/20 text-zinc-200 border-zinc-500/30",
  },
  {
    id: "fashion",
    name: "Style & Carry",
    tagline: "Everyday utility · Commuter packs & watches",
    count: "780 items",
    href: "/c/fashion",
    image: photoFullUrl(PRODUCT_PHOTOS["transit-daypack-22"]["ink"]["hero"]!, 800),
    position: "50% 50%",
    spanClass: "lg:col-span-3",
    aspectClass: "aspect-[4/5] min-h-[260px]",
    pillColor: "bg-emerald-500/20 text-emerald-200 border-emerald-500/30",
  },
  {
    id: "supplies",
    name: "Packaging & Supplies",
    tagline: "Eco mailers & shipping cartons",
    count: "340 items",
    href: "/c/supplies",
    image: photoFullUrl(PRODUCT_PHOTOS["kraft-mailer-boxes"]["kraft"]["hero"]!, 800),
    position: "50% 35%",
    spanClass: "lg:col-span-3",
    aspectClass: "aspect-[16/9] sm:aspect-[2/1] lg:aspect-auto lg:flex-1 min-h-[115px]",
    pillColor: "bg-amber-500/20 text-amber-200 border-amber-500/30",
    compact: true,
  },
  {
    id: "kitchen",
    name: "Kitchen & Brew",
    tagline: "Morning rituals · Precision kettles & stoneware",
    count: "540 items",
    href: "/c/kitchen",
    image: photoFullUrl(PRODUCT_PHOTOS["pour-gooseneck-kettle"]["matte-black"]["scene"]!, 1200),
    position: "60% 45%",
    spanClass: "lg:col-span-7",
    aspectClass: "aspect-[16/9] sm:aspect-[2/1] min-h-[250px]",
    pillColor: "bg-orange-500/20 text-orange-200 border-orange-500/30",
  },
  {
    id: "beauty",
    name: "Beauty & Rituals",
    tagline: "Clean formulations · Serums & restorative oils",
    count: "410 items",
    href: "/c/beauty",
    image: photoFullUrl(PRODUCT_PHOTOS["night-recovery-oil"]["30"]["scene"]!, 800),
    position: "50% 50%",
    spanClass: "sm:col-span-2 lg:col-span-5",
    aspectClass: "aspect-[4/5] sm:aspect-[16/9] lg:aspect-auto min-h-[250px]",
    pillColor: "bg-rose-500/20 text-rose-200 border-rose-500/30",
  },
];

function TileCard({ t }: { t: TileConfig }) {
  const isCompact = t.compact;

  return (
    <Link
      href={t.href}
      className={clsx(
        "group relative overflow-hidden rounded-[24px] border border-line bg-ink text-white shadow-[var(--shadow-hair)] transition-all duration-500 hover:shadow-[var(--shadow-lift)]",
        t.spanClass,
        t.aspectClass,
      )}
    >
      {/* Background Photographic Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={t.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-105"
        style={{ objectPosition: t.position }}
      />

      {/* Gradient Scrim */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-opacity duration-300 group-hover:opacity-90"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40"
      />

      {/* Content Overlay */}
      <div
        className={clsx(
          "relative z-10 flex h-full flex-col justify-between",
          isCompact ? "p-4 sm:p-5" : "p-6 sm:p-7",
        )}
      >
        {/* Top metadata pill */}
        <div className="flex items-center justify-between">
          <span
            className={clsx(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-meta font-medium backdrop-blur-md",
              t.pillColor || "bg-white/10 text-white/90 border-white/20",
            )}
          >
            <SignalDot tone="brand" live />
            {t.count}
          </span>

          <span
            className={clsx(
              "grid place-items-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:bg-brand group-hover:text-ink group-hover:border-brand",
              isCompact ? "h-8 w-8" : "h-9 w-9",
            )}
          >
            <Icon name="arrowRight" size={isCompact ? 13 : 14} />
          </span>
        </div>

        {/* Bottom title & tagline */}
        <div>
          <h3
            className={clsx(
              "display text-balance tracking-[-0.02em] text-white transition-transform duration-300 group-hover:translate-x-1",
              isCompact
                ? "text-[16px] sm:text-[17px] font-bold leading-tight"
                : "text-heading sm:text-display-xs leading-[1.05]",
            )}
          >
            {t.name}
          </h3>
          <p
            className={clsx(
              "text-white/80 leading-snug",
              isCompact ? "line-clamp-1 text-[12px] mt-0.5" : "line-clamp-2 text-support mt-1.5",
            )}
          >
            {t.tagline}
          </p>
          {!isCompact && (
            <span className="mt-3 inline-flex items-center gap-1 text-meta font-medium text-brand transition-all duration-300 group-hover:gap-2">
              <span>Explore category</span>
              <Icon name="chevronRight" size={12} />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function DiscoveryTiles() {
  const homeTile = TILES[0];
  const workTile = TILES[1];
  const audioTile = TILES[2];
  const fashionTile = TILES[3];
  const suppliesTile = TILES[4];
  const kitchenTile = TILES[5];
  const beautyTile = TILES[6];

  return (
    <section aria-label="Shop the way you think" className="relative">
      {/* Editorial Header */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:mb-8 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <Eyebrow index="DISCOVERY">Departments</Eyebrow>
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-medium text-brand-deep sm:inline-flex">
              <SignalDot tone="brand" live />
              Curated taxonomy
            </span>
          </div>
          <h2 className="display mt-1 text-display-xs leading-tight tracking-[-0.02em] sm:text-display-sm lg:text-display-md text-ink">
            Shop the way you think.
          </h2>
          <p className="mt-1 text-body text-ink-2 max-w-xl">
            Enter the marketplace by lifestyle context, space, or daily ritual. Each department is vetted for craftsmanship, price integrity, and authentic stock.
          </p>
        </div>

        <Link
          href="/search"
          className="link-underline flex items-center gap-1.5 text-support font-medium text-brand-deep shrink-0 self-start sm:self-auto"
        >
          <span>All 8 departments & categories</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      {/* Controlled Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        {/* 01 · Home & Living (Left Anchor, spans 2 rows) */}
        <TileCard t={homeTile} />

        {/* 02 · Office & Focus (Top Right Wide) */}
        <TileCard t={workTile} />

        {/* 03 · Audio & Tech (Bottom Middle) */}
        <TileCard t={audioTile} />

        {/* 04 & 05 · Column 10-12 (Style & Carry + Packaging & Supplies) */}
        <div className="contents sm:contents lg:col-span-3 lg:flex lg:flex-col lg:gap-5 lg:h-full">
          <TileCard t={fashionTile} />
          <TileCard t={suppliesTile} />
        </div>

        {/* 06 · Kitchen & Brew (Bottom Left Wide) */}
        <TileCard t={kitchenTile} />

        {/* 07 · Beauty & Rituals (Bottom Right) */}
        <TileCard t={beautyTile} />
      </div>
    </section>
  );
}
