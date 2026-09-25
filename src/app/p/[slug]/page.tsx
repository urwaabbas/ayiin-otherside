import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productBySlug, products } from "@/lib/catalog/products";
import { categoryBySlug } from "@/lib/catalog/categories";
import { ProductExperience } from "@/components/pdp/product-experience";
import { Reviews } from "@/components/pdp/reviews";
import { Bundle } from "@/components/pdp/bundle";
import { ProductImage } from "@/components/product/product-image";
import { PriceHistory } from "@/components/product/price-history";
import { Money, Price } from "@/components/ui/money";
import { Icon } from "@/components/ui/icon";
import { SignalDot } from "@/components/ui/signal";
import { Eyebrow } from "@/components/ui/signal";
import { deliveryLabel, priceInsight } from "@/lib/commerce";
import type { Product } from "@/lib/types";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { productImageSrc } from "@/lib/images";

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = productBySlug(slug);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.summary,
    openGraph: { title: p.name, description: p.summary, images: [{ url: productImageSrc(p), width: 1100, height: 1100, alt: p.name }] },
  };
}

function alternatives(p: Product) {
  const pool = products.filter((x) => x.id !== p.id && x.category === p.category);
  const same = pool.filter((x) => x.subcategory === p.subcategory);
  const cand = same.length ? [...same, ...pool.filter((x) => x.subcategory !== p.subcategory)] : pool;
  const out: { product: Product; label: string; why: string }[] = [];
  const used = new Set<string>();
  const push = (x: Product | undefined, label: string, why: string) => {
    if (x && !used.has(x.id)) {
      used.add(x.id);
      out.push({ product: x, label, why });
    }
  };
  const cheaper = (same.filter((x) => x.price < p.price).length ? same : cand).filter((x) => x.price < p.price).sort((a, b) => b.rating - a.rating)[0];
  push(cheaper, "Better value", cheaper ? `${Math.round(((p.price - cheaper.price) / p.price) * 100)}% less, rated ${cheaper.rating}` : "");
  const faster = cand.filter((x) => x.delivery.max < p.delivery.max).sort((a, b) => a.delivery.max - b.delivery.max)[0];
  push(faster, "Arrives sooner", faster ? `Arrives ${deliveryLabel(faster)}` : "");
  const rated = (same.some((x) => x.rating > p.rating) ? same : cand).filter((x) => x.rating > p.rating).sort((a, b) => b.rating - a.rating)[0];
  push(rated, "Higher rated", rated ? `${rated.rating} from ${rated.reviewCount.toLocaleString("en-US")} reviews` : "");
  for (const x of cand) if (out.length < 3) push(x, "Also consider", x.brief.bestFor);
  return out.slice(0, 3);
}

