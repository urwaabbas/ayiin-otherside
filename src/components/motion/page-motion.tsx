"use client";

import { animate, inView, stagger } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Sections: the direct children of every page shell, and the cards inside them. */
const SECTION = "main .shell > *, main .fold";
const CARD = ".pc, [data-motion-item]";
const FROM = "translate3d(0, 28px, 0)";
const CARD_FROM = "translate3d(0, 18px, 0)";
const TO = "translate3d(0, 0px, 0)";

/**
 * Site-wide scroll motion, added without touching any component.
 *
 * Nothing is written to the page's markup up front (no inline styles, no attributes), so React can
 * hydrate it untouched. Each section below the fold is only watched; just before it scrolls into
 * view it is eased up from 28px and faded in, and the product cards inside it follow in a short
 * stagger. The animation holds its first frame while it is waiting, and the section is still
 * below the screen when it starts, so nothing flashes. Inline styles the animation leaves behind
 * are removed afterwards so hover and press states in CSS keep working.
 *
 * Reduced motion: does nothing.
 */
export function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const watched = new WeakSet<Element>();
    const stops: (() => void)[] = [];
    let cancelled = false;

    const land = (el: HTMLElement) => {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
    };

    const watch = () => {
      if (cancelled) return;
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>(SECTION).forEach((el) => {
        if (watched.has(el) || el.closest("[data-nomotion], .reveal, header, footer")) return;
        const r = el.getBoundingClientRect();
        // On screen already, above it, or too small to be a section: leave it be.
        if (r.top < vh * 0.92 || r.height < 120) return;
        // A section inside one that is already animating rides along with it.
        for (let a = el.parentElement; a; a = a.parentElement) if (watched.has(a)) return;
        watched.add(el);
        stops.push(
          inView(
            el,
            () => {
              const cards = Array.from(el.querySelectorAll<HTMLElement>(CARD)).slice(0, 12);
              animate(el, { opacity: [0, 1], transform: [FROM, TO] }, { duration: 0.9, ease: EASE }).then(() => land(el));
              if (cards.length)
                animate(cards, { opacity: [0, 1], transform: [CARD_FROM, TO] }, { duration: 0.8, ease: EASE, delay: stagger(0.06, { startDelay: 0.12 }) }).then(() => cards.forEach(land));
            },
            // Starts while the section is still just under the screen.
            { amount: "some", margin: "0px 0px 14% 0px" },
          ),
        );
      });
    };

    // Wait for the page to load and settle before looking, then keep looking as sections appear.
    let timer = 0;
    const start = () => {
      timer = window.setTimeout(watch, 350);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    let debounce = 0;
    const main = document.querySelector("main");
    const mo = new MutationObserver(() => {
      window.clearTimeout(debounce);
      debounce = window.setTimeout(watch, 200);
    });
    if (main) mo.observe(main, { childList: true, subtree: true });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.clearTimeout(debounce);
      window.removeEventListener("load", start);
      mo.disconnect();
      stops.forEach((s) => s());
    };
  }, [pathname]);

  return null;
}
