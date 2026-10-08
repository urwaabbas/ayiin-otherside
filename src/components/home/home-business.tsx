import Link from "next/link";
import { categories } from "@/lib/catalog/categories";
import { sellers } from "@/lib/catalog/sellers";
import { products } from "@/lib/catalog/products";
import { planBusinessHome } from "@/lib/home-plan";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { CardRail } from "@/components/home/card-rail";
import { Icon } from "@/components/ui/icon";
import { VolumeExplorer } from "@/components/business/volume-explorer";
import { ReorderLists } from "@/components/business/reorder-lists";
import { DeskHero } from "@/components/home/business/desk-hero";
import { ControlGrid, FlowStrip, RfqBoard } from "@/components/home/business/live-sections";
import { CountUp, FadeUp, Stagger, StaggerItem } from "@/components/motion/primitives";

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
      <section className="shell mt-6 lg:mt-8" aria-label="The Ayiin Business supplier network" data-nomotion>
        <FadeUp>
          <dl className="grid grid-cols-2 overflow-hidden rounded-surface bg-white shadow-[var(--shadow-hair)] lg:grid-cols-4">
            {[
              [<CountUp key="a" value={network.length} />, "verified business suppliers on your account"],
              [<CountUp key="b" value={onTime} decimals={1} suffix="%" />, "average on-time delivery, last 12 months"],
              [<CountUp key="c" value={response} decimals={1} suffix="h" />, "median supplier response to a quote"],
              [<CountUp key="d" value={Math.round(topTier * 100)} suffix="%" />, `average saving at the top volume tier, across ${bulkItems.length} bulk items`],
            ].map(([n, l], i) => (
              <div key={l as string} className={`p-5 sm:p-7 ${i % 2 ? "border-l border-line" : ""} ${i > 1 ? "border-t border-line lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                <dt className="sr-only">{l}</dt>
                <dd>
                  <span className="display block text-heading tabular-nums sm:text-display-sm">{n}</span>
                  <span className="mt-2 block max-w-[220px] text-support text-mute">{l}</span>
                </dd>
              </div>
            ))}
          </dl>
        </FadeUp>
      </section>

      {/* ── HOW A PURCHASE MOVES ─────────────────────────────── */}
      <section className="shell mt-20 lg:mt-[clamp(4rem,10svh,7rem)]" data-nomotion>
        <FadeUp>
          <SectionHeader
            compact
            kicker="How it works"
            title={
              <>
                From request
                <br />
                to payment.
              </>
            }
            description="Live numbers for Northwind Studio."
          />
        </FadeUp>
        <div className="mt-12 lg:mt-[clamp(0.75rem,2.4svh,3rem)]">
          <FlowStrip />
        </div>
      </section>

      {/* ── 01 REORDER ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]">
        <SectionHeader
            compact
          index="01"
          kicker="Reorder"
          title={
            <>
              Reorder in
              <br />
              one click.
            </>
          }
          description="Save a cart as a list. Reorder it any time, or set a schedule. You always get today's contract price."
          action={{ href: "/business?tab=lists", label: "All lists" }}
        />
        <div className="mt-12 lg:mt-[clamp(0.75rem,2.4svh,3rem)]">
          <ReorderLists thumbnails={false} />
        </div>
      </section>

      {/* ── 02 VOLUME ────────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]">
        <SectionHeader
            compact
          index="02"
          kicker="Volume pricing"
          title={
            <>
              See the price
              <br />
              at your quantity.
            </>
          }
          description="Move the slider to see each price tier, your contract price, and what every supplier would charge with delivery included."
        />
        <div className="mt-12 lg:mt-[clamp(0.75rem,2.4svh,3rem)]">
          <VolumeExplorer items={volume} />
        </div>
      </section>

      {/* ── 03 QUOTES ────────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]" data-nomotion>
        <div className="biz-deck p-6 sm:p-10 lg:p-[clamp(1.5rem,4.2svh,3.5rem)]">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-16">
            <FadeUp className="lg:sticky lg:top-[120px]">
              <SectionHeader
            compact
                index="03"
                kicker="Quotes"
                tone="dark"
                title={
                  <>
                    One request.
                    <br />
                    Competing offers.
                  </>
                }
                description="Tell us what you need once. Verified suppliers send their best price, side by side. Pick one and it becomes a purchase order."
              />
              <Stagger as="ol" className="mt-10 space-y-6 lg:mt-[clamp(0.75rem,3svh,2.5rem)] lg:space-y-[clamp(0.5rem,1.8svh,1.5rem)]" gap={0.12}>
                {[
                  ["Describe", "Item, quantity, target price and delivery date."],
                  ["Compare", "Price, lead time and delivery record, side by side."],
                  ["Award", "One click makes the purchase order. The other suppliers are told."],
                ].map(([t, d], i) => (
                  <StaggerItem as="li" key={t} className="flex gap-4">
                    <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand text-support font-semibold text-ink">{i + 1}</span>
                    <div>
                      <p className="text-body font-medium">{t}</p>
                      <p className="mt-0.5 max-w-md text-support leading-relaxed text-mute-dark">{d}</p>
                    </div>
                  </StaggerItem>
                ))}
              </Stagger>
              <Link href="/business?tab=quotes" className="btn btn-primary mt-10 lg:mt-[clamp(0.75rem,3svh,2.5rem)]">
                Start a quote request <Icon name="arrowRight" size={16} />
              </Link>
            </FadeUp>
            <FadeUp delay={0.1} className="text-ink">
              <RfqBoard />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── 04 DEPARTMENTS ───────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]">
        <SectionHeader index="04" kicker="Bulk departments" title="Shop by department." action={{ href: "/search?bulk=1", label: "All bulk categories" }} />
        <div className="mt-12 grid grid-cols-2 gap-3 lg:mt-[clamp(0.75rem,2.4svh,3rem)] lg:grid-cols-5">
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
        <section className="fold shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]">
          <SectionHeader
            compact
            index="05"
            kicker="Best sellers"
            title="Bulk bestsellers."
            description="Priced at your contract rate, with minimum order and case size shown."
            action={{ href: "/search?bulk=1&sort=popular", label: "Shop bulk" }}
            className="lg:mb-4"
          />
          <div className="fold-body mt-10 lg:mt-0 lg:flex lg:items-center">
            <CardRail label="Bulk bestsellers">
              {bulk.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </CardRail>
          </div>
        </section>
      )}

      {/* ── 06 CONTROL ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-[clamp(4rem,10svh,8rem)]">
        <SectionHeader
            compact
          index="06"
          kicker="Controls"
          title={
            <>
              Set the rules
              <br />
              once.
            </>
          }
          description="Your team buys what it needs. Anything over your limits waits for approval. Finance gets one statement."
          action={{ href: "/business", label: "Open the console" }}
        />
        <div className="mt-12 lg:mt-[clamp(0.75rem,2.4svh,3rem)]">
          <ControlGrid />
        </div>
      </section>
    </>
  );
}
