"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { Product } from "@/lib/types";
import type { SceneChapter } from "@/lib/discover/evening";
import { cheaperLook, swapCandidates, total, type CheaperResult, type LookPiece } from "@/lib/discover/look";
import { photoFullUrl, productPhoto } from "@/lib/images";
import { deliveryLabel, stockSignal } from "@/lib/commerce";
import { sellerById } from "@/lib/catalog/sellers";
import { useShop, useUI } from "@/lib/store";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";
import { Rating } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";

type Chapter = SceneChapter & { product: Product };
type ItemRow = { product: Product; variant: string; label?: string };

/**
 * Discover Mode — THE AYIIN EVENING.
 *
 * A sticky full-screen stage. Scrolling moves a slow camera push through the evening,
 * chapter by chapter; each chapter is the real photograph of a real product, and the
 * product sits where it is in the photo. Hover (or tap) the quiet marker to meet it;
 * click to focus the camera on it and open its details. "Keep exploring" returns to
 * exactly where you were. Reduced motion gets the same scene as still, stacked frames.
 */
export function DiscoverExperience({
  title,
  kicker,
  chapters,
  look,
  catalog,
}: {
  title: string;
  kicker: string;
  chapters: Chapter[];
  look: LookPiece[];
  catalog: Product[];
}) {
  const reduced = usePrefersReducedMotion();
  const [focus, setFocus] = useState<number | null>(null);
  const [drawer, setDrawer] = useState<null | { title: string; subtitle: string; items: ItemRow[] }>(null);

  const sceneItems = useMemo<ItemRow[]>(() => {
    const rows: ItemRow[] = chapters.map((c) => ({ product: c.product, variant: c.variant, label: c.title }));
    for (const piece of look) if (!rows.some((r) => r.product.id === piece.product.id)) rows.push({ product: piece.product, variant: piece.variant, label: "The Evening Look" });
    return rows;
  }, [chapters, look]);

  const openScene = () =>
    setDrawer({ title: `Shop this scene`, subtitle: `${title} · ${sceneItems.length} products`, items: sceneItems });

  return (
    <div className="surface-night bg-[#070d1d]">
      {reduced ? (
        <StillScene title={title} kicker={kicker} chapters={chapters} onOpen={setFocus} onShopScene={openScene} />
      ) : (
        <MovingScene title={title} kicker={kicker} chapters={chapters} focus={focus} onOpen={setFocus} onShopScene={openScene} sceneCount={sceneItems.length} sceneTotal={total(sceneItems)} />
      )}

      <EveningLook look={look} catalog={catalog} onShop={(items) => setDrawer({ title: "Shop the look", subtitle: `${items.length} pieces from ${title}`, items })} onShopScene={openScene} sceneCount={sceneItems.length} sceneTotal={total(sceneItems)} />

      {focus !== null && <ProductLayer chapter={chapters[focus]} onClose={() => setFocus(null)} />}
      {drawer && <CommerceDrawer {...drawer} onClose={() => setDrawer(null)} />}
    </div>
  );
}

/* ─────────────────────────── The moving scene ─────────────────────────── */

