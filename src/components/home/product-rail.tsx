import Link from "next/link";
import type { Product } from "@/lib/types";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";

/** A marketplace shelf: white panel, title + "See all", and a row of compact product cards. */
export function ProductRail({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Product[];
  ranked?: boolean;
  reason?: (p: Product) => string | undefined;
}) {
  if (!products.length) return null;
  return (
    <section aria-label={title} className="rounded-panel border border-line bg-white p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-emphasis font-semibold tracking-[-0.01em] sm:text-emphasis">{title}</h2>
        <Link href={href} className="shrink-0 text-support font-medium text-brand-deep hover:underline">
          See all
        </Link>
      </div>
      <div className="mt-4">
        <CardRail flow label={title}>
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </CardRail>
      </div>
    </section>
  );
}
