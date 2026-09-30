import type { Product } from "@/lib/types";
import { products } from "@/lib/catalog/products";

/**
 * Shelf — the page-level product registry behind the zero-repetition rule.
 *
 * A page creates one Shelf and every section takes its products from it.
 * Once a product is taken it is marked as rendered, and no later take can
 * return it again — so a product (and therefore its SKU, title and images)
 * can appear at most once on the page, by construction.
 *
 * Takes are resolved in the order the page calls them, so the caller decides
 * priority: sections whose content is written around specific products
 * (compare specs, an RFQ for gloves) claim first, then the rest in page order.
 * When preferred products are already taken, a take falls back to fresh
 * products that match the section, and never to repeats — a section that
 * cannot be filled simply gets fewer items.
 */
export type TakeOptions = {
  /** Slugs to use first, in order, when still free. */
  prefer?: readonly string[];
  /** Only products that belong in this section. */
  where?: (p: Product) => boolean;
  /** Order for fallback products (default: catalogue order). */
  rank?: (a: Product, b: Product) => number;
  /** Fill from other matching products when preferred ones are gone (default true). */
  fallback?: boolean;
  /** Category diversity: at most this many products from one category. */
  maxPerCategory?: number;
};

export class Shelf {
  private readonly rendered = new Set<string>();

  constructor(private readonly pool: readonly Product[] = products) {}

  /** IDs already placed on the page. */
  get renderedIds(): ReadonlySet<string> {
    return this.rendered;
  }

  isFree(p: Product) {
    return !this.rendered.has(p.id);
  }

  /** Free products, optionally filtered, without taking them. */
  available(where?: (p: Product) => boolean): Product[] {
    return this.pool.filter((p) => this.isFree(p) && (!where || where(p)));
  }

  /** Take up to `count` free products and mark them rendered. */
  take(count: number, opts: TakeOptions = {}): Product[] {
    const { prefer = [], where, rank, fallback = true, maxPerCategory = Infinity } = opts;
    const out: Product[] = [];
    const perCat = new Map<string, number>();
    const accept = (p: Product | undefined) => {
      if (!p || out.length >= count || !this.isFree(p) || out.includes(p)) return;
      if (where && !where(p)) return;
      const n = perCat.get(p.category) ?? 0;
      if (n >= maxPerCategory) return;
      perCat.set(p.category, n + 1);
      out.push(p);
    };

    for (const slug of prefer) accept(this.pool.find((p) => p.slug === slug));
    if (fallback) {
      const rest = this.available(where);
      if (rank) rest.sort(rank);
      for (const p of rest) accept(p);
    }

    for (const p of out) this.rendered.add(p.id);
    return out;
  }

  /** Take exactly one product, or null when nothing free matches. */
  takeOne(opts: TakeOptions = {}): Product | null {
    return this.take(1, opts)[0] ?? null;
  }

  /**
   * Take a number of products that suits a grid: the largest multiple of `step`
   * (up to `max`) that can be filled, or nothing if fewer than `min` are free.
   */
  takeGrid(max: number, { min = 1, step = 1, ...opts }: TakeOptions & { min?: number; step?: number } = {}): Product[] {
    const free = this.peek(max, opts).length;
    const n = Math.floor(free / step) * step;
    return n >= min ? this.take(n, opts) : [];
  }

  /** What a take would return, without taking anything. */
  peek(count: number, opts: TakeOptions = {}): Product[] {
    const snapshot = new Set(this.rendered);
    const got = this.take(count, opts);
    this.rendered.clear();
    for (const id of snapshot) this.rendered.add(id);
    return got;
  }
}
