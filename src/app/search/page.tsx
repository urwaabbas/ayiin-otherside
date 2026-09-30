import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { products } from "@/lib/catalog/products";
import { parseIntent, search, TRENDING, type Intent } from "@/lib/search";
import { Listing } from "@/components/listing/listing";
import { Icon } from "@/components/ui/icon";
import { getPrefs } from "@/lib/server-prefs";

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: typeof q === "string" && q ? `“${q}”` : "Search" };
}

/** Rebuild a query string from its parsed intent, optionally dropping one constraint. */
function rebuild(intent: Intent, omit: string) {
  const parts = [...intent.terms];
  if (omit !== "price") {
    if (intent.minPrice != null && intent.maxPrice != null) parts.push(`between ${intent.minPrice} and ${intent.maxPrice}`);
    else if (intent.maxPrice != null) parts.push(`under $${intent.maxPrice}`);
    else if (intent.minPrice != null) parts.push(`over $${intent.minPrice}`);
  }
  if (omit !== "use" && intent.useCase) parts.push(`for ${intent.useCase}`);
  if (omit !== "color" && intent.color) parts.push(intent.color);
  if (omit !== "delivery" && intent.deliverWithin != null) parts.push(intent.deliverWithin <= 1 ? "tomorrow" : "this week");
  if (omit !== "qty" && intent.qty) parts.push(`${intent.qty} units`);
  return parts.join(" ").trim();
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const { mode } = await getPrefs();
  const intent = q ? parseIntent(q) : null;
  const base = intent ? search(intent).map((r) => r.product) : [...products].sort((a, b) => b.soldLastWeek - a.soldLastWeek);
  const title = q ? q : sp.deal === "1" ? "Verified deals" : sp.fast === "1" ? "Arrives tomorrow" : sp.bulk === "1" ? "Bulk-ready" : "Everything";

  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">{q ? "Results for" : "Browse"}</p>
      <h1 className="display mt-3 max-w-5xl text-balance text-[44px] sm:text-[72px] lg:text-[88px]">{q ? <>“{title}”</> : title}</h1>

      {intent && intent.chips.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="eyebrow mr-1 flex items-center gap-1.5">
            <Icon name="sparkle" size={13} /> Ayiin understood
          </span>
          {intent.chips.map((c) =>
            c.kind === "attr" || c.kind === "category" ? (
              <span key={c.key} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft px-3 text-[13px] font-medium">
                {c.label}
              </span>
            ) : (
              <Link
                key={c.key}
                href={`/search?q=${encodeURIComponent(rebuild(intent, c.key))}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-full bg-brand-soft pl-3 pr-2 text-[13px] font-medium transition-colors hover:bg-brand"
                aria-label={`Remove ${c.label}`}
              >
                {c.label} <Icon name="close" size={13} />
              </Link>
            ),
          )}
        </div>
      )}

      {mode === "business" && intent?.qty ? (
        <div className="mt-6 flex flex-col gap-4 rounded-[24px] bg-ink p-5 text-porcelain sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[15px]">
            <span className="font-medium">Buying {intent.qty.toLocaleString("en-US")} units?</span>{" "}
            <span className="text-mute-dark">Prices below already reflect volume tiers. For more, let suppliers compete.</span>
          </p>
          <Link href={`/business?tab=quotes&q=${encodeURIComponent(q)}`} className="btn btn-brand btn-sm shrink-0">
            Request quotes
          </Link>
        </div>
      ) : null}

      <Suspense fallback={<div className="mt-10 h-[600px] rounded-3xl bg-mist" />}>
        <Listing
          key={`${mode}-${q}`}
          base={base}
          emptyHint={
            <>
              No product meets every condition in “{q}”. Try{" "}
              {TRENDING.slice(0, 2).map((t, i) => (
                <span key={t}>
                  {i > 0 && " or "}
                  <Link className="underline" href={`/search?q=${encodeURIComponent(t)}`}>
                    {t}
                  </Link>
                </span>
              ))}
              .
            </>
          }
        />
      </Suspense>
    </div>
  );
}
