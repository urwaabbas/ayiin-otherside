import Link from "next/link";
import { clsx } from "clsx";
import type { Category, Product } from "@/lib/types";
import { deliveryLabel } from "@/lib/commerce";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";

/**
 * CategoryFeatureCard — the highlight panel beside a category's title.
 *
 * Built for the midnight header band: a glass panel (translucent fill, hairline ring,
 * soft amber glow) with the category's buying guide, three live metrics drawn from the
 * catalogue and one clear action. The featured product sits on its own photo stage.
 * Works on any surface; on light pages it reads as a dark, elevated card.
 */
export function CategoryFeatureCard({
  category: c,
  products,
  featured,
  className,
}: {
  category: Category;
  products: Product[];
  featured?: Product;
  className?: string;
}) {
  const topRating = products.length ? Math.max(...products.map((p) => p.rating)) : 0;
  const fastest = products.length ? products.reduce((a, b) => (b.delivery.min < a.delivery.min ? b : a)) : undefined;
  const metrics = [
    { value: String(products.length), label: products.length === 1 ? "product" : "products" },
    { value: topRating.toFixed(1), label: "top rating" },
    { value: fastest ? deliveryLabel(fastest).split(" – ")[0] : "—", label: "fastest arrival" },
  ];

  return (
    <aside
      aria-label={`${c.name} buying guide`}
      className={clsx(
        "relative isolate overflow-hidden rounded-[28px] bg-[linear-gradient(140deg,rgb(255_255_255/0.10),rgb(255_255_255/0.03))] p-2 ring-1 ring-[rgb(255_255_255/0.12)] backdrop-blur-xl",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgb(var(--rgb-brand)/0.28),transparent)]" />
      <div className="grid gap-2 sm:grid-cols-[1fr_0.82fr]">
        <div className="flex flex-col p-4 sm:p-5">
          <p className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[rgb(255_255_255/0.08)] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-brand ring-1 ring-[rgb(255_255_255/0.1)]">
            <Icon name="sparkle" size={12} /> Buying guide
          </p>
          <p className="mt-3 text-[18px] font-medium leading-snug tracking-[-0.015em] text-porcelain">{c.guide.title}</p>
          <ul className="mt-3 space-y-2 text-[13.5px] leading-snug text-mute-dark">
            {c.guide.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <Icon name="check" size={14} strokeWidth={2.2} className="mt-[2px] shrink-0 text-brand" />
                {pt}
              </li>
            ))}
          </ul>
          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-[rgb(255_255_255/0.1)] pt-4">
            {metrics.map((m) => (
              <div key={m.label} className="min-w-0">
                <dt className="sr-only">{m.label}</dt>
                <dd>
                  <span className="num block truncate text-[18px] font-medium text-porcelain">{m.value}</span>
                  <span className="block truncate text-[11.5px] text-mute-dark">{m.label}</span>
                </dd>
              </div>
            ))}
          </dl>
          <Link href={`/c/${c.slug}?sort=rating`} className="btn btn-brand btn-sm mt-5 w-fit">
            Shop top rated <Icon name="arrowRight" size={15} />
          </Link>
        </div>
        {featured && (
          <Link href={`/p/${featured.slug}`} className="group relative hidden min-h-[240px] overflow-hidden rounded-[22px] sm:block">
            <ProductImage
              product={featured}
              preload
              sizes="(min-width: 1024px) 260px, 40vw"
              alt={featured.name}
              className="absolute inset-0 h-full w-full"
              imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            <span className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-2xl bg-[rgb(11_26_51/0.72)] px-3 py-2 text-[12px] text-porcelain backdrop-blur">
              <span className="min-w-0 truncate">
                <span className="text-mute-dark">Most loved · </span>
                {featured.name}
              </span>
              <Icon name="arrowUpRight" size={14} className="shrink-0" />
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
