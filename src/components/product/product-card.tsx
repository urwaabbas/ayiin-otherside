"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { photoUrl, productPhoto, productViews, type ImageView } from "@/lib/images";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/money";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop } from "@/lib/store";
import { bestTier, deliveryLabel, priceInsight, savingsPct, stockSignal } from "@/lib/commerce";

/** Layout adaptations of the one canonical AYIIN product card — never different designs. */
export type ProductCardLayout = "default" | "compact" | "featured";

/** Every card image is a 4:5 portrait stage. Photography is cut to it at the CDN. */
const RATIO = 1.25;
const SIZES: Record<ProductCardLayout, string> = {
  default: "(min-width: 1536px) 360px, (min-width: 1280px) 320px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw",
  compact: "(min-width: 640px) 240px, 48vw",
  featured: "(min-width: 1024px) 42vw, (min-width: 768px) 50vw, 100vw",
};
const MAX_THUMBS = 4;
const ADDED_MS = 2200;

export type ProductCardProps = {
  product: Product;
  layout?: ProductCardLayout;
  /** Context label on the photograph: "AYIIN EDIT", "Featured", "Anchor piece"… */
  label?: string;
  /** One supporting fact under the name (featured layout), e.g. key spec or summary */
  note?: string;
  /** Why this product is shown here ("Because you viewed…") */
  reason?: string;
  /** Position in a ranked shelf */
  rank?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

/**
 * AYIIN Master Product Card System (2040 Spatial Language — Refined)
 *
 * Single master product component powering every surface across AYIIN:
 * Home (flagships, trending, edits, setups, rails), Shop/Category grids,
 * Search results, Wishlist, Recommendations, Recently Viewed.
 *
 * Visual & Interaction Principles:
 * - One bordered card: the 4:5 photograph is its top panel (rounded top corners from the card,
 *   square bottom edge meeting a hairline above the details).
 * - Minimal floating spatial controls (top-right wishlist disc, bottom-right compact bag disc).
 * - Image variants: real photo thumbnails (per colourway, else per view) switch the stage on hover/click.
 * - A glass discount badge sits top-left whenever there is a real saving.
 * - Zero dark horizontal background patches or strips across the card.
 * - No reviews or star clutter on the card (reserved strictly for PDP).
 * - No large pill buttons or "Add to Cart" text — refined 2040 micro-actions only.
 */
export function ProductCard({
  product: p,
  layout = "default",
  label,
  note,
  reason,
  rank,
  sizes,
  priority,
  className,
}: ProductCardProps) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const wishedRaw = useShop((s) => s.wishlist.includes(p.id));
  const wished = hydrated && wishedRaw;
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);

  /* ── Image variants ───────────────────────────────────────────
     Each thumbnail is a real photograph: one per colourway when the product
     comes in several, otherwise the product's own views (front, angle, detail,
     in context). Hover previews a thumbnail on the stage; click selects it. */
  const options = imageOptions(p);
  const [selected, setSelected] = useState(options[0].key);
  const [preview, setPreview] = useState<string | null>(null);
  const activeKey = preview ?? selected;
  const activeOption = options.find((o) => o.key === activeKey) ?? options[0];
  const activeVariant = p.variants.find((v) => v.id === activeOption.variant) ?? p.variants[0];
  const want = activeOption.key;

  const [cachedLayers, setCachedLayers] = useState<string[]>([want]);
  const [ready, setReady] = useState<string[]>([want]);
  const [failed, setFailed] = useState<string[]>([]);
  const [held, setHeld] = useState(want);

  const layers = cachedLayers.includes(want) ? cachedLayers : [...cachedLayers, want];

  const markReady = useCallback((k: string) => {
    setReady((r) => (r.includes(k) ? r : [...r, k]));
    setCachedLayers((prev) => (prev.includes(k) ? prev : [...prev, k]));
    setHeld(k);
  }, []);

  const markFailed = useCallback((k: string) => {
    setFailed((r) => (r.includes(k) ? r : [...r, k]));
    setReady((r) => (r.includes(k) ? r : [...r, k]));
  }, []);

  const shown = ready.includes(want) ? want : held;

  /* ── Commerce micro-action state ────────────────────────────── */
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const insight = priceInsight(p);
  const stock = stockSignal(p);
  const tier = bestTier(p);
  const off = savingsPct(p);
  const soldOut = p.stock <= 0;
  const moq = business ? Math.max(p.b2b.moq, 1) : 1;
  const featured = layout === "featured";
  const compactLayout = layout === "compact";
  const showDiscount = off > 0 && !soldOut && !business;
  const href = `/p/${p.slug}`;

  const tag = soldOut ? "Out of stock" : label ?? (rank != null ? `No. ${rank}` : p.tags.includes("new") ? "New" : null);
  const shownThumbs = options.slice(0, compactLayout ? 3 : MAX_THUMBS);

  const add = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (soldOut) {
      toggleWishlist(p.id);
      return;
    }
    addToCart(p.id, activeVariant.id, moq, business);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ADDED_MS);
  };

  const onThumbKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + shownThumbs.length) % shownThumbs.length;
    setSelected(shownThumbs[next].key);
    setPreview(null);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };

  const discovery = business
    ? `MOQ ${p.b2b.moq} · ${p.b2b.leadDays}-day lead time`
    : soldOut
      ? "Back soon"
      : `Arrives ${deliveryLabel(p)}${insight.verifiedDeal ? ` · ${insight.label}` : p.returns.free ? " · Free returns" : ""}`;

  return (
    <article
      aria-labelledby={`pc-${p.id}`}
      className={clsx(
        "pc group/card @container relative flex h-full flex-col overflow-hidden rounded-surface border border-line bg-white transition-colors duration-300 select-none hover:border-line-hover",
        className,
      )}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setPreview(null);
      }}
    >
      {/* ── 1. Spatial Photography Stage ────────────────────────── */}
      <div
        className={clsx(
          "pc-stage relative isolate aspect-[4/5] w-full overflow-hidden",
          !ready.includes(shown) && "shimmer",
        )}
        style={{
          backgroundColor: productPhoto(p, activeVariant.id, "hero")?.color ?? p.tint,
        }}
      >
        <Link
          href={href}
          tabIndex={-1}
          prefetch={priority ? true : undefined}
          className="absolute inset-0 block focus:outline-none"
          aria-label={p.name}
        >
          {layers.map((k) => {
            const [vid, vw] = k.split("|") as [string, ImageView];
            const on = k === shown;
            return (
              <span
                key={k}
                data-on={on}
                aria-hidden={!on}
                className={clsx(
                  "pc-layer absolute inset-0 block transition-opacity duration-300",
                  on ? "opacity-100" : "opacity-0",
                  soldOut && "grayscale-[35%] opacity-80",
                )}
              >
                <ProductImage
                  product={p}
                  variant={vid}
                  view={vw}
                  ratio={RATIO}
                  bare
                  sizes={sizes ?? SIZES[layout]}
                  preload={priority && k === layers[0]}
                  alt={on ? `${p.name}, ${activeVariant.name}` : ""}
                  onLoaded={() => markReady(k)}
                  onFailed={() => markFailed(k)}
                  className="h-full w-full"
                />
              </span>
            );
          })}
          {failed.includes(shown) && (
            <span className="absolute inset-0 grid place-items-center text-support text-mute">
              Image unavailable
            </span>
          )}
        </Link>

        {/* Top left: the discount (glass, only for a real saving) above the context tag */}
        {(showDiscount || tag) && (
          <div className="pointer-events-none absolute left-2.5 top-2.5 z-10 flex max-w-[calc(100%-4.5rem)] flex-col items-start gap-1.5">
            {showDiscount && (
              <span className="glass num inline-flex h-7 items-center rounded-full px-2.5 text-[12px] font-semibold leading-none text-ink">
                −{off}%
              </span>
            )}
            {tag && (
              <span
                className={clsx(
                  "glass inline-flex h-6 max-w-full items-center truncate rounded-full px-2.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.14em]",
                  soldOut ? "text-ink-2" : "text-ink",
                )}
              >
                {tag}
              </span>
            )}
          </div>
        )}

        {/* Liquid Glass: Wishlist Control (Top Right) */}
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from saved` : `Save ${p.name}`}
          title={wished ? "Saved" : "Save"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(p.id);
          }}
          suppressHydrationWarning
          data-on={wished}
          className={clsx(
            "pc-heart glass glass-btn absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full text-ink transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm",
            wished ? "opacity-100 text-ink" : "opacity-85 group-hover/card:opacity-100",
            "[@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9",
          )}
        >
          <Icon
            name="heart"
            size={15}
            strokeWidth={1.8}
            fill={wished ? "currentColor" : "none"}
          />
        </button>

        {/* Image variants: a vertical strip of real photo thumbnails under the wishlist control */}
        {options.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`${p.name} images`}
            className="absolute right-2.5 top-12 z-20 flex flex-col items-center gap-1.5 [@media(pointer:coarse)]:top-[3.25rem]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {shownThumbs.map((o, i) => {
              const on = o.key === activeKey;
              return (
                <button
                  key={o.key}
                  type="button"
                  role="radio"
                  aria-checked={o.key === selected}
                  aria-label={o.label}
                  title={o.label}
                  tabIndex={o.key === selected ? 0 : -1}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected(o.key);
                    setPreview(null);
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setPreview(o.key);
                  }}
                  onKeyDown={(e) => onThumbKey(e, i)}
                  className={clsx(
                    "relative block h-8 w-8 overflow-hidden rounded-control bg-white transition-[box-shadow,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep",
                    on
                      ? "opacity-100 shadow-[0_0_0_1.5px_var(--color-ink),0_0_0_3px_rgb(255_255_255/0.9)]"
                      : "opacity-80 shadow-[0_0_0_1px_rgb(255_255_255/0.85),0_1px_3px_rgb(var(--rgb-ink)/0.25)] hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(o.photo, 96, 70, 1)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              );
            })}
            {options.length > shownThumbs.length && (
              <span className="glass grid h-6 min-w-6 place-items-center rounded-full px-1.5 font-mono text-[10px] font-medium text-ink">
                +{options.length - shownThumbs.length}
              </span>
            )}
          </div>
        )}

        {/* Refined Cart/Bag Icon Action (Bottom Right) */}
        <button
          type="button"
          onClick={add}
          aria-label={
            soldOut
              ? wished
                ? "Watching for restock"
                : "Notify me when back"
              : `Add ${p.name} to bag`
          }
          aria-pressed={soldOut ? wished : undefined}
          suppressHydrationWarning
          className={clsx(
            "glass glass-btn absolute right-2.5 bottom-2.5 z-20 grid h-8 w-8 place-items-center rounded-full text-ink transition-all duration-200",
            "hover:scale-105 active:scale-95 shadow-sm",
            "opacity-0 group-hover/card:opacity-100",
            "[@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9",
            added && "![background:var(--color-ink)] !text-white shadow-md",
          )}
        >
          <Icon
            name={added ? "check" : soldOut ? "bell" : "bag"}
            size={14}
            strokeWidth={added ? 2.2 : 1.8}
            className={clsx(added && "text-white")}
            fill={soldOut && wished ? "currentColor" : "none"}
          />
        </button>

        <span className="sr-only" aria-live="polite">
          {added ? `Added ${p.name} to cart` : ""}
        </span>
      </div>

      {/* ── 2. Factual Hierarchy (Minimal, Clean, Below Stage) ── */}
      <div className={clsx("flex flex-1 flex-col border-t border-line px-3.5 pb-3.5", featured ? "pt-3.5" : "pt-3")}>
        {/* Brand (Minimal header, reviews completely removed) */}
        <p className="truncate font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-mute">
          {p.brand}
        </p>

        {/* Product Title */}
        <h3
          id={`pc-${p.id}`}
          className={clsx(
            "mt-1 text-pretty text-ink",
            featured
              ? "display min-h-[2.1em] text-emphasis !leading-[1.08] !tracking-[-0.02em] @min-[320px]:text-section"
              : "min-h-[2.4em] text-support font-medium leading-[1.25] tracking-[-0.01em] @min-[260px]:text-[0.9375rem]",
          )}
        >
          <Link
            href={href}
            prefetch={priority ? true : undefined}
            className="line-clamp-2 decoration-line-hover underline-offset-[3px] hover:underline"
          >
            {p.name}
          </Link>
        </h3>

        {/* Featured Note (Specs or Summary) */}
        {featured && note && (
          <p className="mt-1 line-clamp-2 text-support leading-relaxed text-ink-2">
            {note}
          </p>
        )}

        {/* Pricing */}
        <div
          className={clsx(
            "flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
            featured ? "mt-2.5" : "mt-1.5",
          )}
        >
          {business ? (
            <>
              <Price usd={tier.price} size={featured ? "md" : "sm"} />
              <span className="text-meta text-mute">
                /{p.b2b.unit} at {tier.min}+ · list{" "}
                <span className="num line-through">{fmt(p.price)}</span>
              </span>
            </>
          ) : (
            <>
              <Price usd={p.price} size={featured ? "md" : "sm"} strike={p.compareAt} />
            </>
          )}
        </div>

        {/* Stock Urgency Signal */}
        {stock.urgent && !soldOut && (
          <p className="mt-1 flex items-center gap-1.5 text-meta font-medium text-warning">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
            {stock.label}
          </p>
        )}
        {soldOut && wished && (
          <p className="mt-1 text-meta text-ink-2">We&apos;ll notify you when restocked</p>
        )}

        {/* Delivery / Shipping Context */}
        {!compactLayout && (
          <p className="mt-1 min-w-0 truncate text-meta text-mute">
            {discovery}
          </p>
        )}

        {reason && <p className="mt-1 line-clamp-1 text-meta text-mute">{reason}</p>}
      </div>
    </article>
  );
}

type ImageOption = {
  key: string;
  variant: string;
  view: ImageView;
  label: string;
  photo: NonNullable<ReturnType<typeof productPhoto>>;
};

/**
 * The real photographs a card can switch between: one per colourway that has its own
 * photography, otherwise the product's views. Never two thumbnails of the same photo.
 */
function imageOptions(p: Product): ImageOption[] {
  const collect = (pairs: [string, ImageView, string][]) => {
    const seen = new Set<string>();
    const out: ImageOption[] = [];
    for (const [variant, view, label] of pairs) {
      const photo = productPhoto(p, variant, view);
      if (!photo || seen.has(photo.id)) continue;
      seen.add(photo.id);
      out.push({ key: `${variant}|${view}`, variant, view, label, photo });
    }
    return out;
  };
  const first = p.variants[0];
  const byColour = collect(p.variants.map((v) => [v.id, "hero", v.name]));
  if (byColour.length > 1) return byColour;
  const byView = collect(productViews(p, first.id).map((v) => [first.id, v.id, v.label]));
  if (byView.length > 0) return byView;
  return [{ key: `${first.id}|hero`, variant: first.id, view: "hero", label: first.name, photo: productPhoto(p, first.id)! }];
}
