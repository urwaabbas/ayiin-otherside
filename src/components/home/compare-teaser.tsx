"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { SectionHeader } from "@/components/ui/section";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { deliveryLabel } from "@/lib/commerce";

type Row = { label: string; values: (string | number)[]; best?: number; format?: "money" };

/** `items` are the three products the spec rows below describe (see COMPARE_SLUGS). */
export function CompareTeaser({ items }: { items: Product[] }) {
  const { fmt } = usePrefs();
  const [diffOnly, setDiffOnly] = useState(true);
  const rows: Row[] = [
    { label: "Price", values: items.map((p) => p.price), best: 2, format: "money" },
    { label: "Noise cancelling", values: ["Adaptive, −38 dB", "Adaptive", "—"], best: 0 },
    { label: "Battery", values: ["40 h", "8 h (+30 h case)", "20 h"], best: 0 },
    { label: "Weight", values: ["268 g", "5.1 g / bud", "540 g"], best: 1 },
    { label: "Water resistance", values: ["—", "IPX5", "IP67"], best: 2 },
    { label: "Arrives", values: items.map((p) => deliveryLabel(p)) },
    { label: "Free returns", values: ["30 days", "30 days", "30 days"] },
    { label: "Warranty", values: ["2 years", "2 years", "2 years"] },
    { label: "Rating", values: items.map((p) => p.rating.toFixed(1)), best: 0 },
  ];
  const shown = diffOnly ? rows.filter((r) => new Set(r.values.map(String)).size > 1) : rows;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:items-center lg:gap-16">
      <div>
        <SectionHeader
          index="06"
          kicker="Compare without tabs"
          title={<>Only the differences.</>}
          description="Add anything to compare from any page. Ayiin lines up the specs, hides what's identical and marks the strongest option on each line."
        />
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/compare" className="btn btn-ink">
            Open compare <Icon name="arrowRight" size={16} />
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] bg-white shadow-[var(--shadow-hair)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <p className="text-[13.5px] font-medium">Commute audio · 3 products</p>
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-ink-2">
            <span>Differences only</span>
            <button
              type="button"
              role="switch"
              aria-checked={diffOnly}
              onClick={() => setDiffOnly((d) => !d)}
              className={clsx("relative h-6 w-10 rounded-full transition-colors duration-300", diffOnly ? "bg-ink" : "bg-line-strong")}
            >
              <span className={clsx("absolute top-1 h-4 w-4 rounded-full transition-all duration-300", diffOnly ? "left-5 bg-brand" : "left-1 bg-white")} />
            </button>
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13.5px]">
            <thead>
              <tr>
                <th className="w-[140px] p-4 align-bottom font-normal text-mute">
                  <span className="sr-only">Attribute</span>
                </th>
                {items.map((p) => (
                  <th key={p.id} scope="col" className="p-3 align-bottom font-normal">
                    <Link href={`/p/${p.slug}`} className="group block">
                      <ProductImage product={p} className="aspect-square w-full rounded-2xl short:aspect-auto short:h-[clamp(64px,calc(100vh-540px),150px)]" />
                      <span className="mt-2 block text-[13.5px] font-medium leading-snug group-hover:underline">{p.name}</span>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.label} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-normal text-mute short:py-[clamp(6px,1.2vh,12px)]">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="px-3 py-3 short:py-[clamp(6px,1.2vh,12px)]">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 rounded-full",
                          r.best === i && "bg-brand-soft py-0.5 pl-1.5 pr-2.5 font-medium text-ink",
                        )}
                      >
                        {r.best === i && <span className="h-1.5 w-1.5 rounded-full bg-ink" />}
                        <span className={r.format === "money" ? "num" : undefined}>{r.format === "money" ? fmt(Number(v)) : v}</span>
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
