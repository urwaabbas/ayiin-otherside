"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { deliveryLabel } from "@/lib/commerce";
import { usePrefs } from "@/components/providers";
import { ProductImage } from "@/components/product/product-image";

/**
 * HeroFlashlight — the home hero's background.
 *
 * A wall of real product photography sits in near-darkness behind the hero. A soft
 * light follows the pointer (trailing slightly, for a smooth feel) and reveals the
 * products under it; the product in the light shows its name, price and arrival day,
 * and a click opens it. Touch devices get a light that drifts on its own and follows
 * the finger. The hero's own content (headline, search, product card) stays above
 * the wall and fully legible — a scrim keeps the text column calm.
 * Reduced motion: a static, softly lit wall.
 */
const TILES = 48;
const RADIUS = 240;

export function HeroFlashlight({ products, children }: { products: Product[]; children: React.ReactNode }) {
  const router = useRouter();
  const { fmt } = usePrefs();
  const wrap = useRef<HTMLDivElement>(null);
  const wall = useRef<HTMLDivElement>(null);
  const [hint, setHint] = useState(true);
  const [focus, setFocus] = useState<{ p: Product; x: number; y: number } | null>(null);

  // Pointer target and the eased light position, kept out of React state for 60fps updates.
  const target = useRef({ x: 0.72, y: 0.42, manual: false });
  const light = useRef({ x: 0.72, y: 0.42 });

  const tiles = Array.from({ length: TILES }, (_, i) => products[(i * 7) % Math.max(products.length, 1)]).filter(Boolean);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const set = (x: number, y: number) => {
      el.style.setProperty("--fx", `${(x * 100).toFixed(2)}%`);
      el.style.setProperty("--fy", `${(y * 100).toFixed(2)}%`);
    };
    set(light.current.x, light.current.y);
    if (reduced) return;

    let raf = 0;
    let visible = true;
    const start = performance.now();
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(tick);
    });
    io.observe(el);

    function tick(now: number) {
      raf = 0;
      if (!visible) return;
      const t = target.current;
      if (!t.manual) {
        // Idle drift: a slow figure-eight across the whole hero.
        const s = (now - start) / 1000;
        t.x = 0.5 + Math.sin(s * 0.3) * 0.44;
        t.y = 0.5 + Math.sin(s * 0.6) * 0.34;
      }
      const l = light.current;
      l.x += (t.x - l.x) * 0.12;
      l.y += (t.y - l.y) * 0.12;
      set(l.x, l.y);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, []);

  /** The wall tile under a viewport point, if the point isn't over the hero's own content. */
  const tileAt = (clientX: number, clientY: number, from: EventTarget | null) => {
    if (from instanceof Element && from.closest("a, button, input, textarea, h1, p, [data-hero-solid]")) return null;
    const nodes = wall.current?.children;
    if (!nodes) return null;
    for (let i = 0; i < nodes.length; i++) {
      const r = nodes[i].getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return tiles[i] ?? null;
    }
    return null;
  };

  const move = (clientX: number, clientY: number, from: EventTarget | null) => {
    const el = wrap.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    target.current = { x: (clientX - r.left) / r.width, y: (clientY - r.top) / r.height, manual: true };
    if (hint) setHint(false);
    const p = tileAt(clientX, clientY, from);
    setFocus(p ? { p, x: clientX - r.left, y: clientY - r.top } : null);
  };

  return (
    <div
      ref={wrap}
      className="relative isolate overflow-hidden"
      style={{ "--fx": "72%", "--fy": "42%", "--r": `${RADIUS}px` } as React.CSSProperties}
      onPointerMove={(e) => move(e.clientX, e.clientY, e.target)}
      onPointerUp={(e) => {
        if (e.pointerType !== "mouse") target.current.manual = false;
      }}
      onPointerLeave={() => {
        target.current.manual = false;
        setFocus(null);
      }}
      onClick={(e) => {
        const p = tileAt(e.clientX, e.clientY, e.target);
        if (p) router.push(`/p/${p.slug}`);
      }}
    >
      {/* The wall */}
      <div
        ref={wall}
        aria-hidden
        className="pointer-events-none absolute inset-[-12px] -z-20 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] content-start gap-2.5 p-2.5 sm:grid-cols-[repeat(auto-fill,minmax(150px,1fr))]"
      >
        {tiles.map((p, i) => (
          <ProductImage
            key={i}
            product={p}
            sizes="160px"
            className={`aspect-square w-full rounded-2xl transition-[filter] duration-300 ${focus?.p.id === p.id ? "brightness-110" : ""}`}
          />
        ))}
      </div>

      {/* Darkness, with the light cut out of it */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_var(--r)_at_var(--fx)_var(--fy),rgb(6_15_36/0)_0%,rgb(6_15_36/0.35)_50%,rgb(6_15_36/0.88)_100%)]"
      />
      {/* Scrim: keeps the headline column calm wherever the light is */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_48%_62%_at_50%_50%,rgb(11_26_56/0.82)_0%,rgb(11_26_56/0.55)_55%,rgb(11_26_56/0)_100%)] max-lg:bg-[linear-gradient(180deg,rgb(11_26_56/0.85)_0%,rgb(11_26_56/0.55)_55%,rgb(11_26_56/0.85)_100%)]"
      />

      {children}

      {/* Product in the light */}
      {focus && (
        <div
          aria-hidden
          className="pointer-events-none absolute z-10 w-max max-w-[240px] -translate-x-1/2 translate-y-5 rounded-2xl bg-[rgb(255_255_255/0.96)] px-3 py-2 text-[12.5px] text-[#0b1a33] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.5)] backdrop-blur"
          style={{ left: focus.x, top: focus.y }}
        >
          <p className="truncate font-medium">{focus.p.name}</p>
          <p className="mt-0.5 text-[#5a6680]">
            <span className="num font-medium text-[#0b1a33]">{fmt(focus.p.price)}</span> · Arrives {deliveryLabel(focus.p)}
          </p>
        </div>
      )}

      {/* First-visit hint */}
      <p
        aria-hidden
        className={`pointer-events-none absolute bottom-3 right-[var(--gutter)] hidden items-center gap-2 rounded-full bg-[rgb(255_255_255/0.08)] px-3 py-1.5 text-[12px] text-mute-dark ring-1 ring-[rgb(255_255_255/0.1)] backdrop-blur transition-opacity duration-700 lg:flex ${hint ? "opacity-100" : "opacity-0"}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Move to look closer — every product here is real
      </p>
    </div>
  );
}
