"use client";

import Link from "next/link";
import { usePrefs } from "@/components/providers";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/signal";
import type { Product } from "@/lib/types";

export function BusinessBridge({ product: gloves }: { product: Product }) {
  const { setMode, fmt } = usePrefs();
  const max = gloves.b2b.tiers[0].price;
  return (
    <div className="relative overflow-hidden rounded-[36px] bg-mist">
      <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-[1.1fr_1fr] lg:p-14">
        <div className="flex flex-col justify-between">
          <div>
            <Eyebrow index="08">Buying for a company?</Eyebrow>
            <h2 className="display mt-4 text-[44px] sm:text-[64px]">
              Same marketplace.
              <br />
              Built for teams.
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-2">
              Switch to Business and Ayiin becomes a procurement tool: volume pricing on every listing, quotes from multiple suppliers in one request, approval rules, purchase orders and net-30 terms.
            </p>
            <ul className="mt-6 grid gap-2 text-[14.5px] sm:grid-cols-2">
              {["Tiered & contract pricing", "Multi-supplier quotes", "Approvals & budgets", "PO, invoice & net terms", "One-click reorders", "Tax-exempt checkout"].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <Icon name="check" size={16} className="text-brand-deep" strokeWidth={2} /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setMode("business");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="btn btn-ink btn-lg"
            >
              <span className="h-2 w-2 rounded-full bg-brand" /> Switch to Business
            </button>
            <Link href="/business" className="btn btn-ghost btn-lg">
              How it works
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[26px] bg-white p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-medium">{gloves.name.split(" — ")[0]}</p>
              <span className="eyebrow">Unit price by volume</span>
            </div>
            <div className="mt-5 flex h-[140px] items-end gap-3">
              {gloves.b2b.tiers.map((t, i) => (
                <div key={t.min} className="flex flex-1 flex-col items-center gap-2">
                  <span className="num text-[12.5px] font-medium">{fmt(t.price, { cents: true })}</span>
                  <div
                    className={`w-full rounded-t-xl ${i === gloves.b2b.tiers.length - 1 ? "bg-brand shadow-[inset_0_0_0_1.5px_var(--color-ink)]" : "bg-soft"}`}
                    style={{ height: `${(t.price / max) * 100}px` }}
                  />
                  <span className="num text-[11.5px] text-mute">{t.min}+</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[26px] bg-ink p-6 text-porcelain">
            <p className="eyebrow !text-mute-dark">Approval flow · PO-20931</p>
            <ol className="mt-4 flex items-center gap-2 text-[12.5px]">
              {[
                ["Requested", "Jamie · Ops", true],
                ["Manager", "Priya", true],
                ["Finance", "Auto ≤ $5k", false],
              ].map(([t, who, done], i) => (
                <li key={String(t)} className="flex flex-1 items-center gap-2">
                  <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${done ? "bg-brand text-ink" : "border border-graphite-line text-mute-dark"}`}>
                    {done ? <Icon name="check" size={14} strokeWidth={2.4} /> : i + 1}
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
