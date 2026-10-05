"use client";

import Link from "next/link";
import { productById } from "@/lib/catalog/products";
import { useHydrated, useShop } from "@/lib/store";
import { ProductImage } from "@/components/product/product-image";
import { Icon, type IconName } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { fmtLong } from "@/lib/format";
import { Loading, Skeleton } from "@/components/ui/skeleton";

export function AccountView() {
  const hydrated = useHydrated();
  const { fmt, setMode } = usePrefs();
  const orders = useShop((s) => s.orders).filter((o) => o.mode === "personal");
  const wishlist = useShop((s) => s.wishlist);
  const tiles: { icon: IconName; title: string; body: string; href: string }[] = [
    { icon: "truck", title: "Track an order", body: "Live status, exact delivery date", href: "/track" },
    { icon: "returns", title: "Start a return", body: "Free label, refund in 2 days", href: "/help#returns" },
    { icon: "heart", title: `Saved (${hydrated ? wishlist.length : 0})`, body: "Price & stock alerts", href: "/wishlist" },
    { icon: "compare", title: "Compare", body: "Side by side, differences only", href: "/compare" },
  ];
  return (
    <div className="mt-8 space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.title} href={t.href} className="group rounded-surface bg-white p-5 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)]">
            <span className="grid h-10 w-10 place-items-center rounded-control bg-mist transition-colors group-hover:bg-brand">
              <Icon name={t.icon} size={18} />
            </span>
            <p className="mt-4 text-body font-medium">{t.title}</p>
            <p className="text-support text-mute">{t.body}</p>
          </Link>
        ))}
      </div>
      <section className="rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]">
        <h2 className="text-emphasis font-medium tracking-[-0.02em]">Orders</h2>
        {!hydrated ? (
          <Loading label="Loading orders" className="mt-4 space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-12 w-12" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </Loading>
        ) : orders.length === 0 ? (
          <p className="mt-3 text-support text-mute">No orders yet on this device. Guest orders can be tracked with your order number and email.</p>
        ) : (
          <ul className="mt-4 divide-y divide-line">
            {orders.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-4 py-4">
                <div className="flex -space-x-2">
                  {o.items.slice(0, 3).map((i) => {
                    const p = productById(i.productId);
                    return p ? <ProductImage key={i.productId} product={p} variant={i.variantId} sizes="48px" className="h-12 w-12 rounded-control ring-2 ring-white" /> : null;
                  })}
                </div>
                <div className="min-w-0 flex-1 text-support">
                  <p className="num font-medium">{o.id}</p>
                  <p className="text-mute">{fmtLong(o.createdAt)} · {o.items.length} {o.items.length === 1 ? "item" : "items"}</p>
                </div>
                <p className="num text-support">{fmt(o.total, { cents: true })}</p>
                <Link href={`/track?order=${o.id}`} className="btn btn-secondary">Track</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="flex flex-col items-start justify-between gap-4 rounded-surface bg-info-soft p-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-body font-medium">Buying for work too?</p>
          <p className="text-support text-ink-2">Add a business profile to get volume pricing, invoices and net terms — same login.</p>
        </div>
        <button type="button" onClick={() => setMode("business")} className="btn btn-secondary shrink-0">
          Switch to Business
        </button>
      </section>
    </div>
  );
}
