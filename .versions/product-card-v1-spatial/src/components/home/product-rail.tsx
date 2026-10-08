import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";

/** A marketplace shelf: white panel, title + "See all", and a row of compact product cards. */
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
    <section aria-label={title} className="rounded-panel border border-line bg-white p-4 sm:p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-emphasis font-semibold tracking-[-0.01em] sm:text-emphasis">{title}</h2>
        <Link href={href} className="shrink-0 text-support font-medium text-brand-deep hover:underline">
          See all
        </Link>
      </div>
      <ul className="scroll-x -mx-4 mt-4 flex gap-4 px-4 pb-1 sm:-mx-5 sm:px-5">
        {products.map((p, i) => (
          <li key={p.id} className="w-[200px] shrink-0 sm:w-[220px]">
            <ProductCard product={p} layout="compact" rank={ranked ? i + 1 : undefined} reason={reason?.(p)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
