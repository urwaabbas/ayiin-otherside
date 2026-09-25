import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryBySlug } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { Listing } from "@/components/listing/listing";
import { ProductArt } from "@/components/product/product-art";
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
  const hero = items.find((p) => p.kind === c.kind) ?? items[0];
  const activeSub = typeof sp.sub === "string" ? sp.sub : undefined;

  return (
    <div className="shell pt-6 lg:pt-8">
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

      <header className="mt-6 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="min-w-0">
          <h1 className="display text-balance text-[48px] sm:text-[88px] lg:text-[112px]">{c.name}</h1>
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
        <div className="relative min-w-0 overflow-hidden rounded-[28px]" style={{ background: c.tint }}>
          <ProductArt kind={hero.kind} color={hero.variants[0].color} accent={hero.variants[0].accent} tint={c.tint} className="absolute -right-10 top-0 h-full w-auto opacity-95" />
          <div className="relative max-w-[62%] p-6">
            <p className="eyebrow flex items-center gap-2 !text-ink-2">
              <Icon name="sparkle" size={13} /> Buying guide
            </p>
            <p className="mt-2 text-[17px] font-medium leading-snug tracking-[-0.01em]">{c.guide.title}</p>
            <ul className="mt-3 space-y-2 text-[13px] text-ink-2">
              {c.guide.points.map((pt) => (
                <li key={pt} className="flex gap-2">
                  <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-ink" /> {pt}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>

      <Suspense fallback={<div className="mt-10 h-[600px] rounded-3xl bg-mist" />}>
        <Listing key={mode} base={items} subcategories={c.subcategories} />
      </Suspense>
    </div>
  );
}
