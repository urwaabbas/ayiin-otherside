import { products } from "@/lib/catalog/products";
import { categories } from "@/lib/catalog/categories";
import type { Product } from "@/lib/types";

/**
 * Ayiin Intent — a lightweight natural-language query parser.
 * "quiet headphones under $250 for flights by friday" →
 *   terms: [quiet, headphones] · maxPrice 250 · useCase travel · deliverBy 3 days
 */

export type IntentChip = { key: string; label: string; kind: "price" | "qty" | "delivery" | "use" | "color" | "category" | "attr" };

export type Intent = {
  raw: string;
  terms: string[];
  minPrice?: number;
  maxPrice?: number;
  qty?: number;
  deliverWithin?: number;
  useCase?: string;
  color?: string;
  category?: string;
  chips: IntentChip[];
};

const USE_CASES: Record<string, string[]> = {
  travel: ["travel", "flight", "flights", "flying", "plane", "trip", "trips", "commute", "commuting"],
  running: ["running", "run", "runs", "jogging", "marathon"],
  gym: ["gym", "workout", "training"],
  office: ["office", "work", "desk", "team", "teams", "coworkers", "employees", "staff"],
  gift: ["gift", "gifts", "present", "birthday", "anniversary"],
  cafe: ["cafe", "café", "coffee shop", "restaurant", "hospitality", "bar"],
  warehouse: ["warehouse", "fulfilment", "fulfillment", "logistics", "shipping"],
  home: ["home", "living room", "bedroom", "apartment"],
  outdoor: ["outdoor", "outdoors", "hiking", "camping", "beach", "pool"],
};

const USE_LABEL: Record<string, string> = {
  travel: "Travel-ready",
  running: "For running",
  gym: "For the gym",
  office: "For work",
  gift: "Giftable",
  cafe: "Hospitality",
  warehouse: "Warehouse use",
  home: "For home",
  outdoor: "Outdoors",
};

const COLORS: Record<string, string[]> = {
  black: ["black", "ink", "graphite", "midnight", "matte black"],
  white: ["white", "chalk", "porcelain", "bone"],
  blue: ["blue", "electric", "cobalt"],
  green: ["green", "moss", "olive", "sage", "signal"],
  brown: ["brown", "tan", "kraft", "clay", "rust", "terracotta", "tortoise"],
  grey: ["grey", "gray", "silver", "slate", "fog", "smoke", "stone", "steel"],
};

const ATTRS: Record<string, string[]> = {
  quiet: ["noise cancelling", "anc", "silent", "quiet"],
  wireless: ["wireless", "bluetooth"],
  eco: ["eco", "recycled", "sustainable", "fsc"],
  waterproof: ["waterproof", "weatherproof", "ip67", "ipx5"],
};

const STOP = new Set([
  "a", "an", "the", "for", "to", "of", "and", "or", "with", "in", "on", "my", "me", "i", "need", "want", "looking",
  "find", "some", "that", "is", "are", "by", "under", "below", "over", "above", "less", "more", "than", "around",
  "best", "good", "great", "cheap", "buy", "get", "units", "unit", "pcs", "pieces", "bulk", "delivered", "delivery",
  "arrive", "arrives", "arriving", "tomorrow", "today", "this", "week", "next", "fast", "quick", "asap", "who", "people",
  "something", "things", "stuff", "$", "usd",
]);

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function businessDaysUntil(targetDow: number, now = new Date()) {
  let d = now.getUTCDay();
  let days = 0;
  let business = 0;
  do {
    d = (d + 1) % 7;
    days++;
    if (d !== 0 && d !== 6) business++;
  } while (d !== targetDow && days < 8);
  return Math.max(1, business);
}

