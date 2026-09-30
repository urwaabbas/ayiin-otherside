import Link from "next/link";
import { categories } from "@/lib/catalog/categories";
import { sellers } from "@/lib/catalog/sellers";
import { ProductImage } from "@/components/product/product-image";
import { PriceHistory } from "@/components/product/price-history";
import { Price } from "@/components/ui/money";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";
import { ClarityCard } from "@/components/home/clarity-card";
import { AskForm } from "@/components/home/ask-form";
import { InlinePill } from "@/components/home/inline-pill";
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
  const { clarity, pill, alternatives, tiles, forYou, lookbook, deals, bestsellers, compare, bridge, delivery, renderedIds } = planPersonalHome();

  return (
    <>
      {/* ── HERO — a midnight band, so the amber logo and CTAs glow ── */}
      <div className="surface-night">
      <section className="shell pt-6 sm:pt-10 lg:pt-12 short:pt-8">
        <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7 xl:col-span-8 short:col-span-7">
            <Eyebrow index="Ayiin" className="animate-fade">
              Intelligent commerce<span className="hidden sm:inline"> · 2.4M products · 18,400 verified sellers</span>
            </Eyebrow>
            <h1 className="display mt-6 text-[clamp(58px,9.4vw,142px)] text-balance short:mt-5 short:text-[clamp(58px,14.5vh,128px)]">
              <span className="block animate-rise">
                See more. <InlinePill items={pill} />
              </span>{" "}
              <span className="block animate-rise [animation-delay:120ms]">Doubt <span className="text-brand-gradient">less.</span></span>
            </h1>
            <p className="mt-7 max-w-[560px] animate-rise text-[17px] leading-relaxed text-ink-2 [animation-delay:220ms] sm:text-[19px] short:mt-5 short:text-[17px]">
              Every product on Ayiin answers the questions that matter — real price history, an exact delivery date, the seller&apos;s record, and whether there&apos;s a better option — before you have to ask.
            </p>
            <AskForm className="mt-8 max-w-[680px] animate-rise [animation-delay:320ms] short:mt-6" />
          </div>
          <div className="surface-day animate-rise [animation-delay:260ms] lg:col-span-5 xl:col-span-4 short:col-span-5">
            <ClarityCard items={clarity} alternatives={alternatives} />
          </div>
        </div>
      </section>

      {/* The numbers band — its own row, so the hero above fits one screen */}
      <section aria-label="Ayiin in numbers" className="shell">
        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:mt-20 lg:grid-cols-4 short:mt-12">
          {[
            ["98.7%", "delivered on the exact date promised"],
            ["12 wks", "of price history behind every deal badge"],
            ["18,400", "sellers, each verified on four checks"],
            ["$0", "hidden fees — the total is the total"],
          ].map(([n, l]) => (
            <div key={l} className="bg-graphite p-5 sm:p-7">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="display block text-[40px] sm:text-[56px]">{n}</span>
                <span className="mt-2 block max-w-[220px] text-[13.5px] text-mute">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

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
        <div className="mt-12 grid auto-rows-[180px] grid-cols-2 gap-3 sm:auto-rows-[220px] lg:grid-cols-4 lg:gap-4 short:mt-8 short:auto-rows-[clamp(130px,calc((100vh-330px)/3),220px)]">
          {categories.map((c, n) => {
            const hero = tiles[c.slug];
            const big = n === 0;
            const tall = n === 3;
            return (
              <Reveal key={c.slug} delay={n * 60} className={big ? "col-span-2 row-span-2" : n === 3 ? "row-span-2" : ""}>
                <Link
                  href={`/c/${c.slug}`}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-5 sm:p-6 short:p-4"
                  style={{ background: c.tint }}
                >
                  {hero && <ProductImage
                    product={hero}
                    feather
                    sizes={big ? "(min-width: 1024px) 40vw, 90vw" : "(min-width: 1024px) 22vw, 45vw"}
                    className={`pointer-events-none absolute transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:scale-[1.04] ${
                      big ? "-bottom-[6%] -right-[6%] aspect-square h-[88%]" : tall ? "-bottom-[4%] -right-[10%] aspect-square w-[108%] short:w-[78%]" : "-bottom-[8%] -right-[10%] aspect-square h-[58%] sm:-bottom-[10%] sm:-right-[8%] sm:h-[82%]"
                    }`}
                  />}
                  <div className="relative short:z-10">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink/60">{String(n + 1).padStart(2, "0")}</span>
                    <h3 className={`display mt-2 ${big ? "text-[40px] sm:text-[64px] short:text-[52px]" : "text-[20px] sm:max-w-[62%] sm:text-[30px] lg:max-w-[58%] short:text-[24px]"} ${tall ? "sm:!max-w-full" : ""}`}>{c.name}</h3>
                    {big && <p className="mt-3 max-w-[300px] text-[15px] text-ink-2">{c.blurb}</p>}
                  </div>
                  <div className="relative flex items-center gap-2 text-[12.5px] text-ink-2">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/70 px-2.5 py-1 backdrop-blur">
                      <SignalDot /> {compact(1200 + n * 713)} items
                    </span>
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-white opacity-0 transition-all duration-500 group-hover:opacity-100">
                      <Icon name="arrowUpRight" size={15} />
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
          <ForYou pool={forYou} />
        </section>
      )}

      {/* ── 03 LOOKBOOK ──────────────────────────────────────── */}
      {lookbook.length > 0 && (
        <section className="shell mt-24 lg:mt-32">
          <Lookbook index="03" items={lookbook} />
        </section>
      )}

      {/* ── 04 VERIFIED DEALS (ink) ──────────────────────────── */}
      {deals.length > 0 && <section className="panel-ink relative mt-24 overflow-hidden py-20 lg:mx-3 lg:mt-32 lg:rounded-[36px] lg:py-28 short:py-10">
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
          <div className="scroll-x -mx-[var(--gutter)] mt-12 flex gap-4 px-[var(--gutter)] pb-2 short:mt-8">
            {deals.map((p) => {
              const ins = priceInsight(p);
              return (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className="group w-[300px] shrink-0 overflow-hidden rounded-[26px] bg-graphite ring-1 ring-graphite-line transition-colors hover:ring-mute-dark sm:w-[340px]"
                >
                  <div className="relative">
                    <ProductImage product={p} sizes="340px" className="aspect-[4/3] w-full short:aspect-[2/1]" />
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
        <div className={clsx("mt-12 grid grid-cols-2 gap-x-4 gap-y-10 short:mt-8", bestsellers.length >= 4 ? "lg:grid-cols-4" : "lg:max-w-[calc(50%-8px)]")}>
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

      {/* ── 07 SELLERS ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="07"
          kicker="Trust, measured"
          title={<>Every seller earns<br />their place.</>}
          description="Identity, inventory, fulfilment and service — four checks before a seller can list, and live scores after."
        />
        <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">The Ayiin Verified check</p>
            <ol className="mt-5 space-y-5">
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
              <div key={s.id} className="flex flex-col justify-between rounded-[26px] bg-white p-6 shadow-[var(--shadow-hair)]">
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
