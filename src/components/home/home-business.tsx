import Link from "next/link";
import { categories } from "@/lib/catalog/categories";
import { sellers } from "@/lib/catalog/sellers";
import { products } from "@/lib/catalog/products";
import { planBusinessHome } from "@/lib/home-plan";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { VolumeExplorer } from "@/components/business/volume-explorer";
import { ReorderLists } from "@/components/business/reorder-lists";
import { DeskHero } from "@/components/home/business/desk-hero";
import { ControlGrid, RfqBoard } from "@/components/home/business/live-sections";

export function HomeBusiness() {
  // Every product on this page comes from one plan, so none appears twice.
  const { volume, tiles, bulk } = planBusinessHome();

  // Network figures are computed from the supplier roster, not written as copy.
  const network = sellers.filter((s) => s.business && s.verified);
  const onTime = network.reduce((s, x) => s + x.onTime, 0) / network.length;
  const response = [...network.map((s) => s.responseHours)].sort((a, b) => a - b)[Math.floor(network.length / 2)];
  // Average discount at each bulk item's top volume tier.
  const bulkItems = products.filter((p) => p.tags.includes("bulk"));
  const topTier = bulkItems.reduce((s, p) => s + (1 - p.b2b.tiers[p.b2b.tiers.length - 1].price / p.price), 0) / bulkItems.length;

  return (
    <>
      <DeskHero />

      {/* ── NETWORK ─────────────────────────────────────────── */}
      <section className="shell mt-14 lg:mt-20" aria-label="The Ayiin Business supplier network">
        <dl className="grid grid-cols-2 overflow-hidden rounded-surface bg-white shadow-[var(--shadow-hair)] lg:grid-cols-4">
          {[
            [`${network.length}`, "verified business suppliers on your account"],
            [`${onTime.toFixed(1)}%`, "average on-time delivery, last 12 months"],
            [`${response}h`, "median supplier response to a quote"],
            [`${Math.round(topTier * 100)}%`, `average saving at the top volume tier, across ${bulkItems.length} bulk items`],
          ].map(([n, l], i) => (
            <div key={l} className={`p-5 sm:p-7 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="display block text-heading tabular-nums sm:text-display-sm">{n}</span>
                <span className="mt-2 block max-w-[220px] text-support text-mute">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 01 REORDER ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="01"
          kicker="Repeat purchasing"
          title={
            <>
              Reorder in one click.
              <br />
              Or never think about it.
            </>
          }
          description="Save any cart as a list, then reorder it instantly or put it on a schedule. Prices refresh to today's contract rate every time."
          action={{ href: "/business?tab=lists", label: "All lists" }}
        />
        <div className="mt-12">
          <ReorderLists thumbnails={false} />
        </div>
      </section>

      {/* ── 02 VOLUME ────────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="02"
          kicker="No pricing uncertainty"
          title={
            <>
              Every price break,
              <br />
              every supplier, visible.
            </>
          }
          description="Slide to your quantity. See each tier, your contract rate, and the landed cost from every verified supplier stocking the item — lead time and reliability included."
        />
        <div className="mt-12">
          <VolumeExplorer items={volume} />
        </div>
      </section>

      {/* ── 03 QUOTES ────────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-[120px]">
            <SectionHeader
              index="03"
              kicker="Quotes without email chains"
              title={
                <>
                  One request.
                  <br />
                  Competing offers.
                </>
              }
              description="Describe what you need once. Ayiin sends it to every qualified supplier, normalises the replies to landed cost and turns the winner into a purchase order."
            />
            <ol className="mt-10 space-y-6">
              {[
                ["Describe", "Item, quantity, target price and delivery date. Notes and specs travel with it."],
                ["Compare", "Replies line up side by side — price, lead time, on-time record and whether they make your date."],
                ["Award", "One click turns the winner into a PO charged to the right cost centre. Everyone else is told."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink text-support">{i + 1}</span>
                  <div>
                    <p className="text-body font-medium">{t}</p>
                    <p className="mt-0.5 max-w-md text-support leading-relaxed text-mute">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/business?tab=quotes" className="btn btn-primary mt-10">
              Start a quote request <Icon name="arrowRight" size={16} />
            </Link>
          </div>
          <Reveal>
            <RfqBoard />
          </Reveal>
        </div>
      </section>

      {/* ── 04 DEPARTMENTS ───────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader index="04" kicker="Bulk-ready departments" title="Stock the whole operation." action={{ href: "/search?bulk=1", label: "All bulk categories" }} />
        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {categories
            .filter((c) => c.business)
            .map((c, n) => {
              const hero = tiles[c.slug];
              return (
                <Reveal key={c.slug} delay={n * 60}>
                  <Link href={`/c/${c.slug}`} className="group block overflow-hidden rounded-surface" style={{ background: c.tint }}>
                    {hero ? (
                      <ProductImage
                        product={hero}
                        sizes="(min-width: 1024px) 20vw, 50vw"
                        className="aspect-square w-full transition-transform duration-[1000ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div aria-hidden className="aspect-square w-full" />
                    )}
                    <div className="flex items-center justify-between gap-2 p-4">
                      <span className="min-w-0">
                        <span className="block truncate text-body font-medium">{c.name}</span>
                        <span className="block truncate text-meta text-ink-2">{c.subcategories.slice(0, 2).join(" · ")}</span>
                      </span>
                      <Icon name="arrowUpRight" size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
        </div>
      </section>

      {/* ── 05 BULK BESTSELLERS ──────────────────────────────── */}
      {bulk.length > 0 && (
        <section className="shell mt-24 lg:mt-32">
          <SectionHeader
            index="05"
            kicker="What companies restock most"
            title="Bulk bestsellers."
            description="Shown at your contract and volume price. List price, MOQ and case pack always visible."
            action={{ href: "/search?bulk=1&sort=popular", label: "Shop bulk" }}
          />
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
            {bulk.map((p, i) => (
              <Reveal key={p.id} delay={(i % 4) * 70}>
                <ProductCard product={p} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── 06 CONTROL ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="06"
          kicker="Built for how companies buy"
          title={
            <>
              Control without
              <br />
              the bureaucracy.
            </>
          }
          description="Everyone buys what they need. Policy decides what needs a second look. Finance gets one clean statement."
          action={{ href: "/business", label: "Open the console" }}
        />
        <div className="mt-12">
          <ControlGrid />
        </div>
      </section>
    </>
  );
}
