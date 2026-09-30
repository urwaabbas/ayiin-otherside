import type { Product } from "@/lib/types";
import { priceInsight, unitPrice, bestTier } from "@/lib/commerce";

export type SortKey = "match" | "price-asc" | "price-desc" | "rating" | "fastest" | "popular" | "volume";

export const SORTS: { key: SortKey; label: string; business?: boolean }[] = [
  { key: "match", label: "Best match" },
  { key: "popular", label: "Most bought" },
  { key: "rating", label: "Highest rated" },
  { key: "fastest", label: "Fastest delivery" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "volume", label: "Lowest volume price", business: true },
];

export type Filters = {
  sub?: string;
  min?: number;
  max?: number;
  within?: number; // delivery days
  rating?: number;
  deal?: boolean;
  brands: string[];
  colors: string[];
  bulk?: boolean;
  moq?: number;
  lead?: number;
  sort: SortKey;
};

export const COLOR_FAMILIES: Record<string, { label: string; swatch: string; words: string[] }> = {
  black: { label: "Black", swatch: "#1E2126", words: ["black", "ink", "graphite", "midnight"] },
  white: { label: "White", swatch: "#F1F0EA", words: ["white", "chalk", "porcelain", "bone", "crystal"] },
  grey: { label: "Grey", swatch: "#A7ABB2", words: ["grey", "gray", "silver", "slate", "fog", "smoke", "stone", "steel"] },
  blue: { label: "Blue", swatch: "#5967FF", words: ["blue", "electric", "cobalt"] },
  green: { label: "Green", swatch: "#6F7A55", words: ["green", "moss", "olive", "sage", "signal"] },
  brown: { label: "Brown", swatch: "#B98A55", words: ["brown", "kraft", "clay", "rust", "terracotta", "tortoise", "sand", "oat", "travertine", "amber", "gold"] },
};

export function colorFamiliesOf(p: Product) {
  return Object.entries(COLOR_FAMILIES)
    .filter(([, f]) => p.variants.some((v) => f.words.some((w) => v.name.toLowerCase().includes(w))))
    .map(([k]) => k);
}

type Params = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const many = (v: string | string[] | undefined) => (v ? (Array.isArray(v) ? v : v.split(",")).filter(Boolean) : []);
const num = (v: string | string[] | undefined) => {
  const n = Number(one(v));
  return Number.isFinite(n) && one(v) !== undefined && one(v) !== "" ? n : undefined;
};

export function parseFilters(sp: Params | URLSearchParams): Filters {
  const get = (k: string) => (sp instanceof URLSearchParams ? (sp.get(k) ?? undefined) : one(sp[k]));
  const getMany = (k: string) => (sp instanceof URLSearchParams ? many(sp.get(k) ?? undefined) : many(sp[k]));
  return {
    sub: get("sub"),
    min: num(get("min")),
    max: num(get("max")),
    within: get("fast") === "1" ? 1 : num(get("within")),
    rating: num(get("rating")),
    deal: get("deal") === "1",
    brands: getMany("brand"),
    colors: getMany("color"),
    bulk: get("bulk") === "1",
    moq: num(get("moq")),
    lead: num(get("lead")),
    sort: (get("sort") as SortKey) || "match",
  };
}

export function applyFilters(list: Product[], f: Filters, opts: { business?: boolean } = {}) {
  let out = list.filter((p) => {
    if (f.sub && p.subcategory !== f.sub) return false;
    const price = opts.business ? bestTier(p).price : p.price;
    if (f.min != null && price < f.min) return false;
    if (f.max != null && price > f.max) return false;
    if (f.within != null && p.delivery.max > f.within) return false;
    if (f.rating != null && p.rating < f.rating) return false;
    if (f.deal && !priceInsight(p).verifiedDeal) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.colors.length && !colorFamiliesOf(p).some((c) => f.colors.includes(c))) return false;
    if (f.bulk && !(p.tags.includes("bulk") || p.b2b.tiers.length > 1)) return false;
    if (f.moq != null && p.b2b.moq > f.moq) return false;
    if (f.lead != null && p.b2b.leadDays > f.lead) return false;
    return true;
  });
  const by = {
    match: () => 0,
    popular: (a: Product, b: Product) => b.soldLastWeek - a.soldLastWeek,
    rating: (a: Product, b: Product) => b.rating - a.rating || b.reviewCount - a.reviewCount,
    fastest: (a: Product, b: Product) => a.delivery.max - b.delivery.max || a.delivery.min - b.delivery.min,
    "price-asc": (a: Product, b: Product) => a.price - b.price,
    "price-desc": (a: Product, b: Product) => b.price - a.price,
    volume: (a: Product, b: Product) => unitPrice(a, 1_000_000) / a.price - unitPrice(b, 1_000_000) / b.price,
  }[f.sort];
  if (f.sort !== "match") out = [...out].sort(by);
  return out;
}

export function activeFilterCount(f: Filters) {
  return (
    Number(!!f.sub) +
    Number(f.min != null || f.max != null) +
    Number(f.within != null) +
    Number(f.rating != null) +
    Number(!!f.deal) +
    f.brands.length +
    f.colors.length +
    Number(!!f.bulk) +
    Number(f.moq != null) +
    Number(f.lead != null)
  );
}
