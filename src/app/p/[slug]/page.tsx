import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { productBySlug, products } from "@/lib/catalog/products";
import { categoryBySlug } from "@/lib/catalog/categories";
import { ProductExperience } from "@/components/pdp/product-experience";
import { Reviews } from "@/components/pdp/reviews";
import { Bundle } from "@/components/pdp/bundle";
import { ProductBar } from "@/components/pdp/product-bar";
import { GalleryGrid } from "@/components/pdp/gallery-grid";
import { CloserLook, CompareBlock, Credit, Highlights, PdpHero, TechSpecs } from "@/components/pdp/sections";
import { CardRail } from "@/components/home/card-rail";
import { ProductCard } from "@/components/product/product-card";
import { productMedia } from "@/lib/pdp";
import { deliveryLabel } from "@/lib/commerce";
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
  const qty = typeof sp.qty === "string" ? Number(sp.qty) || undefined : undefined;
  const sameCat = products.filter((x) => x.id !== p.id && x.category === p.category).sort((a, b) => b.soldLastWeek - a.soldLastWeek);
  const related = sameCat;
  const bundle = [p, ...sameCat.filter((x) => x.price < p.price * 1.2).slice(0, 2)];

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

  const media = productMedia(p);
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "highlights", label: "Highlights" },
    { id: "gallery", label: "Gallery" },
    { id: "specs", label: "Tech specs" },
    { id: "reviews", label: "Reviews" },
    ...(alts.length ? [{ id: "compare", label: "Compare" }] : []),
  ];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\u003c") }} />
      <ProductBar name={p.name} category={{ slug: cat.slug, name: cat.name }} price={p.price} soldOut={p.stock <= 0} sections={sections} />

      <PdpHero product={p} category={cat} />
      <Highlights product={p} />
      <CloserLook product={p} />

      <section id="gallery" className="shell scroll-mt-20 pt-20 sm:pt-28">
        <h2 className="display text-display-sm sm:text-display-md">Every angle.</h2>
        <div className="mt-10">
          <GalleryGrid photos={media} name={p.name} />
        </div>
        {media[0] && <Credit photo={media[0]} className="mt-3" />}
      </section>

      <section id="buy" className="shell scroll-mt-20 pt-20 sm:pt-28">
        <nav aria-label="Breadcrumb" className="mb-6 text-support text-mute">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-ink">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/c/${cat.slug}`} className="hover:text-ink">{cat.name}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href={`/c/${cat.slug}?sub=${encodeURIComponent(p.subcategory)}`} className="hover:text-ink">{p.subcategory}</Link></li>
          </ol>
        </nav>
        <h2 className="display mb-10 text-display-sm sm:text-display-md">Buy {p.name}.</h2>
        <ProductExperience product={p} initialQty={qty} />
      </section>

      {bundle.length > 1 && (
        <section aria-labelledby="together" className="shell pt-20 sm:pt-28">
          <h2 id="together" className="display mb-8 text-display-sm sm:text-display-md">Complete it in one delivery.</h2>
          <Bundle items={bundle} />
        </section>
      )}

      <TechSpecs product={p} />

      <section id="reviews" aria-labelledby="reviews-h" className="shell scroll-mt-20 pt-20 sm:pt-28">
        <h2 id="reviews-h" className="display mb-10 text-display-sm sm:text-display-md">Ratings and reviews.</h2>
        <Reviews product={p} />
      </section>

      <CompareBlock product={p} alts={alts} />

      {related.length > 0 && (
        <section aria-labelledby="related-h" className="shell pt-20 sm:pt-28">
          <h2 id="related-h" className="display mb-10 text-display-sm sm:text-display-md">More in {cat.name}.</h2>
          <CardRail flow label={`More in ${cat.name}`}>
            {related.slice(0, 8).map((x) => (
              <ProductCard key={x.id} product={x} />
            ))}
          </CardRail>
        </section>
      )}

      <div className="shell">
        <RecentlyViewed exclude={p.id} className="mt-20" />
      </div>
    </div>
  );
}
