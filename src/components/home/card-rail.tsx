"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Icon } from "@/components/ui/icon";

gsap.registerPlugin(Draggable, InertiaPlugin);

/**
 * The homepage's product shelf: at most four cards across (three on tablets, two and a bit on
 * phones). When a shelf has more products, the rest sit just off the edge — drag or swipe with
 * inertia, scroll sideways, or press the glass arrows; each move settles on a whole card.
 * Arrows appear only when there is something to scroll to. Cards keep the same size whether the
 * shelf holds four products or twelve. `resetKey` returns the shelf to its start when its
 * contents change (tabs). `flow` is for shelves that are not inside a one-screen fold: square photographs
 * instead of photographs sized from the screen height.
 */
export function CardRail({ children, resetKey, label, flow }: { children: React.ReactNode; resetKey?: string; label: string; flow?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const api = useRef<{ go: (dir: 1 | -1) => void; reveal: (el: HTMLElement) => void; reset: () => void } | null>(null);
  const [edge, setEdge] = useState({ start: true, end: true });

  useEffect(() => {
    const vp = viewport.current;
    const tr = track.current;
    if (!vp || !tr) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const items = () => Array.from(tr.children) as HTMLElement[];
      const minX = () => Math.min(0, vp.clientWidth - tr.scrollWidth);
      const clamp = (x: number) => gsap.utils.clamp(minX(), 0, x);
      const stops = () => items().map((t) => clamp(-t.offsetLeft));
      const nearest = (x: number) => stops().reduce((a, b) => (Math.abs(b - x) < Math.abs(a - x) ? b : a), 0);
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
      const refresh = () => {
        drag.applyBounds({ minX: minX(), maxX: 0 });
        gsap.set(tr, { x: clamp(gsap.getProperty(tr, "x") as number) });
        drag.update();
        sync();
      };

      const glide = (x: number) =>
        gsap.to(tr, {
          x: clamp(x),
          duration: reduce ? 0 : 0.8,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => {
            drag.update();
            sync();
          },
          onComplete: sync,
        });
      api.current = {
        go: (dir) => {
          const x = gsap.getProperty(tr, "x") as number;
          const w = (items()[1]?.offsetLeft ?? 320) - (items()[0]?.offsetLeft ?? 0);
          glide(nearest(x - dir * w * 2));
        },
        reveal: (el) => {
          const x = gsap.getProperty(tr, "x") as number;
          const left = el.offsetLeft + x;
          const right = left + el.offsetWidth;
          if (left < 0) glide(nearest(x - left));
          else if (right > vp.clientWidth) glide(nearest(x - (right - vp.clientWidth) - 1));
        },
        reset: () => {
          gsap.set(tr, { x: 0 });
          refresh();
        },
      };

      const onWheel = (e: WheelEvent) => {
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) && !e.shiftKey) return;
        const dx = e.shiftKey && !e.deltaX ? e.deltaY : e.deltaX;
        if (minX() === 0) return;
        e.preventDefault();
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
      const ro = new ResizeObserver(refresh);
      ro.observe(vp);
      refresh();

      return () => {
        ro.disconnect();
        vp.removeEventListener("wheel", onWheel);
        drag.kill();
      };
    }, viewport);

    return () => {
      api.current = null;
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    api.current?.reset();
  }, [resetKey]);

  const scrollable = !(edge.start && edge.end);

  return (
    <div ref={viewport} data-more={Array.isArray(children) && children.length > 4 ? "true" : undefined} className={`card-rail${flow ? " card-rail--flow" : ""} group/rail relative w-full [overflow-x:clip] [overflow-y:visible]`} role="group" aria-label={label}>
      <ul
        ref={track}
        onFocusCapture={(e) => {
          const li = (e.target as HTMLElement).closest("li");
          if (li) api.current?.reveal(li as HTMLElement);
        }}
        className="flex w-max touch-pan-y gap-4 will-change-transform lg:gap-5"
      >
        {Array.isArray(children)
          ? children.map((c, i) => (
              <li key={i} className="card-rail-item shrink-0">
                {c}
              </li>
            ))
          : null}
      </ul>

      {scrollable &&
        (["prev", "next"] as const).map((d) => {
          const hidden = d === "prev" ? edge.start : edge.end;
          return (
            <button
              key={d}
              type="button"
              aria-label={d === "prev" ? `Previous ${label}` : `Next ${label}`}
              onClick={() => api.current?.go(d === "prev" ? -1 : 1)}
              suppressHydrationWarning
              tabIndex={hidden ? -1 : 0}
              className={`glass glass-btn absolute top-[38%] z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full transition-opacity duration-300 [@media(hover:hover)]:grid ${
                d === "prev" ? "left-3" : "right-3"
              } ${hidden ? "pointer-events-none opacity-0" : "opacity-100"}`}
            >
              <Icon name={d === "prev" ? "chevronLeft" : "chevronRight"} size={20} />
            </button>
          );
        })}
    </div>
  );
}
