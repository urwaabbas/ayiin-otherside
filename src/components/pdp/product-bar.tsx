"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { Money } from "@/components/ui/money";
import { useUI } from "@/lib/store";

export type BarSection = { id: string; label: string };

/**
 * The product page's own navigation: name, section links and Buy, in a blurred bar pinned to the top.
 * While it is mounted the main navbar steps aside once you leave the top of the page and returns only
 * at the very top — the same hand-over Apple makes between its global and product navigation.
 * The links track the section on screen.
 */
export function ProductBar({
  name,
  category,
  price,
  soldOut,
  sections,
}: {
  name: string;
  category: { slug: string; name: string };
  price: number;
  soldOut: boolean;
  sections: BarSection[];
}) {
  const setLocalNav = useUI((s) => s.setLocalNav);
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    setLocalNav(true);
    return () => setLocalNav(false);
  }, [setLocalNav]);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        // the section whose top has crossed a line a third of the way down the screen
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: 0 },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);

  const go = (id: string) => (e: React.MouseEvent) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  };

  return (
    <div className="sticky top-0 z-40 border-b border-ink/10 bg-white/80 backdrop-blur-xl backdrop-saturate-150" role="navigation" aria-label={`${name} sections`}>
      <div className="shell flex h-14 items-center gap-4 lg:gap-8">
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <Link
            href={`/c/${category.slug}`}
            className="hidden shrink-0 rounded-full bg-ink/[0.06] px-3 py-1 text-meta font-medium text-ink-2 transition-colors hover:bg-ink/10 hover:text-ink sm:inline-flex"
          >
            {category.name}
          </Link>
          <p className="truncate text-body font-semibold tracking-[-0.01em] text-ink">{name}</p>
        </div>

        <nav className="hidden flex-1 items-center justify-end gap-6 md:flex" aria-label="On this page">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={go(s.id)}
              aria-current={active === s.id ? "true" : undefined}
              className={clsx(
                "relative py-1 text-support transition-colors duration-300",
                active === s.id ? "text-ink" : "text-ink-2/70 hover:text-ink",
              )}
            >
              {s.label}
              <span
                aria-hidden
                className={clsx(
                  "absolute inset-x-0 -bottom-[17px] h-[2px] rounded-full bg-ink transition-opacity duration-300",
                  active === s.id ? "opacity-100" : "opacity-0",
                )}
              />
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Money usd={price} className="hidden text-support text-ink-2 sm:inline" />
          <a
            href="#buy"
            onClick={go("buy")}
            className="inline-flex h-9 items-center rounded-full bg-ink px-5 text-support font-medium text-white transition-colors duration-300 hover:bg-graphite-2"
          >
            {soldOut ? "Details" : "Buy"}
          </a>
        </div>
      </div>
    </div>
  );
}
