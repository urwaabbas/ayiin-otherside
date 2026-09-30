import Link from "next/link";
import { categories } from "@/lib/catalog/categories";
import { sellers } from "@/lib/catalog/sellers";
import { ProductImage } from "@/components/product/product-image";
import { PriceHistory } from "@/components/product/price-history";
import { Price } from "@/components/ui/money";
import { SignalDot } from "@/components/ui/signal";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { HeroFlashlight } from "@/components/home/hero-flashlight";
import { DiscoverHero, discoverProducts } from "@/components/discover/discover-hero";
import { ForYou } from "@/components/home/for-you";
import { CompareTeaser } from "@/components/home/compare-teaser";
import { BusinessBridge } from "@/components/home/business-bridge";
import { Lookbook } from "@/components/home/lookbook";
import { RecentlyViewed } from "@/components/product/recently-viewed";
import { ProductCard, RAIL_FRAME } from "@/components/product/product-card";
import { priceInsight, deliveryLabel } from "@/lib/commerce";
import { planPersonalHome } from "@/lib/home-plan";
import { compact } from "@/lib/format";
import { readableOn } from "@/lib/color";
import { clsx } from "clsx";

export const QUESTIONS = [
  "What should I buy?",
  "Why should I buy it?",
  "Is it available?",
  "When will I receive it?",
  "Is this seller trustworthy?",
  "Is there a better option?",
  "Can I compare it?",
  "Can I get a better price?",
  "Can I buy this in bulk?",
  "Can I reorder it?",
  "Can I get a quote?",
];

