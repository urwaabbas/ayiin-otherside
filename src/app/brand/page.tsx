import type { Metadata } from "next";
import { AyiinLogo, AyiinMark } from "@/components/brand/ayiin-logo";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "@/components/product/product-image";
import { productBySlug } from "@/lib/catalog/products";
import { BRAND_COLORS as C } from "@/lib/brand-colors";

export const metadata: Metadata = {
  title: "Brand",
  description: "The Ayiin identity: the Aperture symbol, custom wordmark, colour, typography and the Intelligent Commerce language.",
};

const COLORS: { name: string; hex: string; role: string; share: number; ink: boolean; fill?: string }[] = [
  { name: "Cloud", hex: C.porcelain, role: "Page background — a cool, clean white that makes products the hero", share: 55, ink: true },
  { name: "Pure White", hex: C.white, role: "Cards, product stages, inputs, modals", share: 20, ink: true },
  { name: "Midnight Navy", hex: C.graphite, role: "Header, heroes, footer, dark panels — the logo's complement", share: 18, ink: false },
  { name: "Navy Ink", hex: C.ink, role: "Type and primary actions", share: 2, ink: false },
  { name: "Ayiin Amber", hex: C.brand, role: "The decisive CTA, live and verified signals, selection", share: 4, ink: true },
  { name: "Deep Amber", hex: C.brandDeep, role: "Amber for text and icons on light surfaces", share: 1, ink: false },
  {
    name: "Logo gradient",
    hex: `${C.brandOrange} → ${C.brandYellow}`,
    fill: `linear-gradient(90deg, ${C.brandOrange}, ${C.brand} 54%, ${C.brandYellow})`,
    role: "The mark, progress bars, and one hero word per page",
    share: 0,
    ink: true,
  },
  { name: "Soft", hex: C.soft, role: "Quiet fills, tracks, dividers", share: 0, ink: true },
];

function Tile({ label, children, dark, className }: { label: string; children: React.ReactNode; dark?: boolean; className?: string }) {
  return (
    <figure className={`flex flex-col overflow-hidden rounded-[26px] ${dark ? "bg-ink" : "bg-white shadow-[var(--shadow-hair)]"} ${className ?? ""}`}>
      <div className="grid flex-1 place-items-center p-10">{children}</div>
      <figcaption className={`border-t px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] ${dark ? "border-graphite-line text-mute-dark" : "border-line text-mute"}`}>{label}</figcaption>
    </figure>
  );
}

