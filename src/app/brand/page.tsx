import type { Metadata } from "next";
import { AyiinAppIcon, AyiinLockup, AyiinSymbol, AyiinWordmark, LENS_PATH, SYMBOL_PATH } from "@/components/brand/logo";
import { Eyebrow, SignalDot } from "@/components/ui/signal";
import { Icon } from "@/components/ui/icon";
import { ProductImage } from "@/components/product/product-image";
import { productBySlug } from "@/lib/catalog/products";

export const metadata: Metadata = {
  title: "Brand",
  description: "The Ayiin identity: the Aperture symbol, custom wordmark, colour, typography and the Intelligent Commerce language.",
};

const COLORS = [
  { name: "Porcelain", hex: "#F7F7F2", role: "Primary surface — the room everything sits in", share: 60, ink: true },
  { name: "Pure White", hex: "#FFFFFF", role: "Cards, product stages, inputs", share: 25, ink: true },
  { name: "Deep Ink", hex: "#0A0B0D", role: "Type, primary actions, business mode", share: 7, ink: false },
  { name: "Graphite", hex: "#202328", role: "Dark surfaces and panels", share: 3, ink: false },
  { name: "Signal Lime", hex: "#C8FF3D", role: "Live data, verified deals, selected states", share: 3, ink: true },
  { name: "Electric Blue", hex: "#5967FF", role: "Business signals, focus, information", share: 2, ink: true },
  { name: "Soft Gray", hex: "#E8EAE6", role: "Quiet fills, tracks, dividers", share: 0, ink: true },
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
  const runner = productBySlug("stride-runner-2")!;
  return (
    <div>
      {/* Hero */}
      <section className="shell pt-6 lg:pt-10">
        <Eyebrow index="Brand">Intelligent Commerce · Identity system v1.0</Eyebrow>
        <div className="mt-8 grid items-end gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h1 className="display text-[64px] sm:text-[112px]">The Aperture.</h1>
            <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-2">
              A round-shouldered gateway whose opening forms a negative-space <em>A</em>. The opening is a vesica — the meeting of two arcs, buyer and seller, converging on one point. A lens bridges the walls: the eye that discovers, and the connection that closes the deal.
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {["Discovery", "Connection", "Commerce", "Choice"].map((w) => (
                <span key={w} className="chip">
                  <span className="h-1.5 w-1.5 rounded-full bg-lime shadow-[0_0_0_1px_#0A0B0D]" /> {w}
                </span>
              ))}
            </div>
          </div>
          <div className="panel-ink relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[36px]">
            <div aria-hidden className="grid-texture-dark absolute inset-0" />
            <AyiinSymbol tone="porcelain" lens="lime" tight className="relative h-[52%]" title="Ayiin symbol" />
          </div>
        </div>
      </section>

      {/* Construction */}
      <section className="shell mt-24">
        <Eyebrow index="01">Construction</Eyebrow>
        <div className="mt-6 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="grid place-items-center rounded-[32px] bg-white p-8 shadow-[var(--shadow-hair)]">
            <svg viewBox="-40 -10 144 84" className="w-full max-w-[560px]" role="img" aria-label="Construction of the Ayiin symbol from two intersecting arcs and a lens">
              <defs>
                <clipPath id="c-clip">
                  <rect x="-40" y="-10" width="144" height="70" />
                </clipPath>
              </defs>
              <g stroke="#5967FF" strokeWidth="0.25" fill="none" opacity="0.7">
                <line x1="-40" x2="104" y1="60" y2="60" />
                <line x1="32" x2="32" y1="-10" y2="74" strokeDasharray="1 1" />
                <circle cx="32" cy="32" r="26" strokeDasharray="1 1" />
                <g clipPath="url(#c-clip)">
                  <circle cx="106.67" cy="60" r="86.67" />
                  <circle cx="-42.67" cy="60" r="86.67" />
                </g>
              </g>
              <path fill="#0A0B0D" fillOpacity="0.9" fillRule="evenodd" d={SYMBOL_PATH} />
              <path fill="#C8FF3D" d={LENS_PATH} />
              <g fill="#5967FF">
                <circle cx="32" cy="16" r="0.9" />
                <circle cx="20" cy="60" r="0.9" />
                <circle cx="44" cy="60" r="0.9" />
              </g>
              <g stroke="#62666E" strokeWidth="0.2">
                <line x1="33" y1="16" x2="64" y2="12" />
                <line x1="42.5" y1="42" x2="64" y2="42" />
              </g>
              <g fontFamily="var(--font-geist-mono)" fontSize="2.4" fill="#62666E">
                <text x="65" y="12.8">apex · two arcs converge</text>
                <text x="65" y="42.8">lens · the connection</text>
                <text x="-38" y="66">baseline</text>
                <text x="60" y="66">r = 86.67 · span 24</text>
              </g>
            </svg>
          </div>
          <ul className="grid content-start gap-3">
            {[
              ["Two arcs", "The opening is the intersection of two circles (r 86.67) — buyer and seller. It rises to a single apex: many paths, one destination."],
              ["One gateway", "The outer form is a round-shouldered arch — an aperture, an opening, a door into the marketplace. Solid, calm, unmistakable at 16px."],
              ["The lens", "A vesica bridges the two walls exactly at their inner edges. It reads as an eye and as a crossbar, completing the A without drawing it."],
              ["Signal", "On dark surfaces the lens carries Signal Lime — the same colour Ayiin uses for live, verified information everywhere else."],
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
        <h2 className="display mt-4 text-[44px] sm:text-[64px]">Eight marks, one idea.</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label="1 · Symbol">
            <AyiinSymbol tone="ink" lens="ink" tight className="h-28" title="Symbol" />
          </Tile>
          <Tile label="2 · Wordmark" className="lg:col-span-2">
            <AyiinWordmark tone="ink" className="h-20" />
          </Tile>
          <Tile label="3 · Horizontal lockup">
            <AyiinLockup tone="ink" lens="ink" className="h-10" />
          </Tile>
          <Tile label="4 · Compact icon" dark>
            <div className="flex items-end gap-4">
              <AyiinAppIcon className="h-24 w-24 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]" title="App icon, ink" />
              <AyiinAppIcon variant="lime" className="h-16 w-16" title="App icon, lime" />
            </div>
          </Tile>
          <Tile label="5 · Favicon · 48 / 32 / 16">
            <div className="flex items-end gap-5">
              <AyiinAppIcon className="h-12 w-12" />
              <AyiinAppIcon className="h-8 w-8" />
              <AyiinAppIcon className="h-4 w-4" />
            </div>
          </Tile>
          <Tile label="6 · Monochrome">
            <div className="flex items-center gap-8">
              <AyiinSymbol tone="ink" lens="ink" tight className="h-20" />
              <div className="rounded-2xl bg-ink p-4">
                <AyiinSymbol tone="porcelain" lens="porcelain" tight className="h-12" />
              </div>
            </div>
          </Tile>
          <Tile label="7 · Light version — for dark surfaces" dark>
            <AyiinLockup tone="porcelain" lens="lime" className="h-10" />
          </Tile>
          <Tile label="8 · Dark version — for light surfaces" className="lg:col-span-2">
            <div className="flex flex-wrap items-center justify-center gap-10">
              <AyiinLockup tone="ink" lens="ink" className="h-12" />
              <AyiinLockup tone="ink" lens="blue" className="h-12" />
            </div>
          </Tile>
          <Tile label="Clear space = lens height × 2 · Minimum 16px">
            <div className="relative p-6 outline-1 outline-dashed outline-blue/60">
              <AyiinSymbol tone="ink" lens="ink" tight className="h-16" />
            </div>
          </Tile>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
          {["ayiin-symbol-ink.svg", "ayiin-symbol-porcelain.svg", "ayiin-wordmark-ink.svg", "ayiin-lockup-ink.svg", "ayiin-lockup-porcelain.svg", "ayiin-app-icon-ink.svg"].map((f) => (
            <a key={f} href={`/brand/${f}`} download className="chip">
              <Icon name="upload" size={13} className="rotate-180" /> {f}
            </a>
          ))}
        </div>
      </section>

      {/* Wordmark */}
      <section className="shell mt-24 grid gap-8 lg:grid-cols-2">
        <div>
          <Eyebrow index="03">Wordmark</Eyebrow>
          <h2 className="display mt-4 text-[44px] sm:text-[64px]">Two i&apos;s, one lens.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-ink-2">
            Drawn from scratch on a 100-unit x-height with a single 19-unit stroke. The two i&apos;s — two people, two sides of every trade — share one tittle: the same lens as the symbol. The y is two converging paths. Nothing is typed from a font.
          </p>
        </div>
        <div className="panel-ink flex items-center justify-center rounded-[32px] p-10 sm:p-14">
          <div className="w-full max-w-[520px]">
            <AyiinWordmark tone="porcelain" tittle="lime" className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* Color */}
      <section className="shell mt-24">
        <Eyebrow index="04">Colour</Eyebrow>
        <h2 className="display mt-4 text-[44px] sm:text-[64px]">Mostly light. Precisely loud.</h2>
        <p className="mt-4 max-w-xl text-[16px] text-mute">Signal Lime and Electric Blue are signals, not decoration. The system stays elegant with them removed.</p>
        <div className="mt-8 flex h-4 overflow-hidden rounded-full shadow-[var(--shadow-hair)]" aria-label="Usage ratio: 60% porcelain, 25% white, 10% ink and graphite, 5% accents">
          {COLORS.filter((c) => c.share).map((c) => (
            <span key={c.name} style={{ background: c.hex, width: `${c.share}%` }} title={`${c.name} ${c.share}%`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between font-mono text-[11px] text-mute">
          <span>60% porcelain</span>
          <span>25% white</span>
          <span>10% ink · 5% signal</span>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map((c) => (
            <div key={c.name} className="overflow-hidden rounded-[22px] bg-white shadow-[var(--shadow-hair)]">
              <div className="flex h-32 items-end p-4" style={{ background: c.hex, color: c.ink ? "#0A0B0D" : "#F7F7F2" }}>
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
            <p className="mt-4 text-[13.5px] text-mute">A ringed lime point marks anything live and verified: stock, delivery, deals.</p>
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
        <div className="grid gap-8 rounded-[36px] bg-lime p-8 sm:p-12 lg:grid-cols-2">
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
