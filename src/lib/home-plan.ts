import type { Product } from "@/lib/types";
import { categories } from "@/lib/catalog/categories";
import { VOLUME_PRODUCT_SLUGS } from "@/lib/catalog/offers";
import { Shelf } from "@/lib/catalog/shelf";
import { priceInsight } from "@/lib/commerce";
import { hasView } from "@/lib/images";

/**
 * Home page product plans.
 *
 * Each home page takes its products from a single Shelf, so no product (and
 * so no SKU, title or image) appears in more than one place on the page.
 * The order of the takes below is the priority order:
 *   1. sections whose copy is written around specific products,
 *   2. the hero,
 *   3. the remaining rails, top to bottom.
 * A rail that runs out of fresh products shrinks, or is hidden, instead of
 * repeating one. Adding products to the catalogue refills them automatically.
 */

/** Products the compare teaser's hand-written spec table describes. */
export const COMPARE_SLUGS = ["aurel-anc-over-ear", "aurel-buds-pro", "halo-speaker-mini"] as const;
/** The product the business bridge's volume chart is drawn from. */
export const BRIDGE_SLUG = "nitrile-gloves-4mil";
/** The product the business home RFQ example is written about. */
export const RFQ_SLUG = "nitrile-gloves-4mil";

const B2B_ONLY = new Set(["supplies", "safety"]);
const B2B_KINDS = new Set(["paper", "scanner"]);
const isConsumer = (p: Product) => !B2B_ONLY.has(p.category) && !B2B_KINDS.has(p.kind);
/** Consumer products plus the everyday staples households also buy. */
const isHousehold = (p: Product) => isConsumer(p) || p.useCases.some((u) => u === "home" || u === "school");
const isDeal = (p: Product) => priceInsight(p).verifiedDeal;
const isBulk = (p: Product) => p.tags.includes("bulk");
const bySales = (a: Product, b: Product) => b.soldLastWeek - a.soldLastWeek;
const kindOf = (slug: string) => categories.find((c) => c.slug === slug)?.kind ?? "";

/**
 * One product per category tile. The tile is navigation, so it gives the rails
 * below first choice: it skips products later rails need (`avoid`, most
 * important first) where it can, then prefers the category's signature kind,
 * then the slowest seller.
 */
function takeCategoryTiles(shelf: Shelf, slugs: readonly string[], avoid: ((p: Product) => boolean)[]) {
  const tiles: Record<string, Product | null> = {};
  for (const slug of slugs) {
    tiles[slug] = shelf.takeOne({
      where: (p) => p.category === slug,
      rank: (a, b) =>
        avoid.reduce((d, f) => d || Number(f(a)) - Number(f(b)), 0) ||
        Number(b.kind === kindOf(slug)) - Number(a.kind === kindOf(slug)) ||
        a.soldLastWeek - b.soldLastWeek,
    });
  }
  return tiles;
}

export type PersonalPlan = ReturnType<typeof planPersonalHome>;

export function planPersonalHome() {
  const shelf = new Shelf();

  // 1 · Pinned: copy and data are written around these exact products.
  const compare = shelf.take(COMPARE_SLUGS.length, { prefer: COMPARE_SLUGS, fallback: false });
  const bridge = shelf.takeOne({ prefer: [BRIDGE_SLUG], fallback: false });

  // 2 · Hero: the clarity carousel, then the image pill set into the headline.
  const clarity = shelf.take(3, {
    prefer: ["stride-runner-2", "pour-gooseneck-kettle", "arc-table-lamp"],
    where: isConsumer,
    maxPerCategory: 1,
  });
  const pill = shelf.take(2, { prefer: ["trail-bottle-750", "ember-soy-candle"], where: isConsumer, maxPerCategory: 1 });

  // 3 · Rails, top to bottom.
  const tiles = takeCategoryTiles(
    shelf,
    categories.map((c) => c.slug),
    // Deals feed the deals rail; consumer products feed every other rail.
    [isDeal, isConsumer],
  );
  // For You re-ranks this pool on the client by the shopper's interests.
  // It leaves verified deals for the deals rail.
  const forYou = shelf.takeGrid(4, { min: 2, step: 2, where: (p) => isConsumer(p) && !isDeal(p), maxPerCategory: 2 });
  const lookbook = shelf.takeGrid(3, {
    min: 3,
    prefer: ["night-recovery-oil", "pour-gooseneck-kettle", "trail-bottle-750", "kova-book-14-air"],
    // Only products photographed in context can anchor a scene.
    where: (p) => isConsumer(p) && !isDeal(p) && hasView(p, "scene"),
  });
  const deals = shelf.takeGrid(2, { min: 2, where: isDeal, rank: bySales });
  const bestsellers = shelf.takeGrid(2, { min: 2, step: 2, where: isHousehold, rank: bySales });
  const delivery = shelf.takeGrid(4, { min: 2, step: 2 });

  // 4 · Text-only references: the clarity card's "better option" answer.
  // Takes only what is still free; the card has a fallback line otherwise.
  const alternatives: Record<string, Product | null> = {};
  for (const p of clarity) {
    alternatives[p.id] =
      shelf.takeOne({ where: (x) => x.category === p.category && x.price < p.price, rank: (a, b) => b.rating - a.rating }) ??
      shelf.takeOne({ where: (x) => x.category === p.category });
  }

  return { compare, bridge, clarity, pill, tiles, forYou, lookbook, deals, bestsellers, delivery, alternatives, renderedIds: [...shelf.renderedIds] };
}

export type BusinessPlan = ReturnType<typeof planBusinessHome>;

export function planBusinessHome() {
  const shelf = new Shelf();

  // 1 · Pinned: the RFQ example is written about this product.
  const rfq = shelf.takeOne({ prefer: [RFQ_SLUG], fallback: false });

  // 2 · Hero pill: workplace kit.
  const pill = shelf.take(3, { prefer: ["kova-book-14-air", "kova-vista-27-4k", "kova-keys-low-profile"] });

  // 3 · Rails, top to bottom.
  const volume = shelf.take(4, { prefer: VOLUME_PRODUCT_SLUGS, where: isBulk, rank: bySales });
  const tiles = takeCategoryTiles(
    shelf,
    categories.filter((c) => c.business).map((c) => c.slug),
    [isBulk],
  );
  const bulk = shelf.takeGrid(8, { min: 2, step: 2, where: isBulk, rank: bySales });

  return { rfq, pill, volume, tiles, bulk, renderedIds: [...shelf.renderedIds] };
}
