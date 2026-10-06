import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryBySlug } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { Listing } from "@/components/listing/listing";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";
import { getPrefs } from "@/lib/server-prefs";

export async function generateMetadata({ params }: PageProps<"/c/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const c = categoryBySlug(slug);
  return c ? { title: c.name, description: c.blurb } : { title: "Category not found" };
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const sp = await searchParams;
  const c = categoryBySlug(slug);
  if (!c) notFound();
  const { mode } = await getPrefs();
  const items = productsByCategory(slug);
  const activeSub = typeof sp.sub === "string" ? sp.sub : undefined;

  return (
    <div className="mx-auto max-w-[1520px] px-3 pt-4 sm:px-4">
      <nav aria-label="Breadcrumb" className="text-support text-mute">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-ink">
            {c.name}
          </li>
        </ol>
      </nav>

      {/* Department banner — marketplace style: title, subcategory tiles, buying guide */}
      <header className="mt-4 overflow-hidden rounded-panel border border-line bg-white">
        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0">
            <h1 className="text-heading font-semibold leading-tight tracking-[-0.02em] sm:text-heading">{c.name}</h1>
            <p className="mt-2 max-w-2xl text-body text-ink-2">{c.blurb}</p>
            <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
              <li>
                <Link href={`/c/${c.slug}`} aria-current={!activeSub ? "page" : undefined} className="group flex flex-col items-center text-center">
                  <span className={`grid aspect-square w-full place-items-center rounded-full bg-mist text-support font-semibold ring-1 ${!activeSub ? "ring-2 ring-brand" : "ring-line"}`}>All</span>
                  <span className="mt-1.5 text-meta font-medium">All {c.short.toLowerCase()}</span>
                </Link>
              </li>
              {c.subcategories.map((sub) => {
                const p = items.find((x) => x.subcategory === sub);
                const on = activeSub === sub;
                return (
                  <li key={sub}>
                    <Link href={`/c/${c.slug}?sub=${encodeURIComponent(sub)}`} aria-current={on ? "page" : undefined} className="group flex flex-col items-center text-center">
                      {p ? (
                        <ProductImage product={p} sizes="96px" className={`aspect-square w-full overflow-hidden rounded-full ring-1 ${on ? "ring-2 ring-brand" : "ring-line group-hover:ring-brand"}`} />
                      ) : (
                        <span className="aspect-square w-full rounded-full bg-mist ring-1 ring-line" />
                      )}
                      <span className="mt-1.5 text-meta font-medium group-hover:text-brand-deep">{sub}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <aside aria-label="Buying guide" className="rounded-surface bg-brand-soft p-5">
            <p className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.1em] text-brand-deep">
              <Icon name="sparkle" size={13} /> Buying guide
            </p>
            <p className="mt-2 text-body font-semibold leading-snug">{c.guide.title}</p>
            <ul className="mt-3 space-y-2 text-support text-ink-2">
              {c.guide.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <Icon name="check" size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-brand-deep" /> {pt}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </header>

      <Suspense fallback={<div className="mt-10 h-[600px] rounded-surface bg-mist" />}>
        <Listing key={mode} base={items} subcategories={c.subcategories} />
      </Suspense>
    </div>
  );
}
