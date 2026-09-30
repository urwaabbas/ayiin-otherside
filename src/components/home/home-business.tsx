import Link from "next/link";
import { categories } from "@/lib/catalog/categories";
import { sellerById } from "@/lib/catalog/sellers";
import { approvals, company, rfqResponses } from "@/lib/business";
import { ProductImage } from "@/components/product/product-image";
import { ProductCard } from "@/components/product/product-card";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Icon, type IconName } from "@/components/ui/icon";
import { Money } from "@/components/ui/money";
import { InlinePill } from "@/components/home/inline-pill";
import { QuestionMarquee } from "@/components/home/home-personal";
import { QuickOrder } from "@/components/business/quick-order";
import { VolumeExplorer } from "@/components/business/volume-explorer";
import { ReorderLists } from "@/components/business/reorder-lists";
import { ApprovalQueue } from "@/components/business/approval-queue";

import { planBusinessHome } from "@/lib/home-plan";

export function HomeBusiness() {
  // Every product on this page comes from one plan, so none appears twice.
  const { pill, volume, rfq: gloves, tiles, bulk } = planBusinessHome();
  const available = company.creditLimit - company.creditUsed;

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="shell pt-6 sm:pt-10 lg:pt-12">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Eyebrow index="Ayiin Business" className="animate-fade">
              Procurement<span className="hidden sm:inline"> for 12,000+ companies · Net terms · Multi-supplier quotes</span>
            </Eyebrow>
            <h1 className="display mt-6 text-[clamp(54px,8.4vw,128px)]">
              <span className="block animate-rise">Procure in</span>{" "}
              <span className="block animate-rise [animation-delay:100ms]">minutes, not</span>{" "}
              <span className="block animate-rise [animation-delay:200ms]">
                <InlinePill items={pill} /> weeks.
              </span>
            </h1>
            <p className="mt-7 max-w-[560px] animate-rise text-[17px] leading-relaxed text-ink-2 [animation-delay:280ms] sm:text-[19px]">
              Paste a list, get live volume pricing from verified suppliers, route it for approval and pay on terms — in one place, for your whole team.
            </p>
            <div className="mt-8 max-w-[680px] animate-rise [animation-delay:340ms]">
              <QuickOrder variant="hero" />
            </div>
          </div>

          {/* Account card */}
          <aside aria-label="Company account" className="animate-rise [animation-delay:260ms] lg:col-span-5">
            <div className="panel-ink relative overflow-hidden rounded-[32px] p-6 sm:p-7">
              <div aria-hidden className="grid-texture-dark pointer-events-none absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-porcelain font-mono text-[13px] font-medium text-ink">NW</span>
                    <div>
                      <p className="text-[16px] font-medium">{company.name}</p>
                      <p className="text-[12.5px] text-mute-dark">
                        {company.terms} · Tax exempt · 5 members
                      </p>
                    </div>
                  </div>
                  <Link href="/business" className="btn btn-on-dark btn-sm">
                    Dashboard
                  </Link>
                </div>

                <div className="mt-7">
                  <div className="flex items-end justify-between">
                    <p className="text-[12.5px] text-mute-dark">Available credit</p>
                    <p className="num text-[12.5px] text-mute-dark">
                      of <Money usd={company.creditLimit} />
                    </p>
                  </div>
                  <p className="display mt-1 text-[52px] leading-none">
                    <Money usd={available} mono={false} />
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-graphite">
                    <div className="bg-brand-gradient h-full rounded-full" style={{ width: `${(available / company.creditLimit) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-[12px] text-mute-dark">Next invoice due Oct 4 · Autopay off</p>
                </div>

                <div className="mt-7">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="eyebrow !text-mute-dark">Waiting on you</p>
                    <Link href="/business?tab=approvals" className="text-[12.5px] text-brand hover:underline">
                      All approvals
                    </Link>
                  </div>
                  <ApprovalQueue items={approvals.slice(0, 2)} tone="dark" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line lg:mt-20 lg:grid-cols-4">
          {[
            ["3h 12m", "median time to first supplier quote"],
            ["23%", "average saved at volume vs. list price"],
            ["1 click", "to reorder any list, or schedule it"],
            ["Net 60", "terms available after 90 days of spend"],
          ].map(([n, l]) => (
            <div key={l} className="bg-porcelain p-5 sm:p-7">
              <dt className="sr-only">{l}</dt>
              <dd>
                <span className="display block text-[40px] sm:text-[56px]">{n}</span>
                <span className="mt-2 block max-w-[220px] text-[13.5px] text-mute">{l}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="panel-ink mt-10">
        <QuestionMarquee tone="dark" />
      </section>

      {/* ── 01 REORDER ───────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="01"
          kicker="Repeat purchasing"
          title={<>Reorder in one click.<br />Or never think about it.</>}
          description="Save any cart as a procurement list, then reorder it instantly or put it on a schedule. Prices update to today's contract rate automatically."
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
          title={<>Every price break,<br />every supplier, visible.</>}
          description="Slide to your quantity. See the unit price at each tier and the landed cost from every verified supplier stocking the item — lead time and reliability included."
        />
        <div className="mt-12">
          <VolumeExplorer items={volume} />
        </div>
      </section>

      {/* ── 03 RFQ ───────────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <SectionHeader
              index="03"
              kicker="Quotes without email chains"
              title={<>One request.<br />Competing offers.</>}
              description="Describe what you need once. Ayiin sends it to every qualified supplier, normalises their responses and lets you accept the best one as a purchase order."
            />
            <ol className="mt-10 space-y-5">
              {[
                ["Describe", "Items, quantities, target price and delivery date — or attach a spec sheet."],
                ["Compare", "Responses arrive side by side with landed cost, lead time and supplier score."],
                ["Accept", "Convert the winning quote to a PO in one click; approvals run automatically."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-4">
                  <span className="num grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink text-[13px]">{i + 1}</span>
                  <div>
                    <p className="text-[16px] font-medium">{t}</p>
                    <p className="text-[14px] text-mute">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Link href="/business?tab=quotes" className="btn btn-ink mt-10">
              Start a quote request <Icon name="arrowRight" size={16} />
            </Link>
          </div>

          <Reveal className="rounded-[32px] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">RFQ-20418 · 3 responses</p>
                <p className="mt-2 text-[18px] font-medium tracking-[-0.02em]">200 boxes · Nitrile gloves 4 mil, size M/L</p>
                <p className="text-[13px] text-mute">Target $9.75/box · Deliver by Oct 6 · Reno, NV</p>
              </div>
              {gloves && <ProductImage product={gloves} sizes="64px" className="hidden h-16 w-16 rounded-2xl sm:block" />}
            </div>
            <ul className="mt-6 space-y-2.5">
              {rfqResponses.map((r, i) => {
                const s = sellerById(r.seller);
                const underTarget = r.price <= 9.75;
                return (
                  <li key={r.seller} className={`grid grid-cols-[1fr_auto] items-center gap-3 rounded-2xl border p-4 ${i === 0 ? "border-ink" : "border-line"}`}>
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-[14.5px] font-medium">
                        {s.name}
                        {i === 0 && <span className="rounded-full bg-brand px-2 py-0.5 text-[10.5px]">Recommended</span>}
                      </p>
                      <p className="mt-0.5 truncate text-[12.5px] text-mute">
                        Replied in {r.time} · {r.lead}d lead · {r.note}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="num text-[16px] font-medium">
                        <Money usd={r.price} cents />
                      </p>
                      <p className={`text-[11.5px] ${underTarget ? "text-success" : "text-mute"}`}>{underTarget ? "Under target" : "Above target"}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-mist p-4 text-[13.5px]">
              <span className="flex items-center gap-2">
                <SignalDot live /> Guardline accepted a counter at <span className="num font-medium">$9.55</span>
              </span>
              <span className="num text-mute">saves $190</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 04 CONTROLS ──────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="04"
          kicker="Built for how companies buy"
          title={<>Control without<br />the bureaucracy.</>}
          description="Everyone buys what they need. Rules decide what needs a second look. Finance gets clean invoices."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={i * 60} className={f.wide ? "lg:col-span-2" : ""}>
              <div className={`flex h-full flex-col rounded-[26px] p-6 sm:p-7 ${f.dark ? "panel-ink" : "bg-white shadow-[var(--shadow-hair)]"}`}>
                <span className={`grid h-11 w-11 place-items-center rounded-2xl ${f.dark ? "bg-graphite text-brand" : "bg-mist"}`}>
                  <Icon name={f.icon} size={20} />
                </span>
                <p className="mt-5 text-[18px] font-medium tracking-[-0.02em]">{f.title}</p>
                <p className={`mt-1.5 text-[14px] leading-relaxed ${f.dark ? "text-mute-dark" : "text-mute"}`}>{f.body}</p>
                {f.chips && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {f.chips.map((c) => (
                      <span key={c} className={`rounded-full px-3 py-1.5 text-[12px] ${f.dark ? "bg-graphite text-porcelain" : "bg-mist text-ink-2"}`}>
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 05 CATEGORIES ────────────────────────────────────── */}
      <section className="shell mt-24 lg:mt-32">
        <SectionHeader index="05" kicker="Bulk-ready" title="Stock the whole operation." action={{ href: "/search?bulk=1", label: "All bulk categories" }} />
        <div className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {categories
            .filter((c) => c.business)
            .map((c, n) => {
              const hero = tiles[c.slug];
              return (
                <Reveal key={c.slug} delay={n * 60}>
                  <Link href={`/c/${c.slug}`} className="group block overflow-hidden rounded-[24px]" style={{ background: c.tint }}>
                    {hero ? (
                      <ProductImage
                        product={hero}
                        sizes="(min-width: 1024px) 20vw, 50vw"
                        className="aspect-square w-full transition-transform duration-[1000ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.05]"
                      />
                    ) : (
                      <div aria-hidden className="aspect-square w-full" />
                    )}
                    <div className="flex items-center justify-between p-4">
                      <span className="text-[15px] font-medium">{c.name}</span>
                      <Icon name="arrowUpRight" size={16} />
                    </div>
                  </Link>
                </Reveal>
              );
            })}
        </div>
      </section>

      {/* ── 06 BULK BESTSELLERS ──────────────────────────────── */}
      {bulk.length > 0 && <section className="shell mt-24 lg:mt-32">
        <SectionHeader
          index="06"
          kicker="What companies restock most"
          title="Bulk bestsellers."
          description="Shown with your contract and volume pricing. List price, MOQ and case pack are always visible."
        />
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {bulk.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 70}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>}
    </>
  );
}

const FEATURES: { icon: IconName; title: string; body: string; chips?: string[]; wide?: boolean; dark?: boolean }[] = [
  {
    icon: "approve",
    title: "Approval rules that fit your org",
    body: "Route by amount, category, cost centre or requester. Auto-approve the routine; escalate the unusual. Approvers act from email or Slack.",
    chips: ["Over $2,500 → Manager", "Electronics → IT", "Events → Budget owner", "Under $500 → Auto"],
    wide: true,
    dark: true,
  },
  { icon: "users", title: "Teams, roles & budgets", body: "Admins, buyers and requesters with spend limits per person and per cost centre." },
  { icon: "pin", title: "Every location, one order", body: "Split a single order across HQ, warehouses and studios with dock notes and delivery windows." },
  { icon: "receipt", title: "Invoices finance will love", body: "Consolidated monthly invoicing, PO matching, VAT/GST detail and tax-exempt certificates on file." },
  { icon: "wallet", title: "Pay on your terms", body: "Net 30 or 60, purchase orders, ACH, virtual cards — with credit limits that grow with you." },
  { icon: "layers", title: "Fits your stack", body: "Punch-out for Coupa & SAP Ariba, NetSuite and QuickBooks sync, and a full ordering API.", chips: ["Coupa", "SAP Ariba", "NetSuite", "QuickBooks", "API"], wide: true },
  { icon: "trend", title: "Spend you can see", body: "Spend by team, category and supplier — with savings tracked against list price and exported monthly." },
];