export default async function ProductPage({ params, searchParams }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const p = productBySlug(slug);
  if (!p) notFound();
  const cat = categoryBySlug(p.category)!;
  const alts = alternatives(p);
  const insight = priceInsight(p);
  const qty = typeof sp.qty === "string" ? Number(sp.qty) || undefined : undefined;
  const related = products.filter((x) => x.id !== p.id && (x.category === p.category || x.useCases.some((u) => p.useCases.includes(u)))).sort((a, b) => b.soldLastWeek - a.soldLastWeek);
  const bundle = [p, ...related.filter((x) => x.price < p.price * 1.2).slice(0, 2)];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    brand: { "@type": "Brand", name: p.brand },
    sku: p.b2b.sku,
    description: p.summary,
    image: p.variants.flatMap((v) => [productImageSrc(p, v.id), productImageSrc(p, v.id, "angle")].map((src) => new URL(src, "https://ayiin.com").href)),
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount },
    offers: { "@type": "Offer", priceCurrency: "USD", price: p.price, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <div className="shell pt-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-6 text-[13px] text-mute">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="hover:text-ink">Home</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/c/${cat.slug}`} className="hover:text-ink">{cat.name}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={`/c/${cat.slug}?sub=${encodeURIComponent(p.subcategory)}`} className="hover:text-ink">{p.subcategory}</Link></li>
        </ol>
      </nav>

      <ProductExperience product={p} initialQty={qty} />

      {/* Ayiin Brief */}
      <section aria-labelledby="brief" className="mt-24">
        <Eyebrow index="01">Ayiin Brief</Eyebrow>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_2fr]">
          <h2 id="brief" className="display text-[44px] sm:text-[56px]">
            The short version, from <span className="tabular-nums">{p.reviewCount.toLocaleString("en-US")}</span> owners.
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel-ink rounded-[24px] p-6">
              <p className="eyebrow !text-mute-dark">Best for</p>
              <p className="mt-3 text-[20px] font-medium leading-snug tracking-[-0.02em]">{p.brief.bestFor}</p>
            </div>
            <div className="rounded-[24px] bg-white p-6 shadow-[var(--shadow-hair)]">
              <p className="eyebrow">What owners love</p>
              <ul className="mt-3 space-y-2.5 text-[14.5px]">
                {p.brief.pros.map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-lime shadow-[inset_0_0_0_1px_#0A0B0D]">
                      <Icon name="check" size={10} strokeWidth={3} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-[24px] bg-white p-6 shadow-[var(--shadow-hair)]">
              <p className="eyebrow">Worth knowing</p>
              <ul className="mt-3 space-y-2.5 text-[14.5px]">
                {p.brief.cons.map((x) => (
                  <li key={x} className="flex gap-2.5">
                    <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-soft">
                      <Icon name="minus" size={10} strokeWidth={3} />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Better option */}
      {alts.length > 0 && (
        <section aria-labelledby="better" className="mt-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Eyebrow index="02">Is there a better option?</Eyebrow>
              <h2 id="better" className="display mt-4 text-[44px] sm:text-[56px]">Maybe. Here&apos;s the honest answer.</h2>
            </div>
            <Link href={`/compare?ids=${[p.id, ...alts.map((a) => a.product.id)].join(",")}`} className="btn btn-ghost shrink-0">
              <Icon name="compare" size={16} /> Compare all {alts.length + 1}
            </Link>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {alts.map(({ product: a, label, why }) => (
              <Link key={a.id} href={`/p/${a.slug}`} className="group flex gap-4 rounded-[24px] bg-white p-4 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)]">
                <ProductImage product={a} sizes="112px" className="h-28 w-28 shrink-0 rounded-2xl" />
                <div className="min-w-0 py-1">
                  <span className="inline-flex rounded-full bg-mist px-2.5 py-1 text-[11.5px] font-medium">{label}</span>
                  <p className="mt-2 line-clamp-2 text-[14.5px] font-medium leading-snug group-hover:underline">{a.name}</p>
                  <p className="mt-1 text-[12.5px] text-mute">{why}</p>
                  <p className="mt-2"><Price usd={a.price} size="sm" /></p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Details */}
      <section aria-labelledby="details" className="mt-24 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <Eyebrow index="03">Details</Eyebrow>
          <h2 id="details" className="display mt-4 text-[44px] sm:text-[56px]">What you&apos;re getting.</h2>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {p.highlights.map((h) => (
              <li key={h} className="rounded-2xl bg-white p-4 text-[14.5px] font-medium shadow-[var(--shadow-hair)]">
                <SignalDot className="mr-2" /> {h}
              </li>
            ))}
          </ul>
          <div className="mt-8 rounded-[24px] bg-white p-6 shadow-[var(--shadow-hair)]">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-medium">Price history · 12 weeks</p>
              <span className={insight.verifiedDeal ? "rounded-full bg-lime px-2.5 py-1 text-[12px] font-medium" : "rounded-full bg-mist px-2.5 py-1 text-[12px]"}>
                {insight.label}
              </span>
            </div>
            <PriceHistory history={p.history} height={110} className="mt-5" />
            <div className="mt-3 flex justify-between text-[12.5px] text-mute">
              <span>Low <Money usd={Math.min(...p.history)} /></span>
              <span>Typical <Money usd={Math.round(insight.typical)} /></span>
              <span>High <Money usd={Math.max(...p.history)} /></span>
            </div>
          </div>
        </div>
        <div>
          <dl className="divide-y divide-line overflow-hidden rounded-[24px] bg-white shadow-[var(--shadow-hair)] lg:mt-[120px]">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-4 px-6 py-4 text-[14px]">
                <dt className="text-mute">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[150px_1fr] gap-4 px-6 py-4 text-[14px]">
              <dt className="text-mute">SKU</dt>
              <dd className="num">{p.b2b.sku}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Bundle */}
      {bundle.length > 1 && (
        <section aria-labelledby="together" className="mt-24">
          <Eyebrow index="04">Bought together</Eyebrow>
          <h2 id="together" className="display mb-8 mt-4 text-[44px] sm:text-[56px]">Complete it in one delivery.</h2>
          <Bundle items={bundle} />
        </section>
      )}

      {/* Reviews */}
      <section id="reviews" aria-labelledby="reviews-h" className="mt-24 scroll-mt-24">
        <Eyebrow index="05">Reviews</Eyebrow>
        <h2 id="reviews-h" className="display mb-10 mt-4 text-[44px] sm:text-[56px]">Only from people who bought it.</h2>
        <Reviews product={p} />
      </section>

      <RecentlyViewed exclude={p.id} index="06" className="mt-24" />
    </div>
  );
}
