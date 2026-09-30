"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { useShop } from "@/lib/store";
import type { Product } from "@/lib/types";
import { ProductCard, RAIL_FRAME } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { SectionHeader } from "@/components/ui/section";

const INTERESTS: { id: string; label: string; match: (p: Product) => boolean }[] = [
  { id: "audio", label: "Audio", match: (p) => ["Headphones", "Speakers"].includes(p.subcategory) },
  { id: "home", label: "Slow living", match: (p) => p.category === "home-living" },
  { id: "coffee", label: "Coffee", match: (p) => p.category === "kitchen" },
  { id: "running", label: "Running", match: (p) => p.useCases.includes("running") || p.useCases.includes("gym") },
  { id: "work", label: "Workspace", match: (p) => p.category === "office" || p.subcategory === "Laptops" || p.subcategory === "Monitors" },
  { id: "gift", label: "Gifting", match: (p) => p.useCases.includes("gift") },
  { id: "skin", label: "Skincare", match: (p) => p.category === "beauty" },
  { id: "travel", label: "Travel", match: (p) => p.useCases.includes("travel") },
];

/**
 * For You has two sources:
 *  · `pool` — its own reserved products (none appear elsewhere on the page), shown when
 *    no interest is selected, and used first when they match;
 *  · `catalog` — every shopper product, so a selected interest always has something to show.
 * Selecting interests filters to matching products; if fewer than a full row match, the row
 * is completed with popular picks, labelled as such. "Something different" rotates the order.
 */
const ROW = 4;

export function ForYou({ pool, catalog }: { pool: Product[]; catalog: Product[] }) {
  const selected = useShop((s) => s.interests);
  const toggleInterest = useShop((s) => s.toggleInterest);
  const [shuffle, setShuffle] = useState(0);

  const toggle = (id: string) => {
    toggleInterest(id);
    setShuffle(0);
  };

  const { feed, matchCount } = useMemo(() => {
    const active = INTERESTS.filter((i) => selected.includes(i.id));
    const inPool = new Set(pool.map((p) => p.id));
    // Deterministic rotation that changes with each "something different" press.
    const jitter = (p: Product) => ((p.id.charCodeAt(p.id.length - 1) * (shuffle + 3) + shuffle * 7) % 17) / 10;
    const score = (p: Product, hits: number) => hits * 3 + (inPool.has(p.id) ? 0.6 : 0) + p.rating + (shuffle ? jitter(p) * 1.5 : jitter(p) * 0.2);

    type Row = { p: Product; hits: string[]; fallback: boolean };
    const pick = (rows: (Row & { s: number })[], limit: number) => {
      rows.sort((a, b) => b.s - a.s);
      const out: Row[] = [];
      const perCat: Record<string, number> = {};
      // Variety first: at most two from one category, then top up if the row is still short.
      for (const r of rows) {
        if (out.length === limit) break;
        if ((perCat[r.p.category] ?? 0) >= 2) continue;
        perCat[r.p.category] = (perCat[r.p.category] ?? 0) + 1;
        out.push(r);
      }
      for (const r of rows) {
        if (out.length === limit) break;
        if (!out.includes(r)) out.push(r);
      }
      return out;
    };

    if (!active.length) {
      const rows = pool.map((p) => ({ p, hits: [], fallback: false, s: score(p, 0) }));
      return { feed: pick(rows, ROW), matchCount: 0 };
    }

    const matches = catalog
      .map((p) => {
        const hits = active.filter((i) => i.match(p)).map((i) => i.label);
        return { p, hits, fallback: false, s: score(p, hits.length) };
      })
      .filter((r) => r.hits.length > 0);
    const chosen = pick(matches, ROW);
    if (chosen.length < ROW) {
      const taken = new Set(chosen.map((r) => r.p.id));
      const extras = [...pool, ...catalog]
        .filter((p, i, all) => !taken.has(p.id) && all.findIndex((x) => x.id === p.id) === i)
        .map((p) => ({ p, hits: [], fallback: true, s: score(p, 0) }));
      chosen.push(...pick(extras, ROW - chosen.length));
    }
    return { feed: chosen, matchCount: matches.length };
  }, [pool, catalog, selected, shuffle]);

  const activeLabels = INTERESTS.filter((i) => selected.includes(i.id)).map((i) => i.label);

  return (
    <>
      <SectionHeader
        index="02"
        kicker="Personal, not repetitive"
        title={<>Tuned to you.<br />Never on a loop.</>}
        description="Tell Ayiin what you're into. Every recommendation explains itself, no category repeats more than twice, and you can always ask for something different."
      />
      <div className="mt-10 flex flex-wrap items-center gap-2 short:mt-[clamp(12px,2.6vh,24px)]">
        <span className="eyebrow mr-2">Your interests</span>
        {INTERESTS.map((i) => (
          <button key={i.id} type="button" aria-pressed={selected.includes(i.id)} onClick={() => toggle(i.id)} className="chip">
            <span className={clsx("chip-dot h-1.5 w-1.5 rounded-full", selected.includes(i.id) ? "bg-brand" : "bg-line-strong")} />
            {i.label}
          </button>
        ))}
        <button type="button" onClick={() => setShuffle((s) => s + 1)} className="chip ml-auto !border-ink">
          <Icon name="repeat" size={14} /> Show me something different
        </button>
      </div>
      <p aria-live="polite" className="mt-3 text-[13px] text-mute short:mt-2">
        {activeLabels.length
          ? `${matchCount} ${matchCount === 1 ? "pick" : "picks"} for ${activeLabels.join(", ")}${matchCount < ROW ? " — completed with popular picks" : ""}`
          : "Pick an interest to tune this row, or leave it open for this week's highlights."}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4 short:mt-[clamp(8px,1.6vh,24px)]">
        {feed.map(({ p, hits, fallback }, n) => (
          <div key={`${p.id}-${shuffle}`} className="animate-rise" style={{ animationDelay: `${n * 50}ms` }}>
            <ProductCard
              product={p}
              frame={RAIL_FRAME}
              reason={
                hits.length
                  ? `Because you like ${hits.slice(0, 2).join(" & ")}`
                  : fallback
                    ? "Popular right now"
                    : shuffle
                      ? "Something different"
                      : "Highly rated this month"
              }
            />
          </div>
        ))}
      </div>
    </>
  );
}
