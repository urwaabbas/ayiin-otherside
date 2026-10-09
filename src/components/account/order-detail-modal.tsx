"use client";

import { useEffect } from "react";
import { clsx } from "clsx";
import type { EnrichedOrder, SellerParcel } from "@/lib/account-orders";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";
import { fmtLong } from "@/lib/format";

export function OrderDetailModal({
  order,
  onClose,
}: {
  order: EnrichedOrder | null;
  onClose: () => void;
}) {
  const { fmt } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (order) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [order, onClose]);

  if (!order) return null;

  const handleReorder = () => {
    let count = 0;
    for (const parcel of order.parcels) {
      for (const item of parcel.items) {
        if (item?.product) {
          addToCart(item.product.id, item.variantId, item.qty);
          count += item.qty;
        }
      }
    }
    notify(
      "Items added to cart",
      `${count} ${count === 1 ? "piece" : "pieces"} from order ${order.id} transferred to your bag.`,
      { label: "View Bag", href: "/checkout" }
    );
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-order-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-10"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Surface */}
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-panel bg-white shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-line px-6 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="eyebrow">AYIIN MARKETPLACE FULFILLMENT</span>
              <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-meta font-medium text-brand-deep">
                {order.overallStatusLabel}
              </span>
            </div>
            <h2 id="modal-order-title" className="display mt-1 text-2xl sm:text-3xl">
              Order {order.id}
            </h2>
            <p className="mt-0.5 text-support text-mute">
              Placed on {fmtLong(order.createdAt)} · {order.parcels.length}{" "}
              {order.parcels.length === 1 ? "independent parcel" : "independent marketplace parcels"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-10 w-10 place-items-center rounded-full text-mute transition-colors hover:bg-mist hover:text-ink"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Marketplace Parcels Breakdown */}
          <div className="space-y-6">
            <h3 className="text-support font-semibold uppercase tracking-wider text-mute">
              Fulfillment & Tracking By Brand
            </h3>

            {order.parcels.map((parcel: SellerParcel) => (
              <div
                key={parcel.parcelId}
                className="overflow-hidden rounded-surface border border-line bg-porcelain p-5 sm:p-6"
              >
                {/* Parcel Origin Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-control font-medium text-white text-xs"
                      style={{ backgroundColor: parcel.seller?.color ?? "#1F1E1C" }}
                    >
                      {parcel.seller?.initials ?? "AY"}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{parcel.seller?.name ?? "AYIIN Studio"}</span>
                        <span className="text-meta text-mute">({parcel.seller?.location ?? "USA"})</span>
                      </div>
                      <p className="text-meta text-mute">
                        Carrier: {parcel.carrier} · Tracking:{" "}
                        <span className="font-mono text-ink">{parcel.trackingNumber}</span>
                      </p>
                    </div>
                  </div>

                  <span className="rounded-control bg-white px-3 py-1 text-meta font-medium text-ink shadow-[var(--shadow-hair)]">
                    {parcel.statusLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-5">
                  <div className="flex justify-between text-meta text-mute mb-1.5">
                    <span>Dispatched from {parcel.originLocation}</span>
                    <span>Delivers to {parcel.destinationLocation}</span>
                  </div>
                  <div className="relative h-2 overflow-hidden rounded-full bg-soft">
                    <div
                      className="h-full rounded-full bg-ink transition-all duration-700"
                      style={{ width: `${parcel.progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Milestones timeline */}
                <div className="mt-5 space-y-3">
                  {parcel.milestones.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-start gap-3 text-support">
                      <span
                        className={clsx(
                          "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full text-[9px]",
                          m.completed
                            ? "bg-ink text-white"
                            : m.current
                            ? "bg-brand ring-2 ring-ink"
                            : "border border-line-strong bg-white"
                        )}
                      >
                        {m.completed && <Icon name="check" size={10} strokeWidth={3} />}
                      </span>
                      <div className="flex-1">
                        <span className={clsx("font-medium", m.current ? "text-brand-deep" : "text-ink")}>
                          {m.label}
                        </span>
                        {m.location && <span className="text-mute"> · {m.location}</span>}
                      </div>
                      <span className="text-meta text-mute">{m.timestamp}</span>
                    </div>
                  ))}
                </div>

                {/* Items in this parcel */}
                <div className="mt-6 divide-y divide-line border-t border-line pt-4">
                  {parcel.items
                    .filter((item) => Boolean(item && item.product))
                    .map((item, iIdx) => (
                      <div key={iIdx} className="flex items-center gap-4 py-3">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-control bg-white p-1 shadow-sm">
                          <ProductImage
                            product={item.product}
                            variant={item.variantId}
                            sizes="56px"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-ink">{item.product?.name ?? "Piece"}</p>
                          <p className="text-meta text-mute">
                            Variant: {item.variantId} · Qty: {item.qty}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="num font-medium text-ink">
                            {fmt(item.price * item.qty, { cents: true })}
                          </p>
                          <p className="text-meta text-mute">
                            {fmt(item.price, { cents: true })} each
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Billing Summary */}
          <div className="grid gap-4 rounded-surface border border-line bg-mist/50 p-5 sm:grid-cols-2">
            <div>
              <p className="text-meta font-semibold uppercase tracking-wider text-mute">Delivery Address</p>
              <p className="mt-1.5 font-medium text-ink">{order.shippingAddress.name}</p>
              <p className="text-support text-mute">{order.shippingAddress.street}</p>
              <p className="text-support text-mute">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
              </p>
            </div>
            <div>
              <p className="text-meta font-semibold uppercase tracking-wider text-mute">Payment Instrument</p>
              <p className="mt-1.5 font-medium text-ink">
                {order.paymentMethod.brand} · ending in {order.paymentMethod.last4}
              </p>
              <p className="text-support text-mute">Billing status: Paid & Confirmed</p>
              <p className="text-meta text-success font-medium mt-1">✓ Carbon Neutral Offset Included</p>
            </div>
          </div>

          {/* Order Financial Totals */}
          <div className="border-t border-line pt-4 space-y-2 text-support">
            <div className="flex justify-between text-mute">
              <span>Item Subtotal ({order.totalItems} pieces)</span>
              <span className="num text-ink">{fmt(order.total, { cents: true })}</span>
            </div>
            <div className="flex justify-between text-mute">
              <span>Marketplace Multi-Origin Shipping</span>
              <span className="text-success font-medium">Complimentary</span>
            </div>
            <div className="flex justify-between text-mute">
              <span>Estimated Sales Tax</span>
              <span className="num text-ink">$0.00 (Included)</span>
            </div>
            <div className="flex justify-between border-t border-line pt-3 font-medium text-ink text-body">
              <span>Total Paid</span>
              <span className="num text-xl">{fmt(order.total, { cents: true })}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-porcelain px-6 py-4 sm:px-8">
          <button
            type="button"
            onClick={handlePrintInvoice}
            className="btn btn-ghost text-support hover:bg-white"
          >
            <Icon name="receipt" size={15} />
            <span>Download Invoice</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleReorder}
              className="btn btn-secondary text-support"
            >
              <Icon name="repeat" size={15} />
              <span>Buy Again</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary text-support"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
