"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { useShop } from "@/lib/store";
import { products } from "@/lib/catalog/products";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
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

export function ForYou() {
  const selected = useShop((s) => s.interests);
  const toggleInterest = useShop((s) => s.toggleInterest);
  const [shuffle, setShuffle] = useState(0);

  const toggle = (id: string) => {
    toggleInterest(id);
    setShuffle(0);
  };

  const feed = useMemo(() => {
    const consumer = products.filter((p) => !["supplies", "safety"].includes(p.category) && !["paper", "scanner"].includes(p.kind));
    const scored = consumer.map((p) => {
      const hits = INTERESTS.filter((i) => selected.includes(i.id) && i.match(p));
      // Diversity: small deterministic jitter that changes with each "something different" press
      const jitter = ((p.id.charCodeAt(p.id.length - 1) * (shuffle + 3)) % 17) / 10;
      return { p, hits, score: hits.length * 3 + p.rating + jitter - (shuffle > 0 && hits.length ? shuffle * 0.4 : 0) };
    });
    scored.sort((a, b) => b.score - a.score);
    // Never show more than two items from the same category in a row of four
    const out: typeof scored = [];
    const perCat: Record<string, number> = {};
    for (const s of scored) {
      if ((perCat[s.p.category] ?? 0) >= 2) continue;
      perCat[s.p.category] = (perCat[s.p.category] ?? 0) + 1;
      out.push(s);
      if (out.length === 8) break;
    }
    return out;
  }, [selected, shuffle]);

  return (
    <>
      <SectionHeader
        index="02"
        kicker="Personal, not repetitive"
        title={<>Tuned to you.<br />Never on a loop.</>}
        description="Tell Ayiin what you're into. Every recommendation explains itself, no category repeats more than twice, and you can always ask for something different."
      />
      <div className="mt-10 flex flex-wrap items-center gap-2">
        <span className="eyebrow mr-2">Your interests</span>
        {INTERESTS.map((i) => (
          <button key={i.id} type="button" aria-pressed={selected.includes(i.id)} onClick={() => toggle(i.id)} className="chip">
            <span className={clsx("chip-dot h-1.5 w-1.5 rounded-full", selected.includes(i.id) ? "bg-lime" : "bg-line-strong")} />
            {i.label}
          </button>
        ))}
        <button type="button" onClick={() => setShuffle((s) => s + 1)} className="chip ml-auto !border-ink">
          <Icon name="repeat" size={14} /> Show me something different
        </button>
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
        {feed.map(({ p, hits }, n) => (
          <div key={`${p.id}`} className="animate-rise" style={{ animationDelay: `${n * 50}ms` }}>
            <ProductCard
              product={p}
              reason={hits.length ? `Because you like ${hits.map((h) => h.label).slice(0, 2).join(" & ")}` : shuffle ? "Something different" : "Highly rated this month"}
            />
          </div>
        ))}
      </div>
    </>
  );
}
