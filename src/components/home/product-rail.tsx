import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

/** A marketplace shelf: white panel, title + "See all", and a row of identical cards. */
export function ProductRail({
  title,
  href,
  products,
  ranked,
  reason,
}: {
  title: string;
  href: string;
  products: Product[];
  ranked?: boolean;
  reason?: (p: Product) => string | undefined;
}) {
  if (!products.length) return null;
  return (
    <section aria-label={title} className="rounded-control bg-white p-4 shadow-[var(--shadow-hair)] sm:p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-emphasis font-semibold tracking-[-0.01em] sm:text-emphasis">{title}</h2>
        <Link href={href} className="shrink-0 text-support font-medium text-brand-deep hover:underline">
          See all
        </Link>
      </div>
      <ul className="scroll-x -mx-4 mt-4 flex gap-3 px-4 pb-1 sm:-mx-5 sm:px-5">
        {products.map((p, i) => (
          <li key={p.id} className="w-[200px] shrink-0 sm:w-[220px]">
            <ProductCard product={p} rank={ranked ? i + 1 : undefined} reason={reason?.(p)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
