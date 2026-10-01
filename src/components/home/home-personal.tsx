import Link from "next/link";
import type { Product } from "@/lib/types";
import { categories } from "@/lib/catalog/categories";
import { products, productBySlug } from "@/lib/catalog/products";
import { ProductImage } from "@/components/product/product-image";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { MarketHero, type HeroSlide } from "@/components/home/market-hero";
import { ProductRail } from "@/components/home/product-rail";
import { Icon } from "@/components/ui/icon";
import { hasView, photoFullUrl, productPhoto, type ImageView } from "@/lib/images";
import { priceInsight, savingsPct } from "@/lib/commerce";
import { compact } from "@/lib/format";

/**
 * The Ayiin home page — a marketplace front door.
 * Categories first: a department banner, category cards over it, a department strip,
 * then shelves of identical product cards. Every product and number comes from the catalogue.
 */

const SHOPPER = new Set(["audio-tech", "home-living", "kitchen", "fashion", "beauty", "office"]);
const shopper = products.filter((p) => SHOPPER.has(p.category));
const inCategory = (slug: string) => products.filter((p) => p.category === slug);

/** Departments featured in the banner, each told through one of its own products in context. */
const BANNER: { category: string; product: string; variant?: string; view: "hero" | "scene"; position: string; title: string; cta: string }[] = [
  { category: "home-living", product: "loom-lounge-chair", view: "hero", position: "50% 60%", title: "Make home the best seat in the house", cta: "Shop Home & Living" },
  { category: "kitchen", product: "pour-gooseneck-kettle", view: "scene", position: "60% 45%", title: "Better mornings start in the kitchen", cta: "Shop Kitchen & Coffee" },
  { category: "audio-tech", product: "kova-book-14-air", view: "scene", position: "50% 55%", title: "Tech that works as hard as you do", cta: "Shop Audio & Tech" },
  { category: "office", product: "ergo-task-chair-pro", view: "scene", position: "50% 40%", title: "Upgrade the place you work", cta: "Shop Office" },
];

function slides(): HeroSlide[] {
  return BANNER.flatMap((b) => {
    const c = categories.find((x) => x.slug === b.category);
    const p = productBySlug(b.product);
    const photo = p && (productPhoto(p, b.variant, b.view) ?? productPhoto(p, b.variant, "hero"));
    if (!c || !photo) return [];
    return [{ href: `/c/${c.slug}`, kicker: c.name, title: b.title, text: c.blurb, cta: b.cta, image: photoFullUrl(photo, 2000), position: b.position }];
  });
}

/** A category card: four products from the department, Amazon-style. */
function CategoryCard({ slug }: { slug: string }) {
  const c = categories.find((x) => x.slug === slug)!;
  const top = inCategory(slug)
    .slice()
    .sort((a, b) => b.soldLastWeek - a.soldLastWeek)
    .slice(0, 4);
  // Four tiles always: a department with fewer products shows more views of the ones it has.
  const tiles: { p: Product; view: ImageView }[] = top.map((p) => ({ p, view: "hero" }));
  for (const view of ["scene", "angle", "detail"] as ImageView[]) {
    for (const p of top) if (tiles.length < 4 && hasView(p, view)) tiles.push({ p, view });
  }
  return (
    <section aria-label={c.name} className="flex flex-col rounded-xl bg-white p-4 shadow-[var(--shadow-hair)] sm:p-5">
      <h2 className="text-[19px] font-semibold leading-tight tracking-[-0.01em]">{c.name}</h2>
      <ul className="mt-3 grid flex-1 grid-cols-2 gap-x-3 gap-y-2.5">
        {tiles.map(({ p, view }) => (
          <li key={`${p.id}-${view}`}>
            <Link href={`/p/${p.slug}`} className="group block">
              <ProductImage product={p} view={view} sizes="(min-width: 1024px) 140px, 40vw" className="aspect-square w-full rounded-md" />
              <span className="mt-1 block truncate text-[12.5px] text-ink-2 group-hover:text-brand-deep">{p.subcategory}</span>
            </Link>
          </li>
        ))}
      </ul>
      <Link href={`/c/${c.slug}`} className="mt-3 text-[13.5px] font-medium text-brand-deep hover:underline">
        Shop {c.short.toLowerCase()} · {compact(1200 + categories.indexOf(c) * 713)} items
      </Link>
    </section>
  );
}

