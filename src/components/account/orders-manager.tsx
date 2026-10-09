"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { clsx } from "clsx";
import { useShop, useHydrated } from "@/lib/store";
import { enrichOrders, type EnrichedOrder } from "@/lib/account-orders";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { fmtLong } from "@/lib/format";
import { OrderDetailModal } from "./order-detail-modal";

export function OrdersManager() {
  const hydrated = useHydrated();
  const { fmt } = usePrefs();
  const rawOrders = useShop((s) => s.orders);
  const [filter, setFilter] = useState<"all" | "in_transit" | "delivered">("all");
  const [search, setSearch] = useState("");
  const [activeOrder, setActiveOrder] = useState<EnrichedOrder | null>(null);

  const orders = useMemo(() => {
    return enrichOrders(rawOrders);
  }, [rawOrders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (filter === "in_transit" && o.overallStatus !== "in_transit" && o.overallStatus !== "processing") {
        return false;
      }
      if (filter === "delivered" && o.overallStatus !== "delivered") {
        return false;
      }
      if (search.trim()) {
        const query = search.trim().toLowerCase();
        const matchesId = o.id.toLowerCase().includes(query);
        const matchesItem = o.parcels.some((p) =>
          p.items.some((i) => (i.product?.name ?? "").toLowerCase().includes(query) || (p.seller?.name ?? "").toLowerCase().includes(query))
        );
        return matchesId || matchesItem;
      }
      return true;
    });
  }, [orders, filter, search]);

  if (!hydrated) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-44 animate-pulse rounded-surface bg-mist" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtering and Search Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 rounded-control bg-porcelain p-1 border border-line">
          {[
            { id: "all", label: "All Orders", count: orders.length },
            { id: "in_transit", label: "In Transit", count: orders.filter((o) => o.overallStatus === "in_transit").length },
            { id: "delivered", label: "Delivered", count: orders.filter((o) => o.overallStatus === "delivered").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={clsx(
                "flex items-center gap-2 rounded-compact px-3 py-1.5 text-support transition-all",
                filter === tab.id
                  ? "bg-white font-medium text-ink shadow-[var(--shadow-hair)]"
                  : "text-mute hover:text-ink"
              )}
            >
              <span>{tab.label}</span>
              <span className="rounded-full bg-mist px-1.5 py-0.2 text-meta text-ink-2 font-mono">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative min-w-[240px]">
          <span className="pointer-events-none absolute left-3 top-2.5 text-mute">
            <Icon name="search" size={16} />
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order or brand..."
            className="field pl-9 text-support"
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-surface border border-dashed border-line-strong bg-white p-12 text-center">
          <p className="text-body font-medium text-ink">No orders found</p>
          <p className="mt-1 text-support text-mute">
            {search ? "Try clearing your search query." : "You have no orders matching this filter."}
          </p>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="btn btn-secondary mt-4 text-support"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <article
              key={order.id}
              className="overflow-hidden rounded-surface border border-line bg-white shadow-[var(--shadow-hair)] transition-all hover:shadow-[var(--shadow-soft)]"
            >
              {/* Order Card Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-porcelain/60 px-5 py-3.5 sm:px-6">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-support">
                  <div>
                    <span className="text-meta text-mute">ORDER</span>{" "}
                    <span className="font-mono font-medium text-ink">{order.id}</span>
                  </div>
                  <span className="hidden sm:inline text-line-strong">·</span>
                  <div>
                    <span className="text-meta text-mute">DATE</span>{" "}
                    <span className="text-ink">{fmtLong(order.createdAt)}</span>
                  </div>
                  <span className="hidden sm:inline text-line-strong">·</span>
                  <div>
                    <span className="text-meta text-mute">TOTAL</span>{" "}
                    <span className="num font-semibold text-ink">{fmt(order.total, { cents: true })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-meta font-medium",
                      order.overallStatus === "delivered"
                        ? "bg-success-soft text-success"
                        : "bg-brand-soft text-brand-deep"
                    )}
                  >
                    <span
                      className={clsx(
                        "h-1.5 w-1.5 rounded-full",
                        order.overallStatus === "delivered" ? "bg-success" : "bg-brand animate-pulse"
                      )}
                    />
                    {order.overallStatusLabel}
                  </span>
                </div>
              </div>

              {/* Order Card Body */}
              <div className="p-5 sm:p-6">
                {/* Independent seller fulfillment badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="text-meta font-medium uppercase tracking-wider text-mute">
                    Marketplace Sellers:
                  </span>
                  {order.parcels.map((p) => (
                    <span
                      key={p.parcelId}
                      className="inline-flex items-center gap-1.5 rounded-control border border-line bg-mist/60 px-2.5 py-1 text-meta font-medium text-ink"
                    >
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: p.seller?.color ?? "#1F1E1C" }}
                      />
                      {p.seller?.name ?? "AYIIN Studio"}
                      <span className="text-mute font-mono">({p.carrier})</span>
                    </span>
                  ))}
                </div>

                {/* Items preview */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-3">
                    {order.parcels
                      .flatMap((p) => p.items)
                      .filter((item) => Boolean(item && item.product))
                      .map((item, i) => (
                        <div
                          key={i}
                          className="group relative h-16 w-16 overflow-hidden rounded-control border border-line bg-porcelain p-1 transition-transform hover:scale-105"
                          title={`${item.product?.name ?? "Product"} (${item.variantId})`}
                        >
                          <ProductImage
                            product={item.product}
                            variant={item.variantId}
                            sizes="64px"
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ))}

                    <div className="pl-2">
                      <p className="text-support font-medium text-ink">
                        {order.totalItems} {order.totalItems === 1 ? "Item" : "Items"} Total
                      </p>
                      <p className="text-meta text-mute">
                        Delivery to {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveOrder(order)}
                      className="btn btn-secondary text-support"
                    >
                      <Icon name="eye" size={15} />
                      <span>Order Details</span>
                    </button>

                    <Link
                      href={`/track?order=${order.id}`}
                      className="btn btn-primary text-support"
                    >
                      <Icon name="truck" size={15} />
                      <span>Live Tracker</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Interactive Detail Modal */}
      <OrderDetailModal
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
      />
    </div>
  );
}
