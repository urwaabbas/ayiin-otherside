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
import { bestTier, savingsPct } from "@/lib/commerce";

/** Layout adaptations of the one canonical AYIIN product card — never different designs. */
export type ProductCardLayout = "default" | "compact" | "featured";

/** Every card image is a 4:5 portrait stage. Photography is cut to it at the CDN. */
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
  sizes,
  priority,
  className,
}: ProductCardProps) {
  const { mode } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const wishedRaw = useShop((s) => s.wishlist.includes(p.id));
  const wished = hydrated && wishedRaw;
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);

  /* ── Colours and angles ───────────────────────────────────────
     Colours: one circle per colourway that has its own photograph. Angles: the selected colourway's
     other real photographs (front, angle, detail, in context). Both appear on hover only; hovering
     one previews it on the stage, clicking keeps it. */
  const first = p.variants[0];
  const [selected, setSelected] = useState(`${first.id}|hero`);
  const [preview, setPreview] = useState<string | null>(null);
  const activeKey = preview ?? selected;
  const [activeVariantId] = activeKey.split("|");
  const selectedVariantId = selected.split("|")[0];
  const activeVariant = p.variants.find((v) => v.id === activeVariantId) ?? first;
  const want = activeKey;
  const colours = coloursOf(p);
  const angles = anglesOf(p, selectedVariantId);

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

  const stage = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const tier = bestTier(p);
  const off = savingsPct(p);
  const soldOut = p.stock <= 0;
  const moq = business ? Math.max(p.b2b.moq, 1) : 1;
  const compactLayout = layout === "compact";
  const showDiscount = off > 0 && !soldOut && !business;
  const href = `/p/${p.slug}`;

  // Only a status that changes what you can do is worth a label; no ranks, no "New", no campaign tags.
  const tag = soldOut ? "Out of stock" : null;
  const shownAngles = angles.slice(0, compactLayout ? 3 : MAX_THUMBS);

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
        ref={stage}
        className={clsx(
          "pc-stage relative isolate w-full overflow-hidden [aspect-ratio:var(--pc-aspect,4/5)]",
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
                  "pc-layer absolute inset-0 block",
                  on ? "opacity-100" : "opacity-0 pointer-events-none",
                  soldOut && "grayscale-[35%] opacity-80",
                )}
              >
                <ProductImage
                  product={p}
                  variant={vid}
                  view={vw}
                  focal
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
            "pc-heart glass glass-btn absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full text-ink",
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

        {/* Angles: a vertical strip of the colourway's other photographs, on hover only */}
        {angles.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`${p.name} angles`}
            className="absolute right-2.5 top-12 z-20 flex flex-col items-center gap-1.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover/card:opacity-100 [@media(hover:none)]:opacity-100 [@media(pointer:coarse)]:top-[3.25rem]"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {shownAngles.map((o) => {
              const key = `${selectedVariantId}|${o.view}`;
              const on = key === activeKey;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={key === selected}
                  aria-label={o.label}
                  title={o.label}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected(key);
                    setPreview(null);
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setPreview(key);
                  }}
                  className={clsx(
                    "relative block h-9 w-9 overflow-hidden rounded-control bg-white transition-[box-shadow,opacity] duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep",
                    on
                      ? "opacity-100 shadow-[0_0_0_1.5px_var(--color-ink),0_0_0_3px_rgb(255_255_255/0.9)]"
                      : "opacity-85 shadow-[0_0_0_1px_rgb(255_255_255/0.85),0_1px_3px_rgb(var(--rgb-ink)/0.25)] hover:opacity-100",
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photoUrl(o.photo, 96, 70, 1)} alt="" loading="lazy" className="h-full w-full object-cover" />
                </button>
              );
            })}
            {angles.length > shownAngles.length && (
              <span className="glass grid h-6 min-w-6 place-items-center rounded-full px-1.5 font-mono text-[10px] font-medium text-ink">
                +{angles.length - shownAngles.length}
              </span>
            )}
          </div>
        )}

        {/* Colours: round swatches, on hover only */}
        {colours.length > 1 && (
          <div
            role="radiogroup"
            aria-label={`${p.name} colour`}
            className="glass absolute bottom-2.5 left-2.5 z-20 flex items-center gap-1.5 rounded-full px-2 py-1.5 opacity-0 transition-opacity duration-300 focus-within:opacity-100 group-hover/card:opacity-100 [@media(hover:none)]:opacity-100"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {colours.slice(0, 5).map(({ variant: v }) => {
              const key = `${v.id}|hero`;
              const on = v.id === selectedVariantId;
              return (
                <button
                  key={v.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={v.name}
                  title={v.name}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelected(key);
                    setPreview(null);
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setPreview(key);
                  }}
                  className="grid h-5 w-5 place-items-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep"
                >
                  <span
                    className={clsx(
                      "h-3.5 w-3.5 rounded-full shadow-[inset_0_0_0_1px_rgb(var(--rgb-ink)/0.18)] outline outline-1 outline-offset-2 transition-[outline-color,transform] duration-300",
                      on ? "outline-ink" : "outline-transparent hover:scale-110",
                    )}
                    style={{ background: v.color }}
                  />
                </button>
              );
            })}
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
            "glass glass-btn absolute right-2.5 bottom-2.5 z-20 grid h-8 w-8 place-items-center rounded-full text-ink",
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

      {/* ── 2. The facts: brand, name, price — one line each, on every card, everywhere ── */}
      <div className="flex flex-1 flex-col border-t border-line px-3.5 pb-3.5 pt-3">
        <p className="truncate font-mono text-[11px] font-medium uppercase leading-4 tracking-[0.12em] text-mute">
          {p.brand}
        </p>

        <h3 id={`pc-${p.id}`} className="mt-1 text-[0.9375rem] font-medium leading-[1.3] tracking-[-0.01em] text-ink">
          <Link
            href={href}
            title={p.name}
            prefetch={priority ? true : undefined}
            className="block truncate decoration-line-hover underline-offset-[3px] hover:underline"
          >
            {p.name}
          </Link>
        </h3>

        <div className="mt-2 flex items-baseline gap-x-2.5">
          {business ? (
            <Price usd={tier.price} size="sm" strike={p.price} />
          ) : (
            <Price usd={p.price} size="sm" strike={p.compareAt} />
          )}
        </div>
      </div>
    </article>
  );
}

/** Colourways that have their own photograph, one per distinct photo. */
function coloursOf(p: Product) {
  const seen = new Set<string>();
  const out: { variant: Product["variants"][number]; photo: NonNullable<ReturnType<typeof productPhoto>> }[] = [];
  for (const v of p.variants) {
    const photo = productPhoto(p, v.id, "hero");
    if (!photo || seen.has(photo.id)) continue;
    seen.add(photo.id);
    out.push({ variant: v, photo });
  }
  return out;
}

/** The real photographs of one colourway, one per distinct photo (front, angle, detail, in context). */
function anglesOf(p: Product, variantId: string) {
  const seen = new Set<string>();
  const out: { view: ImageView; label: string; photo: NonNullable<ReturnType<typeof productPhoto>> }[] = [];
  for (const v of productViews(p, variantId)) {
    const photo = productPhoto(p, variantId, v.id);
    if (!photo || seen.has(photo.id)) continue;
    seen.add(photo.id);
    out.push({ view: v.id, label: v.label, photo });
  }
  return out;
}