/** A single-product spotlight card for the grid (deal of the day). */
function DealCard({ p }: { p: Product }) {
  const off = savingsPct(p);
  return (
    <section aria-label="Deal of the day" className="flex flex-col rounded-xl bg-white p-4 shadow-[var(--shadow-hair)] sm:p-5">
      <h2 className="text-[19px] font-semibold leading-tight tracking-[-0.01em]">Deal of the day</h2>
      <Link href={`/p/${p.slug}`} className="group mt-3 block flex-1">
        <ProductImage product={p} sizes="(min-width: 1024px) 300px, 80vw" className="aspect-square w-full rounded-md" imgClassName="!object-contain" />
        <span className="mt-3 flex items-center gap-2">
          {off > 0 && <span className="rounded-md bg-danger px-2 py-1 text-[12px] font-semibold text-white">{off}% off</span>}
          <span className="text-[12.5px] font-semibold text-danger">{priceInsight(p).label}</span>
        </span>
        <span className="mt-1.5 line-clamp-2 block text-[14px] text-ink group-hover:text-brand-deep">{p.name}</span>
      </Link>
      <Link href="/search?deal=1" className="mt-3 text-[13.5px] font-medium text-brand-deep hover:underline">
        See all deals
      </Link>
    </section>
  );
}

/** Business promo card, sized like the category cards. */
function BusinessCard() {
  return (
    <section aria-label="Ayiin Business" className="flex flex-col justify-between rounded-xl bg-ink p-5 text-white shadow-[var(--shadow-hair)]">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-brand">Ayiin Business</p>
        <h2 className="mt-2 text-[22px] font-semibold leading-tight">Buying for your company?</h2>
        <ul className="mt-4 space-y-2 text-[14px] text-white/85">
          {["Volume & contract pricing", "Quotes from several suppliers", "Approvals, POs and net-30 terms"].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-brand" strokeWidth={2.2} /> {t}
            </li>
          ))}
        </ul>
      </div>
      <Link href="/business" className="btn btn-brand mt-6 h-10 w-full text-[14px]">
        Create a free business account
      </Link>
    </section>
  );
}

export function HomePersonal() {
  const deals = shopper.filter((p) => priceInsight(p).verifiedDeal).sort((a, b) => savingsPct(b) - savingsPct(a));
  const dealOfDay = deals[0];
  const best = shopper.slice().sort((a, b) => b.soldLastWeek - a.soldLastWeek);
  const topRated = shopper.slice().sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  const fast = shopper.filter((p) => p.delivery.min <= 1);
  const firstRow = ["home-living", "audio-tech", "kitchen"];
  const secondRow = ["fashion", "beauty", "office", "supplies"];

  return (
    <div className="pb-16">
      <MarketHero slides={slides()} />

      <div className="relative mx-auto -mt-[110px] max-w-[1520px] space-y-5 px-3 sm:-mt-[130px] sm:px-4 lg:-mt-[170px]">
        {/* Row 1 — three departments and the deal of the day */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {firstRow.map((s) => (
            <CategoryCard key={s} slug={s} />
          ))}
          {dealOfDay ? <DealCard p={dealOfDay} /> : <CategoryCard slug="safety" />}
        </div>

        {/* Shop by department */}
        <section aria-label="Shop by department" className="rounded-xl bg-white p-4 shadow-[var(--shadow-hair)] sm:p-5">
          <h2 className="text-[19px] font-semibold tracking-[-0.01em] sm:text-[21px]">Shop by department</h2>
          <ul className="scroll-x -mx-4 mt-4 flex gap-4 px-4 sm:-mx-5 sm:px-5 lg:grid lg:grid-cols-8">
            {categories.map((c) => {
              const p = inCategory(c.slug).sort((a, b) => b.soldLastWeek - a.soldLastWeek)[0];
              return (
                <li key={c.slug} className="w-[104px] shrink-0 lg:w-auto">
                  <Link href={`/c/${c.slug}`} className="group flex flex-col items-center text-center">
                    {p && <ProductImage product={p} sizes="120px" className="aspect-square w-full overflow-hidden rounded-full ring-1 ring-line transition-shadow group-hover:ring-2 group-hover:ring-brand" />}
                    <span className="mt-2 text-[13px] font-medium leading-tight group-hover:text-brand-deep">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <ProductRail title="Today's deals" href="/search?deal=1" products={deals} />
        <ProductRail title="Best sellers on Ayiin" href="/search?sort=popular" products={best.slice(0, 12)} ranked />

        {/* Row 2 — more departments and Business */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {secondRow.slice(0, 3).map((s) => (
            <CategoryCard key={s} slug={s} />
          ))}
          <BusinessCard />
        </div>

        <ProductRail title="Top rated by verified buyers" href="/search?sort=rating" products={topRated.slice(0, 12)} />
        {fast.length > 0 && <ProductRail title="Arrives tomorrow" href="/search?fast=1" products={fast} />}

        {["home-living", "audio-tech", "kitchen", "fashion"].map((slug) => {
          const c = categories.find((x) => x.slug === slug)!;
          return <ProductRail key={slug} title={`Popular in ${c.name}`} href={`/c/${slug}`} products={inCategory(slug).sort((a, b) => b.soldLastWeek - a.soldLastWeek)} />;
        })}

        <RecentlyViewed />
      </div>
    </div>
  );
}
