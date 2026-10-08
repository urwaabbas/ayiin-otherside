"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Icon } from "@/components/ui/icon";
import { categories } from "@/lib/catalog/categories";
import { PRODUCT_PHOTOS } from "@/lib/catalog/photos";
import type { ProductPhoto } from "@/lib/catalog/photos";
import { photoUrl } from "@/lib/images";

gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * The photograph that stands for each department: [product slug, variant, view].
 * Landscape originals (~3:2), cropped square around their subject.
 */
const DEPARTMENT_PHOTO: Record<string, [string, string, "hero" | "angle" | "scene"]> = {
  "home-living": ["stoneware-bud-vases", "bone", "angle"],
  "audio-tech": ["aurel-anc-over-ear", "graphite", "hero"],
  kitchen: ["pour-gooseneck-kettle", "matte-black", "scene"],
  fashion: ["solstice-sunglasses", "tortoise", "hero"],
  beauty: ["night-recovery-oil", "30", "scene"],
  office: ["kova-keys-low-profile", "graphite", "hero"],
  supplies: ["double-wall-cartons-12x10x8", "kraft", "hero"],
  safety: ["vented-safety-helmet", "red", "hero"],
};

const photoFor = (slug: string): ProductPhoto | undefined => {
  const pick = DEPARTMENT_PHOTO[slug];
  if (!pick) return undefined;
  const [product, variant, view] = pick;
  const views = PRODUCT_PHOTOS[product]?.[variant];
  return views?.[view] ?? views?.hero;
};

/**
 * Department rail — "Shop by department": large square photographs with the name set over the
 * picture and a "Shop now" pill, the next tile peeking in. GSAP drives it:
 *  · drag or swipe with inertia, settling on a tile (Draggable + InertiaPlugin)
 *  · trackpad / shift-wheel scrolls it sideways
 *  · glass arrows (pointer devices) glide two tiles at a time
 *  · tabbing to an off-screen tile brings it into view
 *  · the tiles rise in, staggered, as the section arrives (IntersectionObserver)
 * There is no scrollbar or progress track — the peeking tile is the affordance.
 * Reduced motion: no entrance, no glide, no inertia.
 */
