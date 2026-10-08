"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { productBySlug } from "@/lib/catalog/products";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useShop, useUI } from "@/lib/store";
import { WORKSPACE_SETUP } from "@/lib/campaigns";

/**
 * Shop-the-setup module: the anchor piece and its companions as one equal row,
 * with the setup's real total and a single action that bags every in-stock piece.
 */
export function CompleteTheSetup() {
  const { fmt } = usePrefs();
  const addToCart = useShop((s) => s.addToCart);
  const notify = useUI((s) => s.notify);

  const anchor = productBySlug(WORKSPACE_SETUP.anchorSlug);
  const complementary = WORKSPACE_SETUP.complementarySlugs
    .map(productBySlug)
    .filter((p): p is Product => Boolean(p));

  if (!anchor) return null;

  const pieces = [anchor, ...complementary];
  const available = pieces.filter((p) => p.stock > 0);
  const total = available.reduce((sum, p) => sum + p.price, 0);

  const addSetup = () => {
    available.forEach((p) => addToCart(p.id, p.variants[0].id, 1));
    notify(`${WORKSPACE_SETUP.title} added`, `${available.length} pieces · ${fmt(total)}`);
  };

  return (
    <section
      aria-label="Complete the setup"
      className="fold rounded-panel border border-line bg-white p-6 sm:p-8 lg:p-10"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="display text-heading tracking-[-0.02em] sm:text-display-sm">
            {WORKSPACE_SETUP.title}
          </h2>
        </div>
        <Link
          href="/c/office"
          className="link-underline inline-flex shrink-0 items-center gap-1.5 self-start text-support font-medium text-brand-deep sm:self-auto"
        >
          <span>Explore all workspace essentials</span>
          <Icon name="arrowRight" size={15} />
        </Link>
      </div>

      <div className="fold-body mt-8 lg:mt-5 lg:flex lg:items-center">
        <CardRail label="Workstation pieces">
          {pieces.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </CardRail>
      </div>

      <div className="mt-5 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-support text-ink-2">
          The complete setup · {available.length} pieces ·{" "}
          <span className="num font-medium text-ink">{fmt(total)}</span>
        </p>
        <button
          type="button"
          onClick={addSetup}
          disabled={available.length === 0}
          className="btn btn-primary h-11 self-start px-5 text-support font-semibold sm:self-auto"
        >
          <Icon name="bag" size={16} />
          Add the setup to bag
        </button>
      </div>
    </section>
  );
}
