import { productBySlug } from "@/lib/catalog/products";
import { unitPrice } from "@/lib/commerce";
import type { Product } from "@/lib/types";

/**
 * Multi-vendor offers: the same catalogue item stocked by several verified sellers.
 * The listing seller's offer uses the product's own tiers; alternates apply a price factor.
 */
export type Offer = {
  sellerId: string;
  factor: number;
  leadDays: number;
  moq: number;
  shipping: number;
  stock: number;
};

const OFFERS: Record<string, Offer[]> = {
  "nitrile-gloves-4mil": [
    { sellerId: "guardline", factor: 1, leadDays: 1, moq: 1, shipping: 0, stock: 64000 },
    { sellerId: "brightline", factor: 1.04, leadDays: 2, moq: 1, shipping: 0, stock: 18000 },
    { sellerId: "parcel", factor: 0.97, leadDays: 4, moq: 20, shipping: 24, stock: 40000 },
  ],
  "premium-copy-paper-a4": [
    { sellerId: "brightline", factor: 1, leadDays: 1, moq: 1, shipping: 0, stock: 24000 },
    { sellerId: "parcel", factor: 0.96, leadDays: 3, moq: 10, shipping: 35, stock: 9000 },
    { sellerId: "guardline", factor: 1.05, leadDays: 2, moq: 1, shipping: 0, stock: 4000 },
  ],
  "double-wall-cartons-12x10x8": [
    { sellerId: "parcel", factor: 1, leadDays: 1, moq: 1, shipping: 0, stock: 18000 },
    { sellerId: "brightline", factor: 1.08, leadDays: 2, moq: 1, shipping: 0, stock: 3000 },
    { sellerId: "guardline", factor: 0.99, leadDays: 5, moq: 40, shipping: 60, stock: 12000 },
  ],
  "ergo-task-chair-pro": [
    { sellerId: "brightline", factor: 1, leadDays: 4, moq: 1, shipping: 0, stock: 340 },
    { sellerId: "atelier-mesa", factor: 1.06, leadDays: 9, moq: 1, shipping: 0, stock: 60 },
  ],
};

export function offersFor(p: Product) {
  return OFFERS[p.slug] ?? [{ sellerId: p.sellerId, factor: 1, leadDays: p.b2b.leadDays, moq: p.b2b.moq, shipping: p.shipping, stock: p.stock }];
}

export function priceOffers(p: Product, qty: number) {
  return offersFor(p)
    .map((o) => {
      const unit = Math.round(unitPrice(p, qty) * o.factor * 100) / 100;
      const eligible = qty >= o.moq && qty <= o.stock;
      return { ...o, unit, total: unit * qty + o.shipping, eligible };
    })
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || a.total - b.total);
}

export const VOLUME_PRODUCTS = ["nitrile-gloves-4mil", "premium-copy-paper-a4", "double-wall-cartons-12x10x8", "ergo-task-chair-pro"].map(
  (s) => productBySlug(s)!,
);
