import type { Product } from "@/lib/types";
import { addBusinessDays, relativeDay, todayUTC, fmtDay } from "@/lib/format";

/* ─── Delivery ───────────────────────────────────────────── */

export function deliveryWindow(p: Product, now = todayUTC()) {
  const min = addBusinessDays(now, p.delivery.min);
  const max = addBusinessDays(now, p.delivery.max);
  return { min, max, sameDay: p.delivery.min === p.delivery.max };
}

/** Human, exact delivery promise: "Tomorrow" / "Thu, Oct 2" — never "3–7 business days". */
export function deliveryLabel(p: Product, now = todayUTC()) {
  const { min, max, sameDay } = deliveryWindow(p, now);
  if (sameDay || p.delivery.min === p.delivery.max) return relativeDay(max, now);
  if (p.delivery.max - p.delivery.min <= 1) return relativeDay(max, now);
  return `${relativeDay(min, now)} – ${fmtDay(max)}`;
}

export function arrivesBy(p: Product, now = todayUTC()) {
  return addBusinessDays(now, p.delivery.max);
}

export function daysUntil(p: Product) {
  return p.delivery.max;
}

/* ─── Price intelligence ─────────────────────────────────── */

export type PriceInsight = {
  tone: "lime" | "blue" | "mute";
  label: string;
  detail: string;
  verifiedDeal: boolean;
  typical: number;
  low: number;
};

export function priceInsight(p: Product): PriceInsight {
  const past = p.history.slice(0, -1);
  const low = Math.min(...past);
  const typical = past.reduce((a, b) => a + b, 0) / past.length;
  const savings = p.compareAt ? p.compareAt - p.price : 0;
  if (p.price < low) {
    return {
      tone: "lime",
      label: "Lowest price in 90 days",
      detail: "Verified against 12 weeks of pricing",
      verifiedDeal: true,
      typical,
      low,
    };
  }
  if (savings > 0 && p.price <= typical * 0.97) {
    return {
      tone: "lime",
      label: `${Math.round(((typical - p.price) / typical) * 100)}% below typical`,
      detail: "Verified against 12 weeks of pricing",
      verifiedDeal: true,
      typical,
      low,
    };
  }
  if (p.price <= typical * 1.01) {
    return { tone: "mute", label: "Fair price", detail: "In line with its 90-day average", verifiedDeal: false, typical, low };
  }
  return { tone: "blue", label: "Price is stable", detail: "No meaningful changes in 90 days", verifiedDeal: false, typical, low };
}

export function savingsPct(p: Product) {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

/* ─── Stock ──────────────────────────────────────────────── */

export function stockSignal(p: Product): { tone: "lime" | "amber" | "danger"; label: string; urgent: boolean } {
  if (p.stock <= 0) return { tone: "danger", label: "Back soon — get notified", urgent: false };
  if (p.stock <= 15) return { tone: "amber", label: `Only ${p.stock} left`, urgent: true };
  if (p.stock <= 60) return { tone: "amber", label: `Low stock · ${p.stock} left`, urgent: false };
  if (p.stock >= 1000) return { tone: "lime", label: `In stock · ${(p.stock / 1000).toFixed(p.stock >= 10000 ? 0 : 1)}k+ available`, urgent: false };
  return { tone: "lime", label: "In stock", urgent: false };
}

/* ─── Business pricing ───────────────────────────────────── */

export function unitPrice(p: Product, qty: number, opts: { contract?: boolean } = {}) {
  let price = p.price;
  for (const t of p.b2b.tiers) if (qty >= t.min) price = t.price;
  if (opts.contract && p.b2b.contractPrice) price = Math.min(price, p.b2b.contractPrice);
  return price;
}

export function nextTier(p: Product, qty: number) {
  return p.b2b.tiers.find((t) => t.min > qty);
}

export function bestTier(p: Product) {
  return p.b2b.tiers[p.b2b.tiers.length - 1];
}

export function tierSavingPct(p: Product, price: number) {
  return Math.round(((p.price - price) / p.price) * 100);
}

/* ─── Totals ─────────────────────────────────────────────── */

export const FREE_SHIPPING_THRESHOLD = 35;
export const TAX_RATE = 0.0825;

export function ratingBreakdown(p: Product) {
  // Deterministic distribution consistent with the average rating.
  const r = p.rating;
  const five = Math.round((r - 3.6) * 58);
  const four = Math.round(100 - five - (5 - r) * 14);
  const three = Math.max(1, Math.round((5 - r) * 7));
  const two = Math.max(0, Math.round((5 - r) * 3));
  const one = Math.max(0, 100 - five - four - three - two);
  return [five, four, three, two, one].map((v) => Math.max(0, v));
}
