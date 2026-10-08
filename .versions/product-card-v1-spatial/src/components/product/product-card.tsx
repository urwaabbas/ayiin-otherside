"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product, Variant } from "@/lib/types";
import { productPhoto, productViews, type ImageView } from "@/lib/images";
import { ProductImage } from "@/components/product/product-image";
import { QuickView } from "@/components/product/quick-view";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/money";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import { bestTier, deliveryLabel, priceInsight, savingsPct, stockSignal } from "@/lib/commerce";
import { compact } from "@/lib/format";

/** Layout adaptations of the one card — never different designs. */
export type ProductCardLayout = "default" | "compact" | "featured";

/** Every card image is a 4:5 portrait stage. Photography is cut to it at the CDN. */
const RATIO = 1.25;
const SIZES: Record<ProductCardLayout, string> = {
  default: "(min-width: 1280px) 300px, (min-width: 1024px) 24vw, (min-width: 640px) 32vw, 48vw",
  compact: "(min-width: 640px) 220px, 46vw",
  featured: "(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 92vw",
};
const MAX_SWATCHES = 5;
const ADDED_MS = 2600;

type Frame = { colour: Variant; pick: ImageView; hover: boolean };

/** The photograph on stage for a state: the chosen view, or — while a pointer rests on the card — the in-context shot. */
function frameOf(p: Product, { colour, pick, hover }: Frame) {
  const views = productViews(p, colour.id);
  const picked = views.some((v) => v.id === pick) ? pick : "hero";
  const reveal = views.find((v) => v.id === "scene") ?? views.find((v) => v.id === "angle") ?? views[1];
  const view: ImageView = picked !== "hero" ? picked : hover && reveal ? reveal.id : "hero";
  return { key: `${colour.id}|${view}`, view, views };
}

