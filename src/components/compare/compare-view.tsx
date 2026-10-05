"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { productById, products } from "@/lib/catalog/products";
import { sellerById } from "@/lib/catalog/sellers";
import { deliveryLabel, priceInsight, stockSignal, unitPrice } from "@/lib/commerce";
import { ProductImage } from "@/components/product/product-image";
import { Stars } from "@/components/product/rating";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useHydrated, useShop, useUI } from "@/lib/store";
import type { Product } from "@/lib/types";
import { Loading, PanelsSkeleton } from "@/components/ui/skeleton";

type Row = { label: string; group: string; cells: React.ReactNode[]; raw: string[]; best?: number };

export function CompareView() {
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const { mode, fmt } = usePrefs();
  const business = mode === "business";
  const stored = useShop((s) => s.compare);
  const toggle = useShop((s) => s.toggleCompare);
  const clear = useShop((s) => s.clearCompare);
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);
  const [diffOnly, setDiffOnly] = useState(false);

  // Seed store from ?ids= links (e.g. "Compare all" on a product page)
  const idsParam = sp.get("ids");
  useEffect(() => {
    if (!hydrated || !idsParam) return;
    const ids = idsParam.split(",").filter((id) => productById(id));
    const current = useShop.getState().compare;
    ids.forEach((id) => {
      if (!current.includes(id)) useShop.getState().toggleCompare(id);
    });
  }, [hydrated, idsParam]);

  const items = useMemo(() => (hydrated ? (stored.map(productById).filter(Boolean) as Product[]) : []), [hydrated, stored]);

  if (!hydrated) return <Loading label="Loading comparison"><PanelsSkeleton count={4} /></Loading>;

  if (items.length === 0) {
    const suggestions = [...products].sort((a, b) => b.soldLastWeek - a.soldLastWeek).slice(0, 4);
    return (
      <div className="mt-10 rounded-surface bg-white p-8 text-center shadow-[var(--shadow-hair)] sm:p-14">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mist">
          <Icon name="compare" size={24} />
        </span>
        <p className="display mt-6 text-display-sm">Nothing to compare yet.</p>
        <p className="mx-auto mt-3 max-w-md text-body text-mute">Tap the compare icon on any product. Ayiin lines them up and hides everything that&apos;s identical.</p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
          {suggestions.map((p) => (
            <button key={p.id} type="button" onClick={() => toggle(p.id)} className="group rounded-surface bg-porcelain p-2 text-left text-support">
              <ProductImage product={p} className="aspect-square w-full rounded-control" />
              <span className="mt-2 flex items-center justify-between gap-2 px-1">
                <span className="truncate">{p.name}</span>
                <Icon name="plus" size={14} className="shrink-0" />
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const bestIdx = (vals: number[], dir: "min" | "max") => {
    const target = dir === "min" ? Math.min(...vals) : Math.max(...vals);
    const idx = vals.indexOf(target);
    return vals.filter((v) => v === target).length === vals.length ? undefined : idx;
  };
  const prices = items.map((p) => (business ? unitPrice(p, 100, { contract: true }) : p.price));
  const rows: Row[] = [
    { group: "Summary", label: business ? "Unit price @100" : "Price", cells: prices.map((v) => <span key={v} className="num font-medium">{fmt(v, { cents: !Number.isInteger(v) })}</span>), raw: prices.map(String), best: bestIdx(prices, "min") },
    { group: "Summary", label: "Price check", cells: items.map((p) => priceInsight(p).label), raw: items.map((p) => priceInsight(p).label) },
    {
      group: "Summary",
      label: "Rating",
      cells: items.map((p) => (
        <span key={p.id} className="inline-flex items-center gap-2">
          <Stars value={p.rating} /> <span className="num">{p.rating}</span>
        </span>
      )),
      raw: items.map((p) => String(p.rating)),
      best: bestIdx(items.map((p) => p.rating), "max"),
    },
    { group: "Summary", label: "Best for", cells: items.map((p) => p.brief.bestFor), raw: items.map((p) => p.brief.bestFor) },
    { group: "Delivery & trust", label: "Arrives", cells: items.map((p) => deliveryLabel(p)), raw: items.map((p) => deliveryLabel(p)), best: bestIdx(items.map((p) => p.delivery.max), "min") },
    { group: "Delivery & trust", label: "Availability", cells: items.map((p) => stockSignal(p).label), raw: items.map((p) => stockSignal(p).label) },
    { group: "Delivery & trust", label: "Returns", cells: items.map((p) => `${p.returns.free ? "Free" : "Paid"} · ${p.returns.days} days`), raw: items.map((p) => `${p.returns.free}${p.returns.days}`), best: bestIdx(items.map((p) => p.returns.days + (p.returns.free ? 100 : 0)), "max") },
    { group: "Delivery & trust", label: "Seller on-time", cells: items.map((p) => <span key={p.id} className="num">{sellerById(p.sellerId).onTime}%</span>), raw: items.map((p) => String(sellerById(p.sellerId).onTime)), best: bestIdx(items.map((p) => sellerById(p.sellerId).onTime), "max") },
  ];
  if (business) {
    rows.push(
      { group: "Procurement", label: "MOQ", cells: items.map((p) => `${p.b2b.moq} ${p.b2b.unit}`), raw: items.map((p) => String(p.b2b.moq)) },
      { group: "Procurement", label: "Lead time", cells: items.map((p) => `${p.b2b.leadDays} days`), raw: items.map((p) => String(p.b2b.leadDays)), best: bestIdx(items.map((p) => p.b2b.leadDays), "min") },
    );
  }
  const specKeys = Array.from(new Set(items.flatMap((p) => Object.keys(p.specs))));
  specKeys.forEach((k) => rows.push({ group: "Specifications", label: k, cells: items.map((p) => p.specs[k] ?? "—"), raw: items.map((p) => p.specs[k] ?? "—") }));
  const shown = diffOnly ? rows.filter((r) => new Set(r.raw).size > 1) : rows;
  const groups = Array.from(new Set(shown.map((r) => r.group)));

  return (
    <div className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-support text-ink-2">
          {items.length} products · {rows.filter((r) => new Set(r.raw).size > 1).length} differences
        </p>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-support">
            Differences only
            <button type="button" role="switch" aria-checked={diffOnly} onClick={() => setDiffOnly((d) => !d)} className={clsx("relative h-6 w-10 rounded-full transition-colors", diffOnly ? "bg-ink" : "bg-line-strong")}>
              <span className={clsx("absolute top-1 h-4 w-4 rounded-full transition-all", diffOnly ? "left-5 bg-brand" : "left-1 bg-white")} />
            </button>
          </label>
          <button type="button" onClick={clear} className="chip">
            Clear all
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-surface bg-white shadow-[var(--shadow-hair)] thin-scroll">
        <table className="w-full min-w-[720px] table-fixed border-collapse text-left text-support">
          <colgroup>
            <col className="w-[180px]" />
            {items.map((p) => (
              <col key={p.id} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th scope="col" className="p-5 align-bottom text-support font-normal text-mute">
                {items.length < 4 && (
                  <Link href="/search" className="flex h-full flex-col items-start gap-2 text-ink-2 hover:text-ink">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-line-strong">
                      <Icon name="plus" size={16} />
                    </span>
                    Add product
                  </Link>
                )}
              </th>
              {items.map((p) => (
                <th key={p.id} scope="col" className="p-4 align-top font-normal">
                  <div className="relative">
                    <button type="button" onClick={() => toggle(p.id)} aria-label={`Remove ${p.name}`} className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[var(--shadow-hair)]">
                      <Icon name="close" size={14} />
                    </button>
                    <Link href={`/p/${p.slug}`} aria-label={p.name} tabIndex={-1}>
                      <ProductImage product={p} sizes="(min-width: 1024px) 22vw, 45vw" className="aspect-[4/3] w-full rounded-surface" />
                    </Link>
                  </div>
                  <Link href={`/p/${p.slug}`} className="mt-3 block text-body font-medium leading-snug hover:underline">
                    {p.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(p.id, p.variants[0].id, business ? Math.max(p.b2b.moq, 1) : 1, business);
                      notify(business ? "Added to cart" : "Added to cart", p.name);
                    }}
                    className="btn btn-secondary mt-3 w-full"
                  >
                    {business ? "Add to cart" : "Add to cart"}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g}>
              <tr>
                <th colSpan={items.length + 1} scope="colgroup" className="bg-porcelain px-5 py-2.5 font-mono text-meta font-normal uppercase tracking-[0.14em] text-mute">
                  {g}
                </th>
              </tr>
              {shown
                .filter((r) => r.group === g)
                .map((r) => (
                  <tr key={r.label} className="border-t border-line">
                    <th scope="row" className="px-5 py-3.5 align-top font-normal text-mute">
                      {r.label}
                    </th>
                    {r.cells.map((c, i) => (
                      <td key={i} className="px-4 py-3.5 align-top">
                        <span className={clsx("inline-flex items-center gap-1.5", r.best === i && "rounded-full bg-brand-soft py-0.5 pl-2 pr-2.5 font-medium")}>
                          {r.best === i && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />}
                          {c}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          ))}
        </table>
      </div>
    </div>
  );
}
