"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { useHydrated, useShop } from "@/lib/store";
import { productById } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";

/** Floating compare dock — appears once anything is added to compare. */
export function CompareTray() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const ids = useShop((s) => s.compare);
  const toggle = useShop((s) => s.toggleCompare);
  const clear = useShop((s) => s.clearCompare);
  const hidden =
    !hydrated ||
    ids.length === 0 ||
    pathname.startsWith("/compare") ||
    pathname.startsWith("/checkout");
  const items = ids.map(productById).filter(Boolean);

  return (
    <div
      className={clsx(
        "fixed inset-x-0 bottom-[76px] z-40 flex justify-center px-3 transition-all duration-500 ease-[var(--ease-out-expo)] lg:bottom-6",
        hidden
          ? "pointer-events-none translate-y-6 opacity-0"
          : "translate-y-0 opacity-100",
      )}
      inert={hidden}
    >
      <div className="flex items-center gap-2 rounded-full bg-ink p-1.5 pl-2 text-porcelain shadow-[var(--shadow-float)]">
        <ul className="flex -space-x-1.5" aria-label="Products to compare">
          {items.map((p) => (
            <li key={p!.id} className="group relative">
              <ProductImage
                product={p!}
                sizes="40px"
                className="h-10 w-10 rounded-full ring-2 ring-ink"
              />
              <button
                type="button"
                onClick={() => toggle(p!.id)}
                aria-label={`Remove ${p!.name} from compare`}
                suppressHydrationWarning
                className="absolute -right-1 -top-1 hidden h-5 w-5 place-items-center rounded-full bg-porcelain text-ink group-hover:grid group-focus-within:grid"
              >
                <Icon name="close" size={11} strokeWidth={2.2} />
              </button>
            </li>
          ))}
          {Array.from({ length: Math.max(0, 2 - items.length) }).map((_, i) => (
            <li
              key={`e${i}`}
              className="grid h-10 w-10 place-items-center rounded-full border border-dashed border-graphite-line text-mute-dark ring-2 ring-ink"
            >
              <Icon name="plus" size={14} />
            </li>
          ))}
        </ul>
        <span className="hidden px-2 text-support text-mute-dark sm:block">
          {items.length < 2
            ? "Add one more to compare"
            : `${items.length} of 4 selected`}
        </span>
        <Link
          href="/compare"
          aria-disabled={items.length < 2}
          className={clsx(
            "btn",
            items.length < 2
              ? "btn-secondary pointer-events-none border-graphite-line bg-graphite text-mute-dark"
              : "btn-primary",
          )}
        >
          <Icon name="compare" size={15} /> Compare
        </Link>
        <button
          type="button"
          onClick={clear}
          aria-label="Clear compare"
          suppressHydrationWarning
          className="grid h-9 w-9 place-items-center rounded-full text-mute-dark hover:bg-graphite hover:text-porcelain"
        >
          <Icon name="close" size={16} />
        </button>
      </div>
    </div>
  );
}