export default function BrandPage() {
  const hp = productBySlug("aurel-anc-over-ear")!;
  const runner = productBySlug("pour-gooseneck-kettle")!;
  return (
    <div>
      {/* Hero */}
      <section className="shell pt-6 lg:pt-10">
        <Eyebrow index="Brand">Intelligent Commerce · Identity system v2.0</Eyebrow>
        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h1 className="display text-[64px] sm:text-[112px]">Sunlit A.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2">
              A bold, forward-leaning <em>A</em> in a warm orange-to-yellow gradient, followed by charcoal lettering whose two i&apos;s carry the same sunlit dots. The gradient is where the whole palette comes from; the charcoal sets every neutral.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Discovery", "Connection", "Commerce", "Choice"].map((w) => (
                <span key={w} className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_0_1px_var(--color-ink)]" /> {w}
                </span>
              ))}
            </div>
          </div>
          <div className="panel-ink relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[36px] bg-graphite">
            <div aria-hidden className="grid-texture-dark absolute inset-0" />
            <AyiinLogo on="dark" className="relative h-[34%]" />
          </div>
        </div>
      </section>

      {/* The mark */}
      <section className="shell mt-24">
        <Eyebrow index="01">The mark</Eyebrow>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid place-items-center rounded-[32px] bg-white p-10 shadow-[var(--shadow-hair)] sm:p-16">
            <AyiinLogo on="light" className="h-28 sm:h-36" />
          </div>
          <ul className="grid content-start gap-3">
            {[
              ["The A", "A forward-leaning A cut from a single stroke, its counter opening like a doorway. It works on its own wherever space is square: favicon, app icon, badges."],
              ["The gradient", "Orange #FF9B2B through amber #FFA624 to yellow #FDD207. Amber is the brand colour across the site — used as a signal, never as a paint."],
              ["The lettering", "Charcoal #282828 on light surfaces, near-white on dark. Every neutral on Ayiin is this charcoal, warmed a touch."],
              ["Two dots", "The i's carry the gradient too, so the A and the dots read as one idea: warmth where it matters, calm everywhere else."],
            ].map(([t, d]) => (
              <li key={t} className="rounded-[22px] bg-white p-5 shadow-[var(--shadow-hair)]">
                <p className="text-[15px] font-medium">{t}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-mute">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Logo system */}
      <section className="shell mt-24">
        <Eyebrow index="02">Logo system</Eyebrow>
        <h2 className="display mt-4 text-[44px] sm:text-[64px]">One logo, every surface.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="1 · Logo — for light surfaces" className="lg:col-span-2">
            <AyiinLogo on="light" className="h-20" />
          </Tile>
          <Tile label="2 · Logo — for dark surfaces" dark className="lg:col-span-2">
            <AyiinLogo on="dark" className="h-20" />
          </Tile>
          <Tile label="3 · The A">
            <AyiinMark className="h-28" />
          </Tile>
          <Tile label="4 · App icon" dark>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="App icon" className="h-24 w-24 drop-shadow-[0_20px_30px_rgb(var(--rgb-ink)/0.4)]" />
          </Tile>
          <Tile label="5 · Favicon · 48 / 32 / 16">
            <div className="flex items-end gap-5">
              {["h-12 w-12", "h-8 w-8", "h-4 w-4"].map((c) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={c} src="/icon.svg" alt="" className={c} />
              ))}
            </div>
          </Tile>
          <Tile label="Clear space = height of the A ÷ 2 · Minimum 20px tall">
            <div className="relative p-6 outline-1 outline-dashed outline-brand-deep/60">
              <AyiinLogo on="light" className="h-10" />
            </div>
          </Tile>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
          {["ayiin-logo-on-light.svg", "ayiin-logo-on-dark.svg", "ayiin-mark.svg"].map((f) => (
            <a key={f} href={`/brand/${f}`} download className="chip">
              <Icon name="upload" size={13} className="rotate-180" /> {f}
            </a>
          ))}
        </div>
      </section>

      {/* On dark */}
      <section className="shell mt-24 grid gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow index="03">On dark</Eyebrow>
          <h2 className="display mt-4 text-[44px] sm:text-[64px]">Same warmth, after dark.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-2">
            On graphite the lettering turns near-white and the gradient stays exactly as it is — the footer, business panels and dark sections are the same brand, not a second one.
          </p>
        </div>
        <div className="panel-ink flex items-center justify-center rounded-[32px] bg-graphite p-10 sm:p-14">
          <div className="w-full max-w-[520px]">
            <AyiinLogo on="dark" className="!h-auto !w-full" />
          </div>
        </div>
      </section>

      {/* Color */}
      <section className="shell mt-24">
        <Eyebrow index="04">Colour</Eyebrow>
        <h2 className="display mt-4 text-[44px] sm:text-[64px]">Midnight and sunlight.</h2>
        <p className="mt-4 max-w-xl text-[16px] text-mute">Built against the logo: its sunlit amber sits on midnight navy, its exact opposite on the colour wheel, so the brand glows. Clean whites carry the products; amber marks what matters.</p>
        <div className="mt-8 flex h-4 overflow-hidden rounded-full shadow-[var(--shadow-hair)]" aria-label="Usage ratio: 55% cloud, 20% white, 20% navy, 5% amber">
          {COLORS.filter((c) => c.share).map((c) => (
            <span key={c.name} style={{ background: c.hex, width: `${c.share}%` }} title={`${c.name} ${c.share}%`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-mute">
          <span>55% cloud</span>
          <span>20% white</span>
          <span>20% navy · 5% amber</span>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map((c) => (
            <div key={c.name} className="overflow-hidden rounded-[22px] bg-white shadow-[var(--shadow-hair)]">
              <div className="flex h-32 items-end p-4" style={{ background: c.fill ?? c.hex, color: c.ink ? C.ink : C.porcelain }}>
                <span className="num text-[13px]">{c.hex}</span>
              </div>
              <div className="p-4">
                <p className="text-[15px] font-medium">{c.name}</p>
                <p className="mt-1 text-[13px] text-mute">{c.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section className="shell mt-24">
        <Eyebrow index="05">Typography</Eyebrow>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)] lg:col-span-2">
            <p className="eyebrow">Display · Funnel Display 400, −4.5% tracking</p>
            <p className="display mt-4 text-[64px] sm:text-[96px]">Doubt less.</p>
            <p className="display mt-2 text-[36px] text-mute">Editorial scale. Weight through size, not bold.</p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
              <p className="eyebrow">Interface · Geist</p>
              <p className="mt-3 text-[22px] font-medium tracking-[-0.02em]">Aurel ANC Over-Ear Headphones</p>
              <p className="mt-1 text-[14px] text-mute">Readable product titles, calm metadata.</p>
            </div>
            <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
              <p className="eyebrow">Data · Geist Mono, tabular</p>
              <p className="num mt-3 text-[22px]">$1,249.00 · 99.1% · AY-KOV-1028</p>
              <p className="mt-1 text-[14px] text-mute">Prices, SKUs and scores line up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signature elements */}
      <section className="shell mt-24">
        <Eyebrow index="06">Signature elements</Eyebrow>
        <h2 className="display mt-4 text-[44px] sm:text-[64px]">Recognisable without the logo.</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">The signal dot</p>
            <p className="mt-5 flex items-center gap-2.5 text-[15px]">
              <SignalDot live /> Arrives tomorrow · 214 in stock
            </p>
            <p className="mt-4 text-[13.5px] text-mute">A ringed amber point marks anything live and verified: delivery, deals, trust.</p>
          </div>
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">Inline image capsules</p>
            <p className="display mt-4 text-[48px]">
              See{" "}
              <span className="relative inline-block h-[0.74em] w-[1.42em] overflow-hidden rounded-full align-[-0.02em]">
                <ProductImage product={hp} sizes="96px" zoom={1.35} className="absolute inset-0 h-full w-full" />
              </span>{" "}
              more.
            </p>
            <p className="mt-4 text-[13.5px] text-mute">Product imagery set into display type — editorial, never decorative.</p>
          </div>
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">Numbered chapters</p>
            <div className="mt-5">
              <Eyebrow index="03">Honest pricing</Eyebrow>
            </div>
            <p className="mt-4 text-[13.5px] text-mute">Every section is a chapter with an index. The page reads like a well-made magazine.</p>
          </div>
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">Clarity rows</p>
            <dl className="mt-4 divide-y divide-line border-y border-line text-[13.5px]">
              {[
                ["Arrives", "Tuesday — order within 3h 12m"],
                ["Seller", "99.1% on time"],
                ["In bulk?", "8% off from 10 units"],
              ].map(([q, a]) => (
                <div key={q} className="grid grid-cols-[90px_1fr] py-2">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-mute">{q}</dt>
                  <dd>{a}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="rounded-[26px] bg-white p-7 shadow-[var(--shadow-hair)]">
            <p className="eyebrow">Studio renders</p>
            <ProductImage product={runner} view="scene" sizes="(min-width: 1024px) 400px, 90vw" className="mt-4 aspect-[16/9] w-full rounded-2xl" />
            <p className="mt-4 text-[13.5px] text-mute">One softbox, one window, one sweep. Every product, every seller, photographed on the same honest stage.</p>
          </div>
          <div className="panel-ink rounded-[26px] p-7">
            <p className="eyebrow !text-mute-dark">Motion</p>
            <ul className="mt-4 space-y-2 font-mono text-[12px] text-mute-dark">
              <li><span className="text-porcelain">ease-out-expo</span> · cubic-bezier(.16,1,.3,1)</li>
              <li><span className="text-porcelain">200ms</span> · state changes</li>
              <li><span className="text-porcelain">500ms</span> · panels & header</li>
              <li><span className="text-porcelain">900ms</span> · reveals & imagery</li>
            </ul>
            <p className="mt-4 text-[13.5px] text-mute-dark">Cinematic but restrained. Nothing loops except live data. Reduced-motion is honoured everywhere.</p>
          </div>
        </div>
      </section>

      {/* Voice */}
      <section className="shell mt-24">
        <div className="grid gap-8 rounded-[36px] bg-brand-soft p-8 sm:p-12 lg:grid-cols-2">
          <div>
            <Eyebrow index="07" className="!text-ink/60">Voice</Eyebrow>
            <h2 className="display mt-4 text-[44px] sm:text-[72px]">Answers, not adjectives.</h2>
          </div>
          <ul className="grid content-center gap-3 text-[16px]">
            {[
              ["Not", "Amazing noise cancelling!", "But", "−38 dB. Measurably quieter on flights."],
              ["Not", "Fast shipping", "But", "Arrives Tuesday. Order within 3h 12m."],
              ["Not", "Huge sale!", "But", "Lowest price in 90 days — here’s the history."],
            ].map(([a, b, c, d]) => (
              <li key={b} className="rounded-2xl bg-ink/[0.06] p-4">
                <span className="text-ink/60">{a} </span>
                <span className="line-through decoration-ink/40">{b}</span>
                <span className="text-ink/60"> {c} </span>
                <span className="font-medium">{d}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