export function QuestionMarquee({ tone = "light" }: { tone?: "light" | "dark" }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {QUESTIONS.map((q) => (
        <span key={q} className="flex items-center">
          <span className={tone === "dark" ? "text-porcelain/85" : "text-ink/85"}>{q}</span>
          <span aria-hidden className="mx-8 inline-block h-2.5 w-2.5 rounded-full bg-brand shadow-[0_0_0_1.5px_rgb(var(--rgb-ink)/0.85)]" />
        </span>
      ))}
    </div>
  );
  return (
    <div
      className="relative flex overflow-hidden py-6 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
      aria-label="Questions Ayiin answers on every product"
    >
      <div className="display flex animate-marquee whitespace-nowrap text-[30px] tracking-[-0.03em] sm:text-[40px]" aria-hidden>
        {row}
        {row}
      </div>
      <ul className="sr-only">
        {QUESTIONS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

export function HomePersonal() {
  // Every product on this page comes from one plan, so none appears twice.
  const { catalog, tiles, forYou, lookbook, deals, bestsellers, compare, bridge, delivery, renderedIds } = planPersonalHome();

  return (
    <>
      {/* ── HERO — a midnight band, so the amber logo and CTAs glow ── */}
      <div className="surface-night">
      <HeroFlashlight products={discoverProducts()}>
      <section className="shell pb-10 pt-6 sm:pt-10 lg:pb-[clamp(12px,1.6vh,28px)] lg:pt-[clamp(20px,4vh,48px)]">
        <DiscoverHero />
      </section>
      </HeroFlashlight>


      <section className="mt-10 border-t border-line">
        <QuestionMarquee />
      </section>
      </div>

      {/* ── 01 CATEGORIES ────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="01"
          kicker="Discover"
          title={<>Start anywhere.<br />Arrive somewhere good.</>}
          description="Eight edited departments, each with a buying guide that tells you what actually matters — and what doesn't."
          action={{ href: "/search", label: "Browse everything" }}
        />
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] lg:grid-cols-4 lg:gap-4 short:mt-[clamp(16px,3.4vh,32px)] short:auto-rows-[clamp(96px,calc((100vh-318px)/3),220px)]">
          {categories.map((c, n) => {
            const hero = tiles[c.slug];
            const big = n === 0;
            const tall = n === 3;
            return (
              <Reveal key={c.slug} delay={n * 60} className={big ? "col-span-2 row-span-2" : tall ? "row-span-2" : ""}>
                <Link
                  href={`/c/${c.slug}`}
                  className="group relative flex h-full flex-col justify-end overflow-hidden rounded-[24px] border border-line bg-mist shadow-[0_1px_2px_rgb(var(--rgb-ink)/0.05)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-soft)]"
                >
                  {hero && (
                    <ProductImage
                      product={hero}
                      sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                      className="absolute inset-0 h-full w-full"
                      imgClassName="transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                    />
                  )}
                  {/* Scrim: keeps the label legible on any photo */}
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(to_top,rgb(var(--rgb-ink)/0.78)_0%,rgb(var(--rgb-ink)/0.28)_42%,transparent_72%)]" />
                  <span
                    aria-hidden
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink opacity-0 shadow-[var(--shadow-hair)] backdrop-blur transition-all duration-300 group-hover:opacity-100 sm:right-4 sm:top-4"
                  >
                    <Icon name="arrowUpRight" size={16} />
                  </span>
                  <div className="relative p-4 sm:p-5 short:p-[clamp(12px,2vh,20px)]">
                    <h3 className={`display text-white ${big ? "text-[36px] sm:text-[56px] short:text-[clamp(32px,6vh,52px)]" : "text-[20px] sm:text-[26px] short:text-[clamp(18px,3vh,24px)]"}`}>{c.name}</h3>
                    {big && <p className="mt-2 max-w-[340px] text-[14px] leading-relaxed text-white/80">{c.blurb}</p>}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-white/80 sm:mt-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" /> {compact(1200 + n * 713)} items
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── 02 FOR YOU ───────────────────────────────────────── */}
      {forYou.length > 0 && (
        <section className="shell mt-24 lg:mt-32">
          <ForYou pool={forYou} catalog={catalog} />
        </section>
      )}

      {/* ── 03 LOOKBOOK ──────────────────────────────────────── */}
      {lookbook.length > 0 && (
        <section className="shell mt-24 lg:mt-32">
          <Lookbook index="03" items={lookbook} />
        </section>
      )}

      {/* ── 04 VERIFIED DEALS (ink) ──────────────────────────── */}
      {deals.length > 0 && <section className="panel-ink relative mt-24 overflow-hidden py-14 lg:mx-3 lg:mt-32 lg:rounded-[36px] lg:py-16 short:py-[clamp(24px,5vh,40px)]">
        <div aria-hidden className="grid-texture-dark pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="shell relative">
          <SectionHeader
            tone="dark"
            index="04"
            kicker="Honest pricing"
            title={<>Deals you can<br />actually verify.</>}
            description="Every discount is checked against twelve weeks of real prices. If it isn't a genuine low, we simply don't call it a deal."
            action={{ href: "/search?deal=1", label: "All verified deals" }}
          />
          <div className="scroll-x -mx-[var(--gutter)] mt-8 flex gap-4 px-[var(--gutter)] pb-2 short:mt-[clamp(16px,3.4vh,32px)]">
            {deals.map((p) => {
              const ins = priceInsight(p);
              return (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className="group w-[300px] shrink-0 overflow-hidden rounded-[26px] bg-graphite ring-1 ring-graphite-line transition-colors hover:ring-mute-dark sm:w-[340px]"
                >
                  <div className="relative">
                    <ProductImage product={p} sizes="340px" className="aspect-[16/10] w-full short:aspect-auto short:h-[clamp(110px,calc(100vh-510px),170px)]" />
                    <span className="glint absolute left-3 top-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-brand px-2.5 text-[11.5px] font-medium text-ink">
                      <Icon name="check" size={12} strokeWidth={2.4} /> {ins.label}
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="line-clamp-1 text-[15px] font-medium">{p.name}</p>
                    <div className="mt-2 flex items-end justify-between gap-4">
                      <Price usd={p.price} size="lg" strike={p.compareAt} className="[&_.line-through]:text-mute-dark" />
                    </div>
                    <div className="mt-4">
                      <PriceHistory history={p.history} tone="dark" height={44} />
                      <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-mute-dark">
                        <span>12 wks ago</span>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>}

      {/* ── 05 BESTSELLERS ───────────────────────────────────── */}
      {bestsellers.length > 0 && <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="05"
          kicker="Social proof, not hype"
          title="What people bought this week."
          description="Ranked by verified purchases in the last seven days — not by who paid for placement."
          action={{ href: "/search?sort=popular", label: "See the full chart" }}
        />
        <div className={clsx("mt-12 grid grid-cols-2 gap-x-4 gap-y-10 short:mt-[clamp(16px,3.4vh,32px)]", bestsellers.length >= 4 ? "lg:grid-cols-4" : "lg:max-w-[calc(50%-8px)]")}>
          {bestsellers.map((p, n) => (
            <Reveal key={p.id} delay={n * 80}>
              <ProductCard product={p} rank={n + 1} reason={`${compact(p.soldLastWeek)} bought this week`} frame={RAIL_FRAME} />
            </Reveal>
          ))}
        </div>
      </section>}

      {/* ── 06 COMPARE ───────────────────────────────────────── */}
      {compare.length > 1 && (
        <section className="shell mt-24 lg:mt-32">
          <CompareTeaser items={compare} />
        </section>
      )}

      {/* ── THE NUMBERS — proof points, set just before the seller trust section ── */}
      <section aria-label="Ayiin in numbers" className="shell mt-24 lg:mt-32">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:grid-cols-4">
          {[
            ["98.7%", "delivered on the exact date promised"],
            ["12 wks", "of price history behind every deal badge"],
            ["18,400", "sellers, each verified on four checks"],
            ["$0", "hidden fees — the total is the total"],
          ].map(([n, l]) => (
            <div key={l} className="bg-white p-5 sm:p-7">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="display block text-[40px] sm:text-[56px]">{n}</span>
                <span className="mt-2 block max-w-[220px] text-[13.5px] text-mute">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── 07 SELLERS ───────────────────────────────────────── */}
      <section className="shell mt-12 lg:mt-16">
        <SectionHeader
          index="07"
          kicker="Trust, measured"
          title={<>Every seller earns<br />their place.</>}
          description="Identity, inventory, fulfilment and service — four checks before a seller can list, and live scores after."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_2fr] short:mt-[clamp(16px,3.4vh,32px)]">
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)] short:p-[clamp(16px,3vh,28px)]">
            <p className="eyebrow">The Ayiin Verified check</p>
            <ol className="mt-5 space-y-5 short:mt-[clamp(10px,2vh,20px)] short:space-y-[clamp(10px,2vh,20px)]">
              {[
                ["Identity", "Business registration, ownership and bank details verified."],
                ["Inventory", "Stock levels synced live — no phantom listings."],
                ["Fulfilment", "On-time rate measured on every order, publicly."],
                ["Service", "Response time and return rate tracked; below standard, delisted."],
              ].map(([t, d], n) => (
                <li key={t} className="flex gap-4">
                  <span className="num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink text-[12px] text-brand">{n + 1}</span>
                  <div>
                    <p className="text-[15px] font-medium">{t}</p>
                    <p className="text-[13.5px] text-mute">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {sellers.filter((s) => !s.business || s.id === "northform" || s.id === "atelier-mesa").slice(0, 4).map((s) => (
              <div key={s.id} className="flex flex-col justify-between rounded-[26px] bg-white p-6 short:p-[clamp(16px,3vh,24px)] shadow-[var(--shadow-hair)]">
                <div className="flex items-center gap-3">
                  <span className="num grid h-11 w-11 place-items-center rounded-full text-[13px] font-medium" style={{ background: s.color, color: readableOn(s.color) }}>
                    {s.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[15px] font-medium">
                      {s.name} <Icon name="shield" size={14} className="text-brand-deep" />
                    </p>
                    <p className="truncate text-[12.5px] text-mute">{s.tagline}</p>
                  </div>
                </div>
                <dl className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-4">
                  {[
                    [`${s.onTime}%`, "On time"],
                    [`${s.rating}`, "Rating"],
                    [`${s.responseHours}h`, "Replies in"],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-[11.5px] text-mute">{l}</dt>
                      <dd className="num mt-0.5 text-[18px] font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RecentlyViewed exclude={renderedIds} className="shell mt-24 lg:mt-32" />

      {/* ── 08 BUSINESS BRIDGE ───────────────────────────────── */}
      {bridge && (
        <section className="shell mt-24 lg:mt-32">
          <BusinessBridge product={bridge} />
        </section>
      )}

      {/* ── Last word: delivery promise ──────────────────────── */}
      {delivery.length > 0 && <section className="shell mt-24 lg:mt-32">
        <div className="grid items-end gap-8 lg:grid-cols-2">
          <h2 className="display text-[44px] sm:text-[64px]">
            Order by 5pm.
            <br />
            <span className="text-mute">Know the day it lands.</span>
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {delivery.map((p) => (
              <li key={p.id}>
                <Link href={`/p/${p.slug}`} className="flex items-center gap-3 rounded-2xl bg-white p-2.5 pr-4 shadow-[var(--shadow-hair)] transition-shadow hover:shadow-[var(--shadow-soft)]">
                  <ProductImage product={p} sizes="56px" className="h-14 w-14 shrink-0 rounded-xl" />
                  <span className="min-w-0">
                    <span className="block truncate text-[13.5px] font-medium">{p.name}</span>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-2">
                      <SignalDot live /> {deliveryLabel(p)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>}
    </>
  );
}
