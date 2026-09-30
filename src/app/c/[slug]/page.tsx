import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryBySlug } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { Listing } from "@/components/listing/listing";
import { CategoryFeatureCard } from "@/components/listing/category-feature-card";
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
  const hero = items.find((p) => p.kind === c.kind) ?? items[0];
  const activeSub = typeof sp.sub === "string" ? sp.sub : undefined;

  return (
    <div>
      {/* Header band — the same midnight surface as the home hero */}
      <div className="surface-night">
        <div className="shell pb-10 pt-6 lg:pb-12 lg:pt-8">
          <nav aria-label="Breadcrumb" className="text-[13px] text-mute">
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

          <header className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
            <div className="min-w-0">
              <h1 className="display text-balance text-[48px] sm:text-[80px] lg:text-[96px] short:text-[clamp(48px,10vh,96px)]">{c.name}</h1>
              <p className="mt-4 max-w-xl text-[17px] leading-relaxed text-ink-2">{c.blurb}</p>
              <div className="scroll-x -mx-[var(--gutter)] mt-6 flex gap-2 px-[var(--gutter)]">
                <Link href={`/c/${c.slug}`} className="chip shrink-0" data-active={!activeSub ? "true" : undefined}>
                  All {c.short.toLowerCase()}
                </Link>
                {c.subcategories.map((s) => (
                  <Link key={s} href={`/c/${c.slug}?sub=${encodeURIComponent(s)}`} className="chip shrink-0" data-active={activeSub === s ? "true" : undefined}>
                    {s}
                  </Link>
                ))}
              </div>
            </div>
            <CategoryFeatureCard category={c} products={items} featured={hero} />
          </header>
        </div>
      </div>

      <div className="shell">
        <Suspense fallback={<div className="mt-8 h-[600px] rounded-3xl bg-mist" />}>
          <Listing key={mode} base={items} subcategories={c.subcategories} />
        </Suspense>
      </div>
    </div>
  );
}
