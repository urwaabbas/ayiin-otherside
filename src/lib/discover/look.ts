import type { Product } from "@/lib/types";
import { colorFamiliesOf } from "@/lib/listing";

/**
 * Look intelligence for Discover Mode — rules over the real catalogue, no invented data.
 *
 * `swapCandidates` and `cheaperLook` are deterministic and explainable: a swap must be the
 * same kind of item (same category AND subcategory), in stock, and share a colour family
 * with the piece it replaces, so the look keeps its category balance and palette.
 * When no candidate qualifies, the result says so rather than inventing one.
 *
 * Future recommendation service — data contract (drop-in replacement for these functions):
 *   POST /api/looks/optimise
 *   request:  { pieces: { productId, variantId, role }[], budget?: number, keep?: productId[] }
 *   response: { pieces: { productId, variantId, role, replaces?: productId, reason: string }[],
 *               total: number, saved: number, unresolved: { role, reason }[] }
 * Style attributes a service would need that the catalogue doesn't hold yet:
 *   silhouette, formality (casual → evening), material, and occasion tags per product.
 */

export type LookPiece = { product: Product; variant: string; role: string };

const inStock = (p: Product) => p.stock > 0;

/** Real alternatives that preserve the piece's role and palette. */
export function swapCandidates(piece: LookPiece, catalog: Product[]): Product[] {
  const families = new Set(colorFamiliesOf(piece.product));
  return catalog
    .filter(
      (p) =>
        p.id !== piece.product.id &&
        inStock(p) &&
        p.category === piece.product.category &&
        p.subcategory === piece.product.subcategory &&
        (families.size === 0 || colorFamiliesOf(p).some((f) => families.has(f))),
    )
    .sort((a, b) => b.rating - a.rating || a.price - b.price);
}

export type CheaperResult = {
  pieces: LookPiece[];
  original: number;
  optimised: number;
  saved: number;
  swaps: { role: string; from: Product; to: Product }[];
  unchanged: { role: string; product: Product }[];
};

/** Swap each piece for its best in-style cheaper alternative, when one exists. */
export function cheaperLook(pieces: LookPiece[], catalog: Product[]): CheaperResult {
  const original = total(pieces);
  const swaps: CheaperResult["swaps"] = [];
  const unchanged: CheaperResult["unchanged"] = [];
  const next = pieces.map((piece) => {
    const cheaper = swapCandidates(piece, catalog).filter((p) => p.price < piece.product.price);
    const best = cheaper.sort((a, b) => b.rating - a.rating || a.price - b.price)[0];
    if (!best) {
      unchanged.push({ role: piece.role, product: piece.product });
      return piece;
    }
    swaps.push({ role: piece.role, from: piece.product, to: best });
    return { product: best, variant: best.variants[0].id, role: piece.role };
  });
  const optimised = total(next);
  return { pieces: next, original, optimised, saved: Math.max(0, original - optimised), swaps, unchanged };
}

export const total = (pieces: { product: Product }[]) => pieces.reduce((sum, p) => sum + p.product.price, 0);