function MovingScene({
  title,
  kicker,
  chapters,
  focus,
  onOpen,
  onShopScene,
  sceneCount,
  sceneTotal,
}: {
  title: string;
  kicker: string;
  chapters: Chapter[];
  focus: number | null;
  onOpen: (i: number) => void;
  onShopScene: () => void;
  sceneCount: number;
  sceneTotal: number;
}) {
  const { fmt } = usePrefs();
  const track = useRef<HTMLDivElement>(null);
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const [stage, setStage] = useState({ w: 1440, h: 800 });
  const [pos, setPos] = useState(0); // 0 … chapters.length (float)
  const [hover, setHover] = useState(false);
  const n = chapters.length;
  const active = Math.min(n - 1, Math.max(0, Math.floor(pos)));
  const local = Math.min(1, Math.max(0, pos - active));

  // Stage size, for mapping each photo's hotspot onto the cropped frame.
  useEffect(() => {
    const onResize = () => setStage({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Scroll → camera position.
  useEffect(() => {
    let raf = 0;
    const read = () => {
      raf = 0;
      const el = track.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const t = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      setPos(t * n * 0.999);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [n]);

  const spots = chapters.map((c) => hotspotOnStage(c, stage.w, stage.h));
  const spot = spots[active];
  const focused = focus !== null;

  const goTo = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.35)) / n, behavior: "smooth" });
  };

  return (
    <div ref={track} className="relative" style={{ height: `${n * 115 + 60}svh` }}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Frames */}
        {chapters.map((c, i) => {
          const s = spots[i];
          const f = Math.min(1, Math.max(0, pos - i));
          const fadeIn = i === 0 ? 1 : Math.min(1, Math.max(0, (pos - (i - 0.18)) / 0.18));
          const camera = focused && focus === i ? 1.34 : 1.03 + f * 0.11 + (hover && i === active ? 0.015 : 0);
          return (
            <div
              key={`frame-${c.id}`}
              ref={(el) => {
                layers.current[i] = el;
              }}
              aria-hidden
              className="absolute inset-0"
              style={{ opacity: fadeIn, visibility: fadeIn > 0 ? "visible" : "hidden" }}
            >
              <Frame chapter={c} spot={s} scale={camera} slow={focused} priority={i < 2} />
            </div>
          );
        })}

        {/* Evening grade: one colour story across every frame */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[rgb(255_150_60/0.07)] mix-blend-multiply" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[background] duration-700"
          style={{
            background: `radial-gradient(circle at ${spot.x}px ${spot.y}px, rgb(5 10 22 / 0) 0, rgb(5 10 22 / ${focused ? 0.2 : hover ? 0.12 : 0.05}) ${focused ? 180 : 260}px, rgb(5 10 22 / ${focused ? 0.78 : hover ? 0.62 : 0.5}) 100%)`,
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(to_top,rgb(7_13_29/0.85),transparent)]" />

        {/* Opening title */}
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center px-[var(--gutter)] text-center transition-opacity duration-700"
          style={{ opacity: pos < 0.28 && !focused ? 1 : 0 }}
        >
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-porcelain/75">{kicker}</p>
            <h1 className="display mt-4 text-[clamp(52px,9vw,128px)] text-porcelain">{title}</h1>
            <p className="mt-4 text-[15px] text-[#c7d0e3]">Scroll to step inside. Everything you see here is real — and yours to shop.</p>
          </div>
        </div>

        {/* Chapter caption */}
        <div
          className="pointer-events-none absolute bottom-[calc(env(safe-area-inset-bottom)+132px)] left-[var(--gutter)] right-[var(--gutter)] max-w-[520px] transition-opacity duration-500 lg:bottom-28"
          style={{ opacity: pos >= 0.28 && !focused ? 1 : 0 }}
        >
          <div key={`caption-${chapters[active].id}`} className="animate-fade">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">{chapters[active].time}</p>
          <p className="display mt-2 text-[clamp(36px,5vw,64px)] leading-[0.95] text-porcelain">{chapters[active].title}</p>
          <p className="mt-3 text-[15px] text-[#c7d0e3]">{chapters[active].line}</p>
          </div>
        </div>

        {/* The product marker */}
        {/* Stays mounted (hidden) while its product is open, so focus can return to it. */}
        {pos >= 0.28 && local > 0.08 && local < 0.9 && (
          <Marker
            key={`marker-${chapters[active].id}`}
            hidden={focused}
            chapter={chapters[active]}
            x={spot.x}
            y={spot.y}
            onHover={setHover}
            onOpen={() => {
              setHover(false);
              onOpen(active);
            }}
          />
        )}

        {/* Discover bar: exit, chapters, shop the scene */}
        <nav
          aria-label="Discover"
          className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+72px)] flex items-center justify-between gap-3 px-[var(--gutter)] lg:bottom-6"
        >
          <Link href="/" className="inline-flex h-10 items-center gap-2 rounded-full bg-[rgb(7_13_29/0.7)] px-4 text-[13px] text-porcelain ring-1 ring-[rgb(255_255_255/0.14)] backdrop-blur hover:bg-[rgb(7_13_29/0.9)]">
            <Icon name="chevronLeft" size={15} /> Exit Discover
          </Link>
          <div className="hidden items-center gap-1.5 sm:flex" role="group" aria-label="Chapters">
            {chapters.map((c, i) => (
              <button
                key={c.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${c.time} · ${c.title}`}
                aria-current={i === active ? "step" : undefined}
                className="grid h-6 place-items-center px-0.5"
              >
                <span className={clsx("block h-[3px] rounded-full transition-all duration-500", i === active ? "w-8 bg-brand" : i < active ? "w-4 bg-porcelain/70" : "w-4 bg-porcelain/25")} />
              </button>
            ))}
          </div>
          <button type="button" onClick={onShopScene} className="btn btn-brand btn-sm">
            Shop this scene <span className="num hidden opacity-80 sm:inline">· {sceneCount} · {fmt(sceneTotal)}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}

function Frame({ chapter: c, spot, scale, slow, priority }: { chapter: Chapter; spot: { x: number; y: number }; scale: number; slow: boolean; priority?: boolean }) {
  const photo = productPhoto(c.product, c.variant, c.view);
  if (!photo) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photoFullUrl(photo, 1600)}
      srcSet={[960, 1600, 2400].map((w) => `${photoFullUrl(photo, w)} ${w}w`).join(", ")}
      sizes="100vw"
      alt=""
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.88)_contrast(1.06)_brightness(0.8)_sepia(0.1)]"
      style={{
        objectPosition: `${c.hotspot.x * 100}% ${c.hotspot.y * 100}%`,
        transformOrigin: `${spot.x}px ${spot.y}px`,
        transform: `scale(${scale})`,
        transition: slow ? "transform 1.1s cubic-bezier(0.16,1,0.3,1)" : "transform 0.25s linear",
        backgroundColor: photo.color,
      }}
    />
  );
}

function Marker({ chapter: c, x, y, hidden, onHover, onOpen }: { chapter: Chapter; x: number; y: number; hidden?: boolean; onHover: (v: boolean) => void; onOpen: () => void }) {
  const { fmt } = usePrefs();
  const seller = sellerById(c.product.sellerId);
  const [open, setOpen] = useState(false);
  const touch = useCoarsePointer();
  const show = open || touch;
  return (
    <div className={clsx("absolute z-10 transition-opacity duration-500", hidden && "pointer-events-none opacity-0")} style={{ left: x, top: y }}>
      <div className="animate-fade">
      <button
        type="button"
        onMouseEnter={() => {
          setOpen(true);
          onHover(true);
        }}
        onMouseLeave={() => {
          setOpen(false);
          onHover(false);
        }}
        onFocus={() => {
          setOpen(true);
          onHover(true);
        }}
        onBlur={() => {
          setOpen(false);
          onHover(false);
        }}
        onClick={onOpen}
        aria-label={`${c.product.name}, ${fmt(c.product.price)}. Open details`}
        className="group relative -ml-[22px] -mt-[22px] grid h-11 w-11 place-items-center"
      >
        <span aria-hidden className="absolute h-9 w-9 rounded-full border border-porcelain/50 motion-safe:animate-[ping_2.8s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <span aria-hidden className="relative h-3 w-3 rounded-full bg-porcelain shadow-[0_0_0_4px_rgb(7_13_29/0.35)] transition-transform duration-300 group-hover:scale-125" />
      </button>
      <div
        aria-hidden
        className={clsx(
          "pointer-events-none absolute left-6 top-1/2 w-max max-w-[260px] -translate-y-1/2 rounded-2xl bg-[rgb(7_13_29/0.78)] px-3.5 py-2.5 text-porcelain ring-1 ring-[rgb(255_255_255/0.12)] backdrop-blur-md transition-all duration-300",
          show ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0",
        )}
      >
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-mute-dark">{c.product.brand}</p>
        <p className="mt-0.5 text-[14px] font-medium">{c.product.name}</p>
        <p className="mt-1 flex items-center gap-2 text-[12.5px]">
          <span className="num font-medium text-brand">{fmt(c.product.price)}</span>
          {seller.verified && (
            <span className="inline-flex items-center gap-1 text-mute-dark">
              <Icon name="shield" size={12} /> Ayiin Verified
            </span>
          )}
        </p>
        <p className="mt-1.5 text-[11.5px] uppercase tracking-[0.14em] text-porcelain/80">{touch ? "Tap to view" : "View"}</p>
      </div>
      </div>
    </div>
  );
}

/* ───────────── Reduced motion: the same scene, as still frames ───────────── */

function StillScene({ title, kicker, chapters, onOpen, onShopScene }: { title: string; kicker: string; chapters: Chapter[]; onOpen: (i: number) => void; onShopScene: () => void }) {
  return (
    <div>
      <div className="shell flex flex-wrap items-end justify-between gap-6 py-16">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-mute-dark">{kicker}</p>
          <h1 className="display mt-3 text-[clamp(48px,8vw,112px)] text-porcelain">{title}</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn btn-on-dark btn-sm">
            Exit Discover
          </Link>
          <button type="button" onClick={onShopScene} className="btn btn-brand btn-sm">
            Shop this scene
          </button>
        </div>
      </div>
      {chapters.map((c, i) => {
        const photo = productPhoto(c.product, c.variant, c.view);
        return (
          <section key={c.id} className="relative h-[85svh] overflow-hidden" aria-label={`${c.time}, ${c.title}`}>
            {photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoFullUrl(photo, 1600)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.88)_contrast(1.06)_brightness(0.8)_sepia(0.1)]" style={{ objectPosition: `${c.hotspot.x * 100}% ${c.hotspot.y * 100}%` }} />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_13_29/0.85),transparent_55%)]" />
            <div className="absolute bottom-8 left-[var(--gutter)] right-[var(--gutter)] flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">{c.time}</p>
                <p className="display mt-2 text-[clamp(32px,5vw,56px)] text-porcelain">{c.title}</p>
                <p className="mt-2 text-[15px] text-[#c7d0e3]">{c.line}</p>
              </div>
              <button type="button" onClick={() => onOpen(i)} className="btn btn-white btn-sm">
                {c.product.name} <Icon name="arrowUpRight" size={15} />
              </button>
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── The product layer ─────────────────────────── */

function ProductLayer({ chapter: c, onClose }: { chapter: Chapter; onClose: () => void }) {
  const { fmt, mode } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const p = c.product;
  const seller = sellerById(p.sellerId);
  const stock = stockSignal(p);
  const variant = p.variants.find((v) => v.id === c.variant) ?? p.variants[0];
  const first = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    first.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-end lg:items-stretch" role="presentation">
      <button type="button" aria-label="Keep exploring" onClick={onClose} className="absolute inset-0 cursor-default" tabIndex={-1} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discover-product"
        className="surface-night relative mb-[calc(env(safe-area-inset-bottom)+64px)] max-h-[calc(88svh-64px)] w-full overflow-y-auto rounded-t-[28px] lg:mb-0 bg-[rgb(9_17_36/0.94)] p-5 ring-1 ring-[rgb(255_255_255/0.1)] backdrop-blur-xl animate-rise sm:p-7 lg:m-4 lg:max-h-none lg:w-[440px] lg:rounded-[28px]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">
          {c.time} · {c.title}
        </p>
        <div className="mt-4 overflow-hidden rounded-[20px]">
          <ProductImage product={p} variant={variant.id} sizes="400px" alt={p.name} className="aspect-[4/3] w-full" />
        </div>
        <p className="mt-5 text-[13px] text-mute">
          {p.brand} · Sold by {seller.name}
        </p>
        <h2 id="discover-product" className="display mt-1 text-[34px] leading-[1.02] text-porcelain">
          {p.name}
        </h2>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="num text-[24px] font-medium text-porcelain">{fmt(p.price)}</span>
          <Rating value={p.rating} count={p.reviewCount} />
        </div>
        <ul className="mt-4 space-y-2 text-[13.5px] text-[#c7d0e3]">
          <li className="flex items-center gap-2">
            <Icon name="truck" size={15} className="text-mute-dark" /> Arrives {deliveryLabel(p)}
            {p.shipping === 0 && <span className="text-mute-dark">· free delivery</span>}
          </li>
          <li className="flex items-center gap-2">
            <span className={clsx("h-1.5 w-1.5 rounded-full", stock.tone === "success" ? "bg-success" : stock.tone === "warning" ? "bg-warning" : "bg-danger")} /> {stock.label}
          </li>
          {seller.verified && (
            <li className="flex items-center gap-2">
              <Icon name="shield" size={15} className="text-brand" /> Ayiin Verified seller · {seller.onTime}% on time
            </li>
          )}
          <li className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 rounded-full ring-1 ring-[rgb(255_255_255/0.25)]" style={{ background: variant.color }} /> {variant.name}
          </li>
        </ul>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#c7d0e3]">{p.summary}</p>
        <div className="mt-6 grid gap-2">
          <button
            ref={first}
            type="button"
            disabled={p.stock <= 0}
            onClick={() => {
              addToCart(p.id, variant.id, 1, mode === "business");
              notify("Added to bag", `${p.name} · Arrives ${deliveryLabel(p)}`, { label: "View bag", href: "/cart" });
            }}
            className="btn btn-brand w-full"
          >
            <Icon name="bag" size={17} /> Add to bag
          </button>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/p/${p.slug}`} className="btn btn-on-dark">
              View product
            </Link>
            <button type="button" onClick={onClose} className="btn btn-on-dark">
              Keep exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── The Evening Look ─────────────────────────── */

function EveningLook({
  look,
  catalog,
  onShop,
  onShopScene,
  sceneCount,
  sceneTotal,
}: {
  look: LookPiece[];
  catalog: Product[];
  onShop: (items: ItemRow[]) => void;
  onShopScene: () => void;
  sceneCount: number;
  sceneTotal: number;
}) {
  const { fmt, mode } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const openCart = useUI((s) => s.openCart);
  const [pieces, setPieces] = useState<LookPiece[]>(look);
  const [customize, setCustomize] = useState(false);
  const [cheaper, setCheaper] = useState<CheaperResult | null>(null);
  const sum = total(pieces);

  const addAll = useCallback(() => {
    for (const piece of pieces) addToCart(piece.product.id, piece.variant, 1, mode === "business");
    notify(`Added ${pieces.length} pieces to your bag`, "The Evening Look");
    openCart();
  }, [pieces, addToCart, mode, notify, openCart]);

  const setPiece = (i: number, next: Partial<LookPiece>) => setPieces((ps) => ps.map((p, k) => (k === i ? { ...p, ...next } : p)));

  return (
    <section aria-labelledby="evening-look" className="shell py-20 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-brand">8:30 pm · Out the door</p>
          <h2 id="evening-look" className="display mt-3 text-[clamp(44px,7vw,96px)] text-porcelain">
            The Evening Look
          </h2>
          <p className="mt-3 max-w-lg text-[16px] text-[#c7d0e3]">Everything you’d take out tonight, all discovered in the scene.</p>
        </div>
        <div className="text-right">
          <p className="num text-[13px] text-mute-dark">{pieces.length} pieces</p>
          <p className="num text-[40px] font-medium text-porcelain">{fmt(sum)}</p>
        </div>
      </div>

      <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {pieces.map((piece, i) => {
          const swaps = swapCandidates(piece, catalog);
          return (
            <li key={piece.role} className="rounded-[24px] bg-[rgb(255_255_255/0.04)] p-3 ring-1 ring-[rgb(255_255_255/0.08)]">
              <Link href={`/p/${piece.product.slug}`} className="block overflow-hidden rounded-[18px]">
                <ProductImage product={piece.product} variant={piece.variant} sizes="(min-width: 1024px) 25vw, 50vw" alt={piece.product.name} className="aspect-square w-full" />
              </Link>
              <p className="mt-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mute-dark">{piece.role}</p>
              <p className="mt-1 text-[15px] font-medium text-porcelain">{piece.product.name}</p>
              <p className="num mt-0.5 text-[14px] text-[#c7d0e3]">{fmt(piece.product.price)}</p>
              {customize && (
                <div className="mt-3 border-t border-[rgb(255_255_255/0.08)] pt-3">
                  {piece.product.variants.length > 1 && (
                    <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`${piece.role} colour`}>
                      {piece.product.variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          role="radio"
                          aria-checked={v.id === piece.variant}
                          title={v.name}
                          onClick={() => setPiece(i, { variant: v.id })}
                          className={clsx("h-6 w-6 rounded-full ring-offset-2 ring-offset-[#0b1a38]", v.id === piece.variant ? "ring-2 ring-brand" : "ring-1 ring-[rgb(255_255_255/0.25)]")}
                          style={{ background: v.color }}
                        >
                          <span className="sr-only">{v.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {swaps.length ? (
                    <div className="mt-3 space-y-1.5">
                      <p className="text-[11.5px] text-mute-dark">Swap for</p>
                      {swaps.slice(0, 3).map((alt) => (
                        <button key={alt.id} type="button" onClick={() => setPiece(i, { product: alt, variant: alt.variants[0].id })} className="flex w-full items-center justify-between gap-2 rounded-xl bg-[rgb(255_255_255/0.05)] px-3 py-2 text-left text-[12.5px] text-porcelain hover:bg-[rgb(255_255_255/0.09)]">
                          <span className="truncate">{alt.name}</span>
                          <span className="num shrink-0 text-mute-dark">{fmt(alt.price)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-[11.5px] text-mute-dark">The only {piece.product.subcategory.toLowerCase()} in the catalogue right now.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => onShop(pieces.map((p) => ({ product: p.product, variant: p.variant, label: p.role })))} className="btn btn-brand">
          Shop the look
        </button>
        <button type="button" aria-pressed={customize} onClick={() => setCustomize((c) => !c)} className="btn btn-on-dark">
          {customize ? "Done customising" : "Customise"}
        </button>
        <button type="button" onClick={() => setCheaper(cheaperLook(pieces, catalog))} className="btn btn-on-dark">
          Make it cheaper
        </button>
        <button type="button" onClick={addAll} className="btn btn-on-dark">
          Add all · <span className="num">{fmt(sum)}</span>
        </button>
      </div>

      {cheaper && (
        <div className="mt-6 max-w-2xl rounded-[24px] bg-[rgb(255_255_255/0.04)] p-5 ring-1 ring-[rgb(255_255_255/0.08)]" aria-live="polite">
          {cheaper.saved > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-4">
                <Figure label="Original" value={fmt(cheaper.original)} />
                <Figure label="In-style swaps" value={fmt(cheaper.optimised)} />
                <Figure label="Saved" value={fmt(cheaper.saved)} accent />
              </div>
              <ul className="mt-4 space-y-1 text-[13.5px] text-[#c7d0e3]">
                {cheaper.swaps.map((s) => (
                  <li key={s.role}>
                    {s.role}: {s.from.name} → <span className="text-porcelain">{s.to.name}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => {
                  setPieces(cheaper.pieces);
                  setCheaper(null);
                }}
                className="btn btn-brand btn-sm mt-4"
              >
                Apply swaps
              </button>
            </>
          ) : (
            <p className="text-[14px] leading-relaxed text-[#c7d0e3]">
              Every piece is already the best value in its style. Ayiin only swaps for the same kind of item, in stock and in a matching colour — and the catalogue has no cheaper match for{" "}
              {cheaper.unchanged.map((u) => u.role.toLowerCase()).join(", ")} yet.
            </p>
          )}
        </div>
      )}

      <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-[rgb(255_255_255/0.1)] pt-8">
        <p className="text-[15px] text-[#c7d0e3]">
          Liked the whole evening? <span className="text-porcelain">{sceneCount} products</span> from the scene, <span className="num text-porcelain">{fmt(sceneTotal)}</span> in total.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={onShopScene} className="btn btn-white">
            Shop this scene
          </button>
          <Link href="/" className="btn btn-on-dark">
            Back to shop
          </Link>
        </div>
      </div>
    </section>
  );
}

function Figure({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[12px] text-mute-dark">{label}</p>
      <p className={clsx("num mt-1 text-[22px] font-medium", accent ? "text-brand" : "text-porcelain")}>{value}</p>
    </div>
  );
}

/* ─────────────────────────── Commerce drawer ─────────────────────────── */

function CommerceDrawer({ title, subtitle, items, onClose }: { title: string; subtitle: string; items: ItemRow[]; onClose: () => void }) {
  const { fmt, mode } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const openCart = useUI((s) => s.openCart);
  const [selected, setSelected] = useState(() => new Set(items.filter((i) => i.product.stock > 0).map((i) => i.product.id)));
  const chosen = items.filter((i) => selected.has(i.product.id));
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const add = (rows: ItemRow[]) => {
    for (const r of rows) addToCart(r.product.id, r.variant, 1, mode === "business");
    notify(`Added ${rows.length} ${rows.length === 1 ? "item" : "items"} to your bag`, title);
    onClose();
    openCart();
  };

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="presentation">
      <button type="button" aria-label="Close" tabIndex={-1} onClick={onClose} className="absolute inset-0 cursor-default bg-[rgb(3_7_16/0.55)] backdrop-blur-[2px]" />
      <div role="dialog" aria-modal="true" aria-labelledby="discover-drawer" className="surface-day relative flex h-full w-full max-w-[480px] flex-col bg-porcelain text-ink shadow-[var(--shadow-float)] animate-fade">
        <div className="flex items-start justify-between gap-4 border-b border-line p-5">
          <div>
            <h2 id="discover-drawer" className="text-[20px] font-medium tracking-[-0.02em]">
              {title}
            </h2>
            <p className="mt-0.5 text-[13px] text-mute">{subtitle}</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-mist">
            <Icon name="close" size={18} />
          </button>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
          {items.map((r) => {
            const p = r.product;
            const seller = sellerById(p.sellerId);
            const stock = stockSignal(p);
            const checked = selected.has(p.id);
            return (
              <li key={p.id} className="flex items-center gap-3 py-4">
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={p.stock <= 0}
                  onChange={() => toggle(p.id)}
                  aria-label={`Include ${p.name}`}
                  className="h-4 w-4 shrink-0"
                />
                <Link href={`/p/${p.slug}`} className="shrink-0 overflow-hidden rounded-xl">
                  <ProductImage product={p} variant={r.variant} sizes="64px" className="h-16 w-16" />
                </Link>
                <div className="min-w-0 flex-1">
                  {r.label && <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-mute">{r.label}</p>}
                  <Link href={`/p/${p.slug}`} className="block truncate text-[14px] font-medium hover:underline">
                    {p.name}
                  </Link>
                  <p className="truncate text-[12px] text-mute">
                    {seller.name} · {stock.label} · Arrives {deliveryLabel(p)}
                  </p>
                </div>
                <span className="num shrink-0 text-[14px] font-medium">{fmt(p.price)}</span>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-line p-5">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] text-mute">
              {chosen.length} of {items.length} selected
            </span>
            <span className="num text-[22px] font-medium">{fmt(total(chosen))}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" disabled={!chosen.length} onClick={() => add(chosen)} className="btn btn-brand">
              Add selected
            </button>
            <button type="button" onClick={() => add(items.filter((i) => i.product.stock > 0))} className="btn btn-ink">
              Add all
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Helpers ─────────────────────────── */

/** Where a photo's hotspot lands on a W×H stage showing it with object-cover + object-position at the hotspot. */
function hotspotOnStage(c: SceneChapter, W: number, H: number) {
  const { x, y } = c.hotspot;
  if (W / H > c.aspect) {
    const ih = W / c.aspect;
    return { x: x * W, y: (H - ih) * y + y * ih };
  }
  const iw = H * c.aspect;
  return { x: (W - iw) * x + x * iw, y: y * H };
}

/** Subscribe to a CSS media query (false on the server, live in the browser). */
function useMedia(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", onChange);
      return () => m.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const usePrefersReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
const useCoarsePointer = () => useMedia("(hover: none)");
