"use client";

import { clsx } from "clsx";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { Stars } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";
import { ratingBreakdown } from "@/lib/commerce";
import { fmtLong } from "@/lib/format";

export function Reviews({ product: p }: { product: Product }) {
  const [filter, setFilter] = useState<
    "all" | "verified" | "business" | "critical"
  >("all");
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  const dist = ratingBreakdown(p);
  const shown = p.reviews.filter((r) =>
    filter === "verified"
      ? r.verified
      : filter === "business"
        ? r.business
        : filter === "critical"
          ? r.rating <= 4
          : true,
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
      <div>
        <p className="display text-display-lg leading-none">
          {p.rating.toFixed(1)}
        </p>
        <Stars value={p.rating} size={16} className="mt-3" />
        <p className="mt-2 text-support text-mute">
          <span className="num">{p.reviewCount.toLocaleString("en-US")}</span>{" "}
          reviews · 100% from verified purchases
        </p>
        <ul className="mt-6 space-y-2">
          {dist.map((pct, i) => (
            <li key={i} className="flex items-center gap-3 text-meta">
              <span className="num w-3 text-mute">{5 - i}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-soft">
                <span
                  className="block h-full rounded-full bg-ink"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="num w-9 text-right text-mute">{pct}%</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 rounded-surface bg-white p-4 text-meta leading-relaxed text-ink-2 shadow-[var(--shadow-hair)]">
          <Icon
            name="shield"
            size={14}
            className="mr-1.5 inline -translate-y-px"
          />
          Ayiin only publishes reviews tied to a completed order. Incentivised
          reviews are removed, and sellers can&apos;t hide criticism.
        </p>
      </div>
      <div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter reviews"
        >
          {(
            [
              ["all", "All"],
              ["verified", "Verified purchase"],
              ["business", "Business buyers"],
              ["critical", "Critical (≤4★)"],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              className="chip"
            >
              {l}
            </button>
          ))}
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {shown.length === 0 && (
            <li className="py-8 text-support text-mute">
              No reviews match this filter yet.
            </li>
          )}
          {shown.map((r, i) => (
            <li key={i} className="py-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-soft text-meta font-medium">
                    {r.author
                      .split(" ")
                      .map((s) => s[0])
                      .join("")}
                  </span>
                  <div>
                    <p className="text-support font-medium">
                      {r.author}
                      {r.role && (
                        <span className="font-normal text-mute">
                          {" "}
                          · {r.role}
                        </span>
                      )}
                    </p>
                    <p className="flex items-center gap-2 text-meta text-mute">
                      <Stars value={r.rating} size={10} />
                      {fmtLong(r.date)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {r.verified && (
                    <span className="rounded-full bg-success-soft px-2.5 py-1 text-meta font-medium text-success">
                      Verified purchase
                    </span>
                  )}
                  {r.business && (
                    <span className="rounded-full bg-info-soft px-2.5 py-1 text-meta font-medium text-info">
                      Business buyer
                    </span>
                  )}
                </div>
              </div>
              <p className="mt-3 text-body font-medium">{r.title}</p>
              <p className="mt-1 max-w-2xl text-support leading-relaxed text-ink-2">
                {r.body}
              </p>
              <button
                type="button"
                aria-pressed={!!helpful[i]}
                onClick={() => setHelpful((h) => ({ ...h, [i]: !h[i] }))}
                className={clsx(
                  "mt-3 inline-flex items-center gap-1.5 text-meta",
                  helpful[i] ? "text-ink" : "text-mute hover:text-ink",
                )}
              >
                <Icon name="check" size={13} /> Helpful
                {helpful[i] ? " · thanks" : ""}
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-support text-mute">
          Showing {shown.length} of{" "}
          <span className="num">{p.reviewCount.toLocaleString("en-US")}</span>
        </p>
      </div>
    </div>
  );
}
