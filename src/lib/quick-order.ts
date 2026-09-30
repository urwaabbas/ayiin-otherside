import { products } from "@/lib/catalog/products";
import { search } from "@/lib/search";
import type { Product } from "@/lib/types";

export type QuickLine = {
  raw: string;
  qty: number;
  product?: Product;
  match: "sku" | "text" | "none";
};

/**
 * Parses free-form procurement input — one item per line — into catalogue matches.
 * Accepts SKUs ("AY-NIT-1203, 40"), natural phrases ("40 boxes nitrile gloves"),
 * and spreadsheet pastes (tab/comma separated).
 */
export function parseQuickOrder(input: string): QuickLine[] {
  return input
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 50)
    .map((raw) => {
      const skuMatch = raw.match(/\bAY-[A-Z]{3}-\d{4}\b/i);
      const qtyMatch =
        raw.match(/(?:^|[\s,;\t×x])(?:qty[:\s]*)?(\d{1,6})(?:\s*(?:units?|pcs|boxes|cases|packs|reams|x))?\s*$/i) ??
        raw.match(/^(\d{1,6})\s*(?:x|×|units?|pcs|boxes|cases|packs)?\s+/i) ??
        raw.match(/[x×]\s*(\d{1,6})/i);
      const qty = qtyMatch ? Math.max(1, Number(qtyMatch[1])) : 1;
      if (skuMatch) {
        const product = products.find((p) => p.b2b.sku.toLowerCase() === skuMatch[0].toLowerCase());
        return { raw, qty, product, match: product ? "sku" : "none" } as QuickLine;
      }
      const text = raw
        .replace(qtyMatch?.[0] ?? "", " ")
        .replace(/[,;\t]/g, " ")
        .trim();
      const hit = text ? search(text)[0] : undefined;
      return { raw, qty, product: hit?.product, match: hit ? "text" : "none" } as QuickLine;
    });
}