export function DiscoveryTiles() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const api = useRef<{ go: (dir: 1 | -1) => void; reveal: (el: HTMLElement) => void } | null>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const tiles = Array.from(tr.querySelectorAll<HTMLElement>("li"));
      const minX = () => Math.min(0, vp.clientWidth - tr.scrollWidth);
      const clamp = (x: number) => gsap.utils.clamp(minX(), 0, x);
      const origin = () => tiles[0]?.offsetLeft ?? 0;
      // x positions at which a tile's left edge sits at the rail's left padding
      const stops = () => tiles.map((t) => clamp(origin() - t.offsetLeft));
      const nearest = (x: number) => stops().reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a));
      const sync = () => {
        const x = gsap.getProperty(tr, "x") as number;
        setEdge((p) => {
          const n = { start: x >= -4, end: x <= minX() + 4 };
          return p.start === n.start && p.end === n.end ? p : n;
        });
      };

      const drag = Draggable.create(tr, {
        type: "x",
        inertia: !reduce,
        bounds: { minX: minX(), maxX: 0 },
        edgeResistance: 0.8,
        allowNativeTouchScrolling: true,
        cursor: "grab",
        activeCursor: "grabbing",
        snap: { x: (v: number) => nearest(v) },
        onDrag: sync,
        onThrowUpdate: sync,
        onThrowComplete: sync,
      })[0];

      const glide = (x: number) => {
        gsap.to(tr, {
          x: clamp(x),
          duration: reduce ? 0 : 0.9,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => {
            drag.update();
            sync();
          },
          onComplete: sync,
        });
      };
      api.current = {
        go: (dir) => {
          const x = gsap.getProperty(tr, "x") as number;
          const w = (tiles[1]?.offsetLeft ?? 320) - origin();
          glide(nearest(x - dir * w * 2));
        },
        reveal: (el) => {
          const x = gsap.getProperty(tr, "x") as number;
          const left = el.offsetLeft + x;
          const right = left + el.offsetWidth;
          if (left < 0) glide(nearest(x - left));
          else if (right > vp.clientWidth) glide(nearest(x - (right - vp.clientWidth)));
        },
      };

      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return;
        e.preventDefault();
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        gsap.to(tr, {
          x: clamp((gsap.getProperty(tr, "x") as number) - dx),
          duration: 0.35,
          ease: "power2.out",
          overwrite: true,
          onUpdate: () => {
            drag.update();
            sync();
          },
        });
      };
      vp.addEventListener("wheel", onWheel, { passive: false });

      const onResize = () => {
        drag.applyBounds({ minX: minX(), maxX: 0 });
        gsap.set(tr, { x: clamp(gsap.getProperty(tr, "x") as number) });
        drag.update();
        sync();
      };
      window.addEventListener("resize", onResize);
      sync();

      // Entrance: tiles rise in when the rail scrolls into view. IntersectionObserver (not scroll
      // maths) drives it, and a timer guarantees the tiles can never stay hidden.
      let io: IntersectionObserver | undefined;
      let failsafe: ReturnType<typeof setTimeout> | undefined;
      if (!reduce && vp.getBoundingClientRect().top > window.innerHeight * 0.9) {
        gsap.set(tiles, { y: 44, opacity: 0 });
        const reveal = () => {
          io?.disconnect();
          clearTimeout(failsafe);
          gsap.to(tiles, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.09, clearProps: "opacity,transform" });
        };
        io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && reveal(), { rootMargin: "0px 0px -10% 0px" });
        io.observe(vp);
        failsafe = setTimeout(() => {
          io?.disconnect();
          gsap.set(tiles, { clearProps: "opacity,transform" });
        }, 6000);
      }

      return () => {
        io?.disconnect();
        clearTimeout(failsafe);
        vp.removeEventListener("wheel", onWheel);
        window.removeEventListener("resize", onResize);
        drag.kill();
      };
    }, section);

    return () => {
      api.current = null;
      ctx.revert();
    };
  }, []);

  return (
    <section ref={section} aria-label="Shop by department" className="scroll-mt-[var(--nav-h)] lg:py-6">
      <div className="mb-8 flex flex-col items-center text-center lg:mb-10">
        <h2 className="display text-display-sm text-ink lg:text-display-md">Shop by department.</h2>
        <Link href="/search" className="link-underline mt-4 inline-flex items-center gap-1.5 text-support font-medium text-brand-deep">
          Browse all products <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      <div ref={viewport} className="group/rail relative -mx-[var(--gutter)] overflow-hidden">
        <ul
          ref={track}
          aria-label="Departments"
          onFocusCapture={(e) => {
            const li = (e.target as HTMLElement).closest("li");
            if (li) api.current?.reveal(li as HTMLElement);
          }}
          className="flex w-max touch-pan-y gap-3 px-[var(--gutter)] will-change-transform sm:gap-4 lg:gap-5"
        >
          {categories.map((c, i) => {
            const photo = photoFor(c.slug);
            return (
              <li key={c.slug} className="w-[72vw] shrink-0 sm:w-[44vw] lg:w-[calc((min(100vw,1520px)-2*var(--gutter)-3*1.25rem)/3.4)]">
                <Link
                  href={`/c/${c.slug}`}
                  draggable={false}
                  className="group relative block aspect-square overflow-hidden rounded-[14px] bg-mist"
                  style={photo ? { backgroundColor: photo.color } : undefined}
                >
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoUrl(photo, 900, 80, 1)}
                      alt=""
                      loading={i < 3 ? "eager" : "lazy"}
                      draggable={false}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    />
                  )}
                  <span
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--rgb-ink)/0.62)_0%,rgb(var(--rgb-ink)/0.18)_42%,transparent_70%)] transition-opacity duration-500 group-hover:opacity-90"
                  />
                  <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-5 text-center text-white sm:pb-6">
                    <span className="display text-balance text-[1.625rem] !leading-[1] tracking-[-0.02em] sm:text-section lg:text-heading">
                      {c.name}
                    </span>
                    <span className="mt-3.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-support font-medium text-ink shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)] transition-[background-color,transform] duration-300 group-hover:-translate-y-0.5 group-hover:bg-brand">
                      Shop now
                      <Icon name="arrowRight" size={14} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Glass arrows — pointer devices only; fingers just swipe */}
        {(["prev", "next"] as const).map((d) => {
          const hidden = d === "prev" ? edge.start : edge.end;
          return (
            <button
              key={d}
              type="button"
              aria-label={d === "prev" ? "Previous departments" : "Next departments"}
              onClick={() => api.current?.go(d === "prev" ? -1 : 1)}
              suppressHydrationWarning
              tabIndex={hidden ? -1 : 0}
              className={`glass glass-btn absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition-opacity duration-300 [@media(hover:hover)]:grid ${
                d === "prev" ? "left-[calc(var(--gutter)+0.75rem)]" : "right-[calc(var(--gutter)+0.75rem)]"
              } ${hidden ? "pointer-events-none opacity-0" : "opacity-0 group-hover/rail:opacity-100 focus-visible:opacity-100"}`}
            >
              <Icon name={d === "prev" ? "chevronLeft" : "chevronRight"} size={20} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