export function parseIntent(input: string): Intent {
  const raw = input.trim();
  let q = " " + raw.toLowerCase().replace(/[,]/g, " ") + " ";
  const chips: IntentChip[] = [];
  const intent: Intent = { raw, terms: [], chips };

  const num = (s: string) => Number(s.replace(/[$€£k]/g, "")) * (/k$/.test(s) ? 1000 : 1);

  // Price ranges
  const between = q.match(/(?:between|from)?\s*\$?(\d+(?:\.\d+)?k?)\s*(?:-|–|to|and)\s*\$?(\d+(?:\.\d+)?k?)\s*(?:dollars|usd)?(?=\s)/);
  if (between && !/units?|pcs|people|x\s/.test(q.slice(q.indexOf(between[0]) + between[0].length, q.indexOf(between[0]) + between[0].length + 7))) {
    intent.minPrice = num(between[1]);
    intent.maxPrice = num(between[2]);
    q = q.replace(between[0], " ");
  }
  const under = q.match(/(?:under|below|less than|cheaper than|max|up to|<)\s*\$?(\d+(?:\.\d+)?k?)/);
  if (under) {
    intent.maxPrice = num(under[1]);
    q = q.replace(under[0], " ");
  }
  const over = q.match(/(?:over|above|more than|at least|>)\s*\$?(\d+(?:\.\d+)?k?)(?!\s*(?:units?|pcs|people))/);
  if (over) {
    intent.minPrice = num(over[1]);
    q = q.replace(over[0], " ");
  }
  // Quantity
  const qty = q.match(/(?:x\s?(\d+))|(\d[\d,]*)\s*(?:units?|pcs|pieces|boxes|cases|packs|people|employees|seats|x\b)/);
  if (qty) {
    intent.qty = Number((qty[1] ?? qty[2]).replace(/,/g, ""));
    q = q.replace(qty[0], " ");
  } else if (/\bbulk\b|\bwholesale\b/.test(q)) {
    intent.qty = 50;
  }
  // Delivery
  if (/\btoday\b|\basap\b|\btomorrow\b/.test(q)) intent.deliverWithin = 1;
  else if (/this week|\bfast\b|\bquick\b/.test(q)) intent.deliverWithin = 3;
  else {
    const day = WEEKDAYS.find((w) => q.includes(" " + w) || q.includes("by " + w.slice(0, 3) + " "));
    if (day) {
      intent.deliverWithin = businessDaysUntil(WEEKDAYS.indexOf(day));
      q = q.replace(new RegExp(`(by\\s+)?${day}`), " ");
    }
  }
  // Use case
  for (const [key, words] of Object.entries(USE_CASES)) {
    const hit = words.find((w) => new RegExp(`\\b${w}\\b`).test(q));
    if (hit) {
      intent.useCase = key;
      q = q.replace(new RegExp(`(for\\s+)?\\b${hit}\\b`), " ");
      break;
    }
  }
  // Color
  for (const [key, words] of Object.entries(COLORS)) {
    const hit = words.find((w) => new RegExp(`\\b${w}\\b`).test(q));
    if (hit) {
      intent.color = key;
      q = q.replace(new RegExp(`\\b${hit}\\b`), " ");
      break;
    }
  }

  intent.terms = q
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9\-é"]/g, ""))
    .filter((t) => t.length > 1 && !STOP.has(t) && !/^\d+$/.test(t));

  // Category detection from remaining terms
  const cat = categories.find((c) =>
    intent.terms.some(
      (t) =>
        c.name.toLowerCase().includes(t) ||
        c.subcategories.some((s) => stem(s.toLowerCase()) === stem(t)),
    ),
  );
  if (cat) intent.category = cat.slug;

  // Build chips (in reading order)
  for (const t of intent.terms) {
    const attr = Object.entries(ATTRS).find(([, words]) => words.includes(t));
    if (attr) chips.push({ key: `attr:${attr[0]}`, label: t === "quiet" ? "Noise cancelling" : cap(attr[0]), kind: "attr" });
  }
  if (intent.minPrice != null && intent.maxPrice != null) chips.push({ key: "price", label: `$${intent.minPrice}–$${intent.maxPrice}`, kind: "price" });
  else if (intent.maxPrice != null) chips.push({ key: "price", label: `Under $${intent.maxPrice}`, kind: "price" });
  else if (intent.minPrice != null) chips.push({ key: "price", label: `Over $${intent.minPrice}`, kind: "price" });
  if (intent.useCase) chips.push({ key: "use", label: USE_LABEL[intent.useCase], kind: "use" });
  if (intent.color) chips.push({ key: "color", label: cap(intent.color), kind: "color" });
  if (intent.deliverWithin != null)
    chips.push({ key: "delivery", label: intent.deliverWithin <= 1 ? "Arrives tomorrow" : `Arrives in ≤ ${intent.deliverWithin} days`, kind: "delivery" });
  if (intent.qty) chips.push({ key: "qty", label: `Qty ${intent.qty.toLocaleString("en-US")} · volume pricing`, kind: "qty" });

  return intent;
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const stem = (s: string) => s.replace(/(ies)$/, "y").replace(/(es|s)$/, "");

function lev(a: string, b: string) {
  if (Math.abs(a.length - b.length) > 1) return 2;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

function haystack(p: Product) {
  return [p.name, p.brand, p.subcategory, p.category, ...p.keywords, ...p.useCases, ...p.variants.map((v) => v.name)]
    .join(" ")
    .toLowerCase();
}

function termScore(p: Product, term: string) {
  const hay = haystack(p);
  const t = stem(term);
  if (p.keywords.some((k) => stem(k) === t)) return 6;
  if (stem(p.subcategory.toLowerCase()) === t) return 6;
  if (p.name.toLowerCase().split(/\s+/).some((w) => stem(w) === t)) return 5;
  if (hay.includes(t)) return 3;
  if (t.length >= 4) {
    const words = hay.split(/\s+/);
    if (words.some((w) => w.startsWith(t))) return 2;
    if (t.length >= 5 && words.some((w) => lev(stem(w), t) <= 1)) return 2;
  }
  return 0;
}

export type Scored = { product: Product; score: number; reasons: string[] };

export function search(intentOrQuery: Intent | string, pool: Product[] = products): Scored[] {
  const intent = typeof intentOrQuery === "string" ? parseIntent(intentOrQuery) : intentOrQuery;
  const out: Scored[] = [];
  const attrOf = (t: string) => Object.entries(ATTRS).find(([, words]) => words.includes(t));
  const nounTerms = intent.terms.filter((t) => !attrOf(t));
  const attrTerms = intent.terms.filter((t) => attrOf(t));
  for (const p of pool) {
    let score = 0;
    const reasons: string[] = [];
    let nounHits = 0;
    for (const t of nounTerms) {
      const s = termScore(p, t);
      if (s > 0) nounHits++;
      score += s;
    }
    if (nounTerms.length && nounHits < Math.max(1, Math.ceil(nounTerms.length / 2))) continue;
    const text = `${haystack(p)} ${p.highlights.join(" ")} ${Object.values(p.specs).join(" ")}`.toLowerCase();
    for (const t of attrTerms) {
      const words = attrOf(t)![1];
      if (words.some((w) => new RegExp(`\\b${w}\\b`).test(text))) {
        score += 4;
        reasons.push(t === "quiet" ? "Noise cancelling" : cap(attrOf(t)![0]));
      } else if (!nounTerms.length) {
        score = -Infinity;
      }
    }
    if (score === -Infinity) continue;

    if (intent.maxPrice != null) {
      const unit = intent.qty ? tierPrice(p, intent.qty) : p.price;
      if (unit > intent.maxPrice) continue;
      reasons.push("Within budget");
    }
    if (intent.minPrice != null && p.price < intent.minPrice) continue;
    if (intent.deliverWithin != null) {
      if (p.delivery.max > intent.deliverWithin) continue;
      reasons.push("Arrives in time");
    }
    if (intent.useCase) {
      if (p.useCases.includes(intent.useCase)) {
        score += 4;
        reasons.push(USE_LABEL[intent.useCase]);
      } else if (!intent.terms.length) continue;
      else score -= 1;
    }
    if (intent.color) {
      const hit = p.variants.some((v) => COLORS[intent.color!].some((c) => v.name.toLowerCase().includes(c)));
      if (!hit) continue;
      score += 2;
    }
    if (intent.qty && intent.qty > 1) {
      if (p.b2b.tiers.length > 1) {
        score += 1;
        reasons.push("Volume pricing");
      }
      if (p.stock < intent.qty) score -= 3;
    }
    // Quality prior
    score += (p.rating - 4.4) * 2 + Math.log10(p.soldLastWeek + 1) * 0.6;
    out.push({ product: p, score, reasons });
  }
  return out.sort((a, b) => b.score - a.score);
}

function tierPrice(p: Product, qty: number) {
  let price = p.price;
  for (const t of p.b2b.tiers) if (qty >= t.min) price = t.price;
  return price;
}

export const TRENDING = [
  "noise cancelling headphones",
  "ergonomic office chair",
  "shipping boxes 12x10x8",
  "gifts under $50",
  "nitrile gloves bulk",
  "pour over kettle",
];

export const EXAMPLE_PROMPTS = {
  personal: [
    "quiet headphones under $300 for flights",
    "a gift under $60 that arrives by friday",
    "running shoes",
    "lamp for a reading corner",
  ],
  business: [
    "500 insulated bottles for an offsite",
    "nitrile gloves, 40 boxes, delivered tomorrow",
    "ergonomic chairs for 25 people",
    "shipping cartons bulk",
  ],
};
