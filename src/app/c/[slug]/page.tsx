import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { categoryBySlug } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { Listing } from "@/components/listing/listing";
import { Icon } from "@/components/ui/icon";
import { categoryHero } from "@/lib/pdp";
import { Credit, Pic } from "@/components/pdp/sections";
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

  const photo = categoryHero(c.slug);

  return (
    <div>
      {/* Department hero — full width: the department's name and its way in on the left, a photograph to the edge on the right */}
      <section aria-labelledby="dept-h" className="overflow-hidden" style={{ backgroundColor: c.tint }}>
        <div className="mx-auto grid max-w-[1920px] lg:min-h-[520px] lg:grid-cols-[5fr_7fr]">
          <div className="flex flex-col justify-center px-[var(--gutter)] py-10 sm:py-14 lg:py-16 lg:pl-[max(var(--gutter),calc((100vw-1520px)/2+var(--gutter)))] lg:pr-14">
            <nav aria-label="Breadcrumb" className="text-support text-ink-2">
              <ol className="flex items-center gap-1.5">
                <li>
                  <Link href="/" className="hover:text-ink">Home</Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="text-ink">{c.name}</li>
              </ol>
            </nav>
            <h1 id="dept-h" className="display mt-6 text-balance text-[2.75rem] !leading-[0.96] sm:text-display-md lg:text-[4.5rem]">{c.name}</h1>
            <p className="mt-5 max-w-md text-pretty text-emphasis leading-snug text-ink-2">{c.blurb}</p>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label={`${c.name} subcategories`}>
              <li>
                <Link
                  href={`/c/${c.slug}`}
                  aria-current={!activeSub ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-full px-4 text-support font-medium transition-colors ${!activeSub ? "bg-ink text-white" : "bg-white/70 text-ink hover:bg-white"}`}
                >
                  All {items.length}
                </Link>
              </li>
              {c.subcategories.map((sub) => {
                const on = activeSub === sub;
                return (
                  <li key={sub}>
                    <Link
                      href={`/c/${c.slug}?sub=${encodeURIComponent(sub)}`}
                      aria-current={on ? "page" : undefined}
                      className={`inline-flex h-10 items-center rounded-full px-4 text-support font-medium transition-colors ${on ? "bg-ink text-white" : "bg-white/70 text-ink hover:bg-white"}`}
                    >
                      {sub}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative min-h-[300px] sm:min-h-[380px]">
            {photo && <Pic photo={photo} priority sizes="(min-width: 1024px) 58vw, 100vw" widths={[800, 1280, 1920]} alt="" />}
            {photo && <Credit photo={photo} className="absolute bottom-3 right-4 rounded-full bg-white/80 px-3 py-1 backdrop-blur" />}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1520px] px-3 pt-8 sm:px-4">
        <aside aria-label="Buying guide" className="rounded-surface bg-white p-5 sm:p-6">
          <p className="text-body font-semibold leading-snug">{c.guide.title}</p>
          <ul className="mt-3 grid gap-3 text-support text-ink-2 md:grid-cols-3">
            {c.guide.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <Icon name="check" size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-brand-deep" /> {pt}
              </li>
            ))}
          </ul>
        </aside>

        <Suspense fallback={<div className="mt-10 h-[600px] rounded-surface bg-mist" />}>
          <Listing key={mode} base={items} subcategories={c.subcategories} />
        </Suspense>
      </div>
    </div>
  );
}
