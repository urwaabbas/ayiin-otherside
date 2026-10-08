"use client";

import Link from "next/link";
import { usePrefs } from "@/components/providers";
import { Icon } from "@/components/ui/icon";
import type { Product } from "@/lib/types";

export function BusinessBridge({ product: gloves }: { product: Product }) {
  const { setMode, fmt } = usePrefs();
  const max = gloves.b2b.tiers[0].price;
  return (
    <div className="relative overflow-hidden rounded-surface bg-mist">
      <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="display text-display-sm sm:text-display-md">
              Same marketplace.
              <br />
              Built for teams.
            </h2>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("business");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              suppressHydrationWarning
              className="btn btn-secondary"
            >
              <span className="h-2 w-2 rounded-full bg-brand" /> Switch to
              Business
            </button>
            <Link href="/business" className="btn btn-secondary">
              How it works
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-surface bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <p className="text-support font-medium">
                {gloves.name.split(" — ")[0]}
              </p>
              <span className="eyebrow">Unit price by volume</span>
            </div>
            <div className="mt-5 flex h-[140px] items-end gap-3">
              {gloves.b2b.tiers.map((t, i) => (
                <div
                  key={t.min}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="num text-meta font-medium">
                    {fmt(t.price, { cents: true })}
                  </span>
                  <div
                    className={`w-full rounded-t-control ${i === gloves.b2b.tiers.length - 1 ? "bg-brand shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "bg-soft"}`}
                    style={{ height: `${(t.price / max) * 100}px` }}
                  />
                  <span className="num text-meta text-mute">{t.min}+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-surface bg-ink p-6 text-porcelain">
            <p className="eyebrow !text-mute-dark">Approval flow · PO-20931</p>
            <ol className="mt-4 flex items-center gap-2 text-meta">
              {[
                ["Requested", "Jamie · Ops", true],
                ["Manager", "Priya", true],
                ["Finance", "Auto ≤ $5k", false],
              ].map(([t, who, done], i) => (
                <li key={String(t)} className="flex flex-1 items-center gap-2">
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${done ? "bg-brand text-ink" : "border border-graphite-line text-mute-dark"}`}
                  >
                    {done ? (
                      <Icon name="check" size={14} strokeWidth={2.4} />
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium">{t}</span>
                    <span className="block truncate text-mute-dark">{who}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
