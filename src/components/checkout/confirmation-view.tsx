"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { productById } from "@/lib/catalog/products";
import { addBusinessDays, fmtDay, todayUTC } from "@/lib/format";
import { useHydrated, useShop } from "@/lib/store";
import { ProductArt } from "@/components/product/product-art";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";

export function ConfirmationView() {
  const sp = useSearchParams();
  const hydrated = useHydrated();
  const { fmt } = usePrefs();
  const orders = useShop((s) => s.orders);
  const [saved, setSaved] = useState(false);
  const order = orders.find((o) => o.id === sp.get("order")) ?? orders[0];

  if (!hydrated) return <div className="mt-10 h-[500px] rounded-[28px] bg-mist" />;
  if (!order) {
    return (
      <div className="mt-10 rounded-[32px] bg-white p-12 text-center shadow-[var(--shadow-hair)]">
        <p className="display text-[40px]">We couldn&apos;t find that order.</p>
        <Link href="/track" className="btn btn-ink mt-6">Track an order</Link>
      </div>
    );
  }

  const awaiting = order.status === "awaiting-approval";
  const maxDays = Math.max(...order.items.map((i) => productById(i.productId)?.delivery.max ?? 2));
  const t = todayUTC();
  const steps = awaiting
    ? [
        ["Submitted", "Just now", true],
        ["Manager approval", "Priya Raman · usually < 1h", false],
        ["PO issued & confirmed", "Automatically", false],
        ["Delivered", `Est. ${fmtDay(addBusinessDays(t, maxDays + 1))}`, false],
      ]
    : [
        ["Confirmed", "Just now", true],
        ["Packed", fmtDay(t), false],
        ["Shipped", fmtDay(addBusinessDays(t, Math.max(0, maxDays - 1))), false],
        ["Delivered", fmtDay(addBusinessDays(t, maxDays)), false],
      ];

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
      <div className="panel-ink relative overflow-hidden rounded-[32px] p-7 sm:p-10">
        <div aria-hidden className="grid-texture-dark pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="relative">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-lime text-ink">
            <Icon name={awaiting ? "clock" : "check"} size={22} strokeWidth={2.2} />
          </span>
          <h1 className="display mt-6 text-[44px] sm:text-[64px]">{awaiting ? "Sent for approval." : "It’s on its way."}</h1>
          <p className="mt-3 max-w-md text-[15px] text-mute-dark">
            Order <span className="num text-porcelain">{order.id}</span>
            {order.po && (
              <>
                {" "}· PO <span className="num text-porcelain">{order.po}</span>
              </>
            )}
            {order.email && <> · Confirmation sent to {order.email}</>}
          </p>
          <ol className="mt-10 space-y-0">
            {steps.map(([label, when, done], i) => (
              <li key={String(label)} className="relative flex gap-4 pb-7 last:pb-0">
                {i < steps.length - 1 && <span aria-hidden className="absolute left-[11px] top-7 h-[calc(100%-20px)] w-px bg-graphite-line" />}
                <span className={`relative mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${done ? "bg-lime text-ink" : "border border-graphite-line"}`}>
                  {done ? <Icon name="check" size={13} strokeWidth={2.6} /> : <span className="h-1.5 w-1.5 rounded-full bg-mute-dark" />}
                </span>
                <div>
                  <p className="text-[15px] font-medium">{label}</p>
                  <p className="text-[13px] text-mute-dark">{when}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href={`/track?order=${order.id}`} className="btn btn-signal">Track order</Link>
            <Link href="/" className="btn btn-on-dark">Keep browsing</Link>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-hair)]">
          <p className="text-[16px] font-medium">What you ordered</p>
          <ul className="mt-4 space-y-3">
            {order.items.map((i) => {
              const p = productById(i.productId);
              if (!p) return null;
              const variant = p.variants.find((v) => v.id === i.variantId) ?? p.variants[0];
              return (
                <li key={i.productId + i.variantId} className="flex items-center gap-3">
                  <ProductArt kind={p.kind} color={variant.color} accent={variant.accent} tint={p.tint} className="h-14 w-14 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                    <span className="block text-[12px] text-mute">Qty {i.qty} · {variant.name}</span>
                  </span>
                  <span className="num text-[13.5px]">{fmt(i.price * i.qty, { cents: true })}</span>
                </li>
              );
            })}
          </ul>
          {(() => {
            const items = order.items.reduce((s, i) => s + i.price * i.qty, 0);
            const extras = Math.max(0, order.total - items);
            return (
              <dl className="mt-5 space-y-1.5 border-t border-line pt-4 text-[13.5px]">
                <div className="flex justify-between"><dt className="text-ink-2">Items</dt><dd className="num">{fmt(items, { cents: true })}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-2">Delivery & tax</dt><dd className="num">{fmt(extras, { cents: true })}</dd></div>
                <div className="flex justify-between pt-1 text-[15px] font-medium"><dt>{order.status === "awaiting-approval" ? "Total (on approval)" : "Total paid"}</dt><dd className="num">{fmt(order.total, { cents: true })}</dd></div>
              </dl>
            );
          })()}
        </div>
        {order.mode === "personal" && (
          <div className="rounded-[28px] bg-white p-6 shadow-[var(--shadow-hair)]">
            {saved ? (
              <p className="flex items-center gap-2 text-[14.5px] font-medium">
                <Icon name="check" size={18} /> Saved. Next time checkout takes one tap.
              </p>
            ) : (
              <>
                <p className="text-[16px] font-medium">Save your details for next time?</p>
                <p className="mt-1 text-[13.5px] text-mute">No password — we&apos;ll email a sign-in link. Your order history, returns and tracking in one place.</p>
                <button type="button" onClick={() => setSaved(true)} className="btn btn-ink btn-sm mt-4">
                  Save with one tap
                </button>
              </>
            )}
          </div>
        )}
        <div className="rounded-[28px] bg-white p-6 text-[13.5px] text-ink-2 shadow-[var(--shadow-hair)]">
          <p className="flex items-center gap-2 font-medium text-ink"><Icon name="returns" size={16} /> Changed your mind?</p>
          <p className="mt-1">Free returns for 30 days after delivery. Start one from the tracking page — label included.</p>
        </div>
      </div>
    </div>
  );
}