/**
 * The Ayiin product object — the single product card used on every surface (home, search,
 * categories, wishlist, rails, recommendations, recently viewed).
 *
 * At rest it is a photograph and three facts: brand, name, price. When a pointer arrives the
 * stage lifts and turns to the product's next view, a glass rail offers the other views, the
 * quick action rises out of the glass and the delivery line resolves under the price. Touch
 * screens get the same controls permanently and sized for a thumb: tap the dots for the next
 * view, the glass bag to add, the swatches to change colour. Nothing reloads or navigates
 * except the photograph and the name, which open the product page.
 *
 * `layout` adapts density (compact rails, featured showcases); the stage, glass, type and motion
 * are identical in all of them. Inside the card, breakpoints are container queries, so the card
 * responds to the space it is given rather than the window.
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
}: {
  product: Product;
  layout?: ProductCardLayout;
  /** Context label on the photograph: "AYIIN EDIT", "Featured"… Overrides rank and "New". */
  label?: string;
  /** One supporting fact under the name (featured layout), e.g. a key spec */
  note?: string;
  /** Why this product is shown here ("Because you viewed…") */
  reason?: string;
  /** Position in a ranked shelf */
  rank?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const hydrated = useHydrated();
  const wishedRaw = useShop((s) => s.wishlist.includes(p.id));
  const wished = hydrated && wishedRaw;
  const toggleWishlist = useShop((s) => s.toggleWishlist);
  const addToCart = useShop((s) => s.addToCart);
  const openCart = useUI((s) => s.openCart);

  /* ── Stage state ──────────────────────────────────────────────
     Each colour × view the shopper has asked for becomes a stacked layer. The previous
     frame stays on screen until the next one has decoded, then they cross-fade — so a
     change of view or colour never flashes a blank or a shimmer. */
  const [colour, setColour] = useState<Variant>(p.variants[0]);
  const [pick, setPick] = useState<ImageView>("hero");
  const [hover, setHover] = useState(false);
  const { key: want, view, views } = frameOf(p, { colour, pick, hover });
  const [layers, setLayers] = useState<string[]>([want]);
  const [ready, setReady] = useState<string[]>([]);
  const [failed, setFailed] = useState<string[]>([]);
  const [held, setHeld] = useState(want);
  const shown = ready.includes(want) ? want : held;
  const [engaged, setEngaged] = useState(false);

  const go = (next: Partial<Frame>) => {
    const f = { colour, pick, hover, ...next };
    const { key } = frameOf(p, f);
    setHeld(shown);
    setLayers((l) => (l.includes(key) ? l : [...l, key]));
    setColour(f.colour);
    setPick(f.pick);
    setHover(f.hover);
  };
  const markReady = useCallback((k: string) => setReady((r) => (r.includes(k) ? r : [...r, k])), []);
  const markFailed = useCallback((k: string) => {
    setFailed((r) => (r.includes(k) ? r : [...r, k]));
    setReady((r) => (r.includes(k) ? r : [...r, k]));
  }, []);

  /* ── Commerce state ── */
  const [added, setAdded] = useState(false);
  const [quick, setQuick] = useState(false);
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
  const viewIndex = Math.max(0, views.findIndex((v) => v.id === view));
  const viewLabel = views[viewIndex]?.label ?? "Front";
  const href = `/p/${p.slug}`;

  const tag = soldOut ? "Out of stock" : label ?? (rank != null ? `No. ${rank}` : p.tags.includes("new") ? "New" : null);

  const add = () => {
    if (soldOut) {
      toggleWishlist(p.id);
      return;
    }
    addToCart(p.id, colour.id, moq, business);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), ADDED_MS);
  };
  const nextView = () => {
    const n = views[(viewIndex + 1) % views.length];
    if (n) go({ pick: n.id });
  };
  const onSwatchKey = (e: React.KeyboardEvent, i: number) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const list = p.variants.slice(0, MAX_SWATCHES);
    const v = list[(i + step + list.length) % list.length];
    go({ colour: v, hover: false });
    (e.currentTarget.parentElement?.children[list.indexOf(v)] as HTMLElement | undefined)?.focus();
  };

  const addLabel = soldOut
    ? wished
      ? "Watching for restock"
      : "Notify me when back"
    : moq > 1
      ? `Add ${moq} to cart`
      : "Add to cart";

  const discovery = business
    ? `MOQ ${p.b2b.moq} · ${p.b2b.leadDays}-day lead time`
    : soldOut
      ? "Back soon"
      : `Arrives ${deliveryLabel(p)}${insight.verifiedDeal ? ` · ${insight.label}` : p.returns.free ? " · Free returns" : ""}`;

  return (
    <article
      aria-labelledby={`pc-${p.id}`}
      className={clsx("pc @container relative flex h-full flex-col", className)}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setEngaged(true);
        go({ hover: true });
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        go({ hover: false, pick: "hero" });
      }}
      onFocus={() => setEngaged(true)}
    >
      {/* ── Stage ─────────────────────────────────────────────── */}
      <div
        className={clsx("pc-stage relative isolate aspect-[4/5] overflow-hidden rounded-surface", !ready.includes(shown) && "shimmer")}
        style={{ backgroundColor: productPhoto(p, colour.id, "hero")?.color ?? p.tint }}
      >
        <Link href={href} tabIndex={-1} prefetch={priority ? true : undefined} className="absolute inset-0 block focus:outline-none">
          {layers.map((k) => {
            const [vid, vw] = k.split("|") as [string, ImageView];
            const on = k === shown;
            return (
              <span
                key={k}
                data-on={on}
                aria-hidden={!on}
                className={clsx("pc-layer absolute inset-0", on ? "opacity-100" : "opacity-0", soldOut && "grayscale-[40%]")}
              >
                <ProductImage
                  product={p}
                  variant={vid}
                  view={vw}
                  ratio={RATIO}
                  bare
                  sizes={sizes ?? SIZES[layout]}
                  preload={priority && k === layers[0]}
                  alt={on ? `${p.name}, ${colour.name}, ${viewLabel.toLowerCase()} view` : ""}
                  onLoaded={() => markReady(k)}
                  onFailed={() => markFailed(k)}
                  className="absolute inset-0"
                />
              </span>
            );
          })}
          {failed.includes(shown) && (
            <span className="absolute inset-0 grid place-items-center text-support text-mute">Image unavailable</span>
          )}
        </Link>

        {/* Context label */}
        {tag && (
          <span
            className={clsx(
              "glass pointer-events-none absolute left-2.5 top-2.5 inline-flex h-6 max-w-[calc(100%-4rem)] items-center truncate rounded-full px-2.5 font-mono text-[10px] font-medium uppercase leading-none tracking-[0.14em]",
              soldOut && "text-ink-2",
            )}
          >
            {tag}
          </span>
        )}

        {/* Save */}
        <button
          type="button"
          aria-pressed={wished}
          aria-label={wished ? `Remove ${p.name} from saved` : `Save ${p.name}`}
          title={wished ? "Saved" : "Save"}
          onClick={() => toggleWishlist(p.id)}
          suppressHydrationWarning
          data-on={wished}
          className="pc-heart glass glass-btn absolute right-2.5 top-2.5 z-10 grid h-9 w-9 place-items-center rounded-full [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:w-10"
        >
          <Icon name="heart" size={16} strokeWidth={1.7} fill={wished ? "currentColor" : "none"} />
        </button>

        {/* View rail — the product's other photographs, on pointer devices with room for it */}
        {views.length > 1 && engaged && !compactLayout && (
          <div
            role="group"
            aria-label="Views"
            data-from="right"
            style={{ "--d": "110ms" } as React.CSSProperties}
            className="pc-reveal pc-hover-only glass absolute right-2.5 top-[3.5rem] z-10 hidden flex-col gap-1 rounded-[12px] p-1 @min-[232px]:flex"
          >
            {views.map((v) => {
              const on = v.id === view;
              return (
                <button
                  key={v.id}
                  type="button"
                  aria-label={`Show ${v.label.toLowerCase()} view`}
                  aria-pressed={on}
                  onPointerEnter={() => go({ pick: v.id })}
                  onFocus={() => go({ pick: v.id })}
                  onClick={() => go({ pick: v.id })}
                  className={clsx(
                    "relative block w-8 overflow-hidden rounded-[8px] transition-[box-shadow,opacity] duration-300",
                    on ? "opacity-100 shadow-[0_0_0_1.5px_var(--color-ink)]" : "opacity-70 hover:opacity-100",
                  )}
                >
                  <ProductImage product={p} variant={colour.id} view={v.id} ratio={RATIO} sizes="48px" className="aspect-[4/5] w-full" />
                </button>
              );
            })}
          </div>
        )}

        {/* View indicator — quiet on pointer devices, a tap target on touch */}
        {views.length > 1 && (
          <>
            <span aria-hidden className="pc-rest pc-hover-only glass pointer-events-none absolute bottom-2.5 left-2.5 flex h-5 items-center gap-1 rounded-full px-2">
              <Dots count={views.length} active={viewIndex} />
            </span>
            <button
              type="button"
              onClick={nextView}
              aria-label={`Next photo of ${p.name} (${viewIndex + 1} of ${views.length})`}
              className="pc-touch-only glass absolute bottom-2.5 left-2.5 flex h-6 items-center gap-1 rounded-full px-2.5 after:absolute after:-inset-2.5 after:content-['']"
            >
              <Dots count={views.length} active={viewIndex} />
            </button>
          </>
        )}

        {/* Quick action — pointer devices: rises out of the glass on hover or keyboard focus */}
        <div
          data-from="bottom"
          data-hold={added}
          style={{ "--d": "40ms" } as React.CSSProperties}
          className="pc-reveal pc-hover-only absolute inset-x-2.5 bottom-2.5 z-10 flex gap-1.5"
        >
          {added ? (
            <div className="glass flex h-10 min-w-0 flex-1 items-center justify-between gap-2 rounded-full pl-3.5 pr-1 text-support font-medium">
              <span className="flex min-w-0 items-center gap-1.5 truncate">
                <Icon name="check" size={15} strokeWidth={2} className="shrink-0" /> Added
              </span>
              <button
                type="button"
                onClick={openCart}
                className="h-8 shrink-0 rounded-full bg-ink px-3 text-meta font-medium text-white transition-colors hover:bg-graphite-2"
              >
                View cart
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={add}
              aria-label={`${addLabel}: ${p.name}`}
              aria-pressed={soldOut ? wished : undefined}
              suppressHydrationWarning
              className="glass glass-press flex h-10 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-3 text-support font-medium"
            >
              <Icon name={soldOut ? "bell" : "bag"} size={16} className="shrink-0" />
              <span className="truncate">{addLabel}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setQuick(true)}
            aria-haspopup="dialog"
            aria-label={`Quick look at ${p.name}`}
            title="Quick look"
            className="glass glass-btn grid h-10 w-10 shrink-0 place-items-center rounded-full"
          >
            <Icon name="expand" size={15} />
          </button>
        </div>

        {/* Quick action — touch: a glass bag that turns to a check */}
        <button
          type="button"
          onClick={add}
          aria-label={`${addLabel}: ${p.name}`}
          aria-pressed={soldOut ? wished : undefined}
          suppressHydrationWarning
          className={clsx(
            "pc-touch-only glass glass-btn absolute bottom-2.5 right-2.5 z-10 grid h-10 w-10 place-items-center rounded-full",
            added && "![background:var(--color-ink)] !text-white",
          )}
        >
          <Icon name={added ? "check" : soldOut ? "bell" : "bag"} size={17} strokeWidth={added ? 2 : 1.6} fill={soldOut && wished ? "currentColor" : "none"} />
        </button>

        <span className="sr-only" aria-live="polite">
          {added ? `Added ${p.name} to cart` : ""}
        </span>
      </div>

      {/* ── Facts ─────────────────────────────────────────────── */}
      <div className={clsx("flex flex-1 flex-col px-0.5", featured ? "pt-4" : "pt-3")}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="truncate text-[11px] font-medium uppercase leading-4 tracking-[0.12em] text-mute">{p.brand}</p>
          {p.reviewCount > 0 && (
            <p className="flex shrink-0 items-center gap-1 text-meta leading-4 text-ink-2">
              <Icon name="star" size={11} fill="currentColor" strokeWidth={0} className="text-ink" />
              <span className="num">{p.rating.toFixed(1)}</span>
              <span className="num hidden text-mute @min-[240px]:inline">({compact(p.reviewCount)})</span>
              <span className="sr-only">out of 5, {p.reviewCount} ratings</span>
            </p>
          )}
        </div>

        <h3
          id={`pc-${p.id}`}
          className={clsx(
            "mt-1 line-clamp-2 text-pretty text-ink",
            featured
              ? "display min-h-[2.1em] text-emphasis !leading-[1.05] !tracking-[-0.02em] @min-[320px]:text-section"
              : "min-h-[2.5em] text-support leading-[1.25] @min-[260px]:text-[0.9375rem]",
          )}
        >
          <Link href={href} prefetch={priority ? true : undefined} className="decoration-line-hover underline-offset-[3px] hover:underline">
            {p.name}
          </Link>
        </h3>
        {featured && note && <p className="mt-2 line-clamp-1 font-mono text-meta text-ink-2">{note}</p>}

        <div className={clsx("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", featured ? "mt-3" : "mt-2")}>
          {business ? (
            <>
              <Price usd={tier.price} size={featured ? "md" : "sm"} />
              <span className="text-meta text-mute">
                /{p.b2b.unit} at {tier.min}+ · list <span className="num line-through">{fmt(p.price)}</span>
              </span>
            </>
          ) : (
            <>
              <Price usd={p.price} size={featured ? "md" : "sm"} strike={p.compareAt} />
              {off > 0 && <span className="num text-meta font-medium text-sale">−{off}%</span>}
            </>
          )}
        </div>

        {stock.urgent && !soldOut && (
          <p className="mt-1 flex items-center gap-1.5 text-meta text-warning">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-warning" />
            {stock.label}
          </p>
        )}
        {soldOut && wished && <p className="mt-1 text-meta text-ink-2">We&apos;ll tell you when it&apos;s back</p>}

        {/* Swatches + the line that resolves on hover (the row keeps its height, so nothing moves) */}
        {(p.variants.length > 1 || !compactLayout) && (
        <div className="mt-1.5 flex min-h-6 items-center gap-2.5">
          {p.variants.length > 1 && (
            <div role="radiogroup" aria-label={`${p.name} colour`} className="-ml-1 flex shrink-0 items-center">
              {p.variants.slice(0, MAX_SWATCHES).map((v, i) => {
                const on = v.id === colour.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={v.name}
                    title={v.name}
                    tabIndex={on ? 0 : -1}
                    onClick={() => go({ colour: v, hover: false })}
                    onPointerEnter={(e) => e.pointerType === "mouse" && !on && go({ colour: v, hover: false })}
                    onKeyDown={(e) => onSwatchKey(e, i)}
                    className="group/sw grid h-6 w-6 place-items-center !rounded-full [@media(pointer:coarse)]:h-8 [@media(pointer:coarse)]:w-8"
                  >
                    <span
                      className={clsx(
                        "h-3.5 w-3.5 rounded-full outline outline-1 outline-offset-2 shadow-[inset_0_0_0_1px_rgb(var(--rgb-ink)/0.14)] transition-[outline-color,transform] duration-300 ease-[var(--ease-out-expo)]",
                        on ? "outline-ink" : "outline-transparent group-hover/sw:scale-110",
                      )}
                      style={{ background: v.accent ? `linear-gradient(135deg, ${v.color} 50%, ${v.accent} 50%)` : v.color }}
                    />
                  </button>
                );
              })}
              {p.variants.length > MAX_SWATCHES && <span className="num ml-0.5 text-meta text-mute">+{p.variants.length - MAX_SWATCHES}</span>}
            </div>
          )}
          {!compactLayout && (
            <p
              data-from="top"
              style={{ "--d": "140ms" } as React.CSSProperties}
              className={clsx("pc-reveal min-w-0 truncate text-meta text-mute", p.variants.length > 1 && "@max-[219px]:hidden")}
            >
              {discovery}
            </p>
          )}
        </div>
        )}

        {reason && <p className="mt-1 line-clamp-1 text-meta text-mute">{reason}</p>}
      </div>

      {quick && <QuickView product={p} initialVariant={colour} onClose={() => setQuick(false)} />}
    </article>
  );
}

function Dots({ count, active }: { count: number; active: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={clsx(
            "h-[5px] rounded-full bg-ink transition-[width,opacity] duration-500 ease-[var(--ease-out-expo)]",
            i === active ? "w-3 opacity-90" : "w-[5px] opacity-30",
          )}
        />
      ))}
    </>
  );
}
