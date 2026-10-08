import Link from "next/link";
import { clsx } from "clsx";
import type { Product, Category } from "@/lib/types";
import { chapters, focalPosition, picAttrs, productMedia, tagline, type PdpPhoto } from "@/lib/pdp";
import { deliveryLabel, priceInsight } from "@/lib/commerce";
import { Stars } from "@/components/product/rating";
import { Money, Price } from "@/components/ui/money";
import { PriceHistory } from "@/components/product/price-history";

/** A photograph filling its box, framed on its subject. */
export function Pic({
  photo,
  className,
  widths = [640, 1000, 1600],
  sizes = "100vw",
  priority,
  alt = "",
  ratio,
}: {
  photo: PdpPhoto;
  className?: string;
  widths?: number[];
  sizes?: string;
  priority?: boolean;
  alt?: string;
  ratio?: number;
}) {
  const { src, srcSet } = picAttrs(photo, widths, { ratio });
  return (
    // eslint-disable-next-line @next/next/no-img-element -- CDN-sized photograph with its own srcset
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      draggable={false}
      className={clsx("absolute inset-0 h-full w-full object-cover", className)}
      style={{ objectPosition: focalPosition(photo) }}
    />
  );
}

export function Credit({ photo, className }: { photo: PdpPhoto; className?: string }) {
  return (
    <p className={clsx("text-meta text-mute", className)}>
      Photo{" "}
      <a href={photo.profile} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
        @{photo.by}
      </a>{" "}
      on{" "}
      <a href="https://unsplash.com/?utm_source=ayiin&utm_medium=referral" target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
        Unsplash
      </a>
    </p>
  );
}

/* ── 1 · Overview ─────────────────────────────────────────────── */

export function PdpHero({ product: p, category: c }: { product: Product; category: Category }) {
  const photo = productMedia(p)[0];
  const insight = priceInsight(p);
  return (
    <section id="overview" className="scroll-mt-16" style={{ backgroundColor: c.tint }}>
      <div className="shell pb-10 pt-12 text-center sm:pt-16 lg:pt-20">
        <Link
          href={`/c/${c.slug}`}
          className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3.5 py-1.5 text-support font-medium text-ink-2 transition-colors hover:bg-white hover:text-ink"
        >
          {c.name}
          <span aria-hidden className="text-mute">·</span>
          <span className="text-mute">{p.subcategory}</span>
        </Link>
        <h1 className="display mx-auto mt-6 max-w-5xl text-balance text-[2.5rem] !leading-[0.98] sm:text-display-sm lg:text-[4.5rem]">{p.name}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-emphasis leading-snug text-ink-2">{tagline(p)}</p>

        <a href="#reviews" className="mt-5 inline-flex items-center gap-2 text-support text-ink-2 hover:text-ink">
          <Stars value={p.rating} size={15} />
          <span className="num font-medium text-ink">{p.rating.toFixed(1)}</span>
          <span>{p.reviewCount.toLocaleString("en-US")} ratings</span>
        </a>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
          <div className="flex items-baseline gap-3">
            <Price usd={p.price} size="lg" strike={p.compareAt} />
            {insight.verifiedDeal && <span className="text-support font-medium text-brand-deep">{insight.label}</span>}
          </div>
          <div className="flex items-center gap-3">
            <a href="#buy" className="inline-flex h-12 items-center rounded-full bg-ink px-7 text-body font-medium text-white transition-colors duration-300 hover:bg-graphite-2">
              {p.stock > 0 ? "Buy" : "See details"}
            </a>
            <a href="#compare" className="inline-flex h-12 items-center px-2 text-body font-medium text-ink underline-offset-4 hover:underline">
              Compare
            </a>
          </div>
        </div>
      </div>

      {photo && (
        <div className="shell pb-3">
          <figure className="relative aspect-square overflow-hidden rounded-[28px] bg-white/60 sm:aspect-[16/9] lg:aspect-[2/1]">
            <Pic photo={photo} priority sizes="(min-width: 1520px) 1440px, 96vw" widths={[800, 1280, 1920]} alt={`${p.name}`} />
          </figure>
          <Credit photo={photo} className="py-3 text-right" />
        </div>
      )}
    </section>
  );
}

/* ── 2 · Highlights ───────────────────────────────────────────── */

export function Highlights({ product: p }: { product: Product }) {
  const media = productMedia(p);
  const at = (i: number) => media[(i + 1) % media.length];
  const tile = "relative flex flex-col overflow-hidden rounded-[28px]";
  const head = "display p-7 text-heading !leading-[1.02] tracking-[-0.03em] sm:p-9 sm:text-display-xs";
  const photoBox = "relative m-2 mt-0 min-h-[220px] flex-1 overflow-hidden rounded-[22px] bg-mist";
  const h = p.highlights;
  return (
    <section id="highlights" className="shell scroll-mt-20 pt-20 sm:pt-28">
      <h2 className="display text-display-sm sm:text-display-md">Get the highlights.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3 md:auto-rows-[480px]">
        <div className={clsx(tile, "bg-white md:col-span-2")}>
          <p className={head}>{h[0]}</p>
          <div className={photoBox}><Pic photo={at(0)} sizes="(min-width: 768px) 66vw, 96vw" /></div>
        </div>

        <div className={clsx(tile, "justify-between bg-white p-7 sm:p-9")}>
          <p className="text-support font-medium text-ink-2">Rated by owners</p>
          <div>
            <p className="display text-[6rem] !leading-[0.9] tracking-[-0.05em]">{p.rating.toFixed(1)}</p>
            <Stars value={p.rating} size={18} className="mt-4" />
            <p className="mt-3 text-support text-ink-2">{p.reviewCount.toLocaleString("en-US")} ratings</p>
            <a href="#reviews" className="mt-5 inline-block text-support font-medium text-brand-deep hover:underline">Read the reviews</a>
          </div>
        </div>

        {h[1] && (
          <div className={clsx(tile, "bg-white")}>
            <p className={head}>{h[1]}</p>
            <div className={photoBox}><Pic photo={at(1)} sizes="(min-width: 768px) 33vw, 96vw" /></div>
          </div>
        )}
        {h[2] && (
          <div className={clsx(tile, "bg-white")}>
            <p className={head}>{h[2]}</p>
            <div className={photoBox}><Pic photo={at(2)} sizes="(min-width: 768px) 33vw, 96vw" /></div>
          </div>
        )}
        <div className={clsx(tile, "justify-between bg-ink p-7 text-white sm:p-9")}>
          <p className="text-support font-medium text-white/60">Delivery and returns</p>
          <div>
            <p className="display text-heading !leading-[1.02] tracking-[-0.03em] sm:text-display-xs">
              Arrives {deliveryLabel(p)}.
            </p>
            <p className="mt-4 text-body text-white/70">
              {p.shipping === 0 ? "Free delivery." : "Delivery from "}
              {p.shipping === 0 ? " " : <Money usd={p.shipping} className="text-white" />}
              {p.returns.free ? ` ${p.returns.days}-day free returns.` : ` ${p.returns.days}-day returns.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 3 · Closer look ──────────────────────────────────────────── */

export function CloserLook({ product: p }: { product: Product }) {
  const media = productMedia(p);
  const list = chapters(p).slice(0, 3);
  return (
    <section id="details" className="scroll-mt-20 pt-20 sm:pt-28">
      <div className="shell">
        <h2 className="display text-display-sm sm:text-display-md">Take a closer look.</h2>
      </div>
      <div className="mt-10 space-y-4">
        {list.map((c, i) => {
          const photo = media[(i + 2) % media.length];
          const flip = i % 2 === 1;
          const dark = i === 1;
          return (
            <div key={c.title} className="shell">
              <div className={clsx("grid overflow-hidden rounded-[28px] md:grid-cols-2", dark ? "bg-ink text-white" : "bg-white")}>
                <div className={clsx("flex flex-col justify-center p-8 sm:p-12 lg:p-16", flip && "md:order-2")}>
                  <h3 className="display text-balance text-heading !leading-[1.02] tracking-[-0.03em] sm:text-display-sm">{c.title}</h3>
                  <p className={clsx("mt-5 max-w-md text-emphasis leading-snug", dark ? "text-white/70" : "text-ink-2")}>{c.body}</p>
                </div>
                <div className={clsx("relative min-h-[320px] md:min-h-[520px]", flip && "md:order-1")}>
                  <Pic photo={photo} sizes="(min-width: 768px) 50vw, 100vw" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="shell mt-4 grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col justify-between rounded-[28px] bg-white p-8 sm:p-12">
          <p className="text-support font-medium text-ink-2">Best for</p>
          <p className="display mt-10 text-balance text-heading !leading-[1.05] tracking-[-0.03em] sm:text-display-sm">{p.brief.bestFor}.</p>
        </div>
        <div className="rounded-[28px] bg-mist p-8 sm:p-12">
          <p className="text-support font-medium text-ink-2">Worth knowing before you buy</p>
          <ul className="mt-6 space-y-3 text-emphasis leading-snug text-ink-2">
            {p.brief.cons.map((x) => (<li key={x}>{x}</li>))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── 6 · Tech specs ───────────────────────────────────────────── */

export function TechSpecs({ product: p }: { product: Product }) {
  const insight = priceInsight(p);
  const entries = [...Object.entries(p.specs), ["SKU", p.b2b.sku] as [string, string]];
  return (
    <section id="specs" className="shell scroll-mt-20 pt-20 sm:pt-28">
      <h2 className="display text-display-sm sm:text-display-md">Tech specs.</h2>
      <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <dl className="rounded-[28px] bg-white px-7 py-3 sm:px-10">
          {entries.map(([k, v]) => (
            <div key={k} className="grid gap-1 border-b border-line py-5 last:border-b-0 sm:grid-cols-[200px_1fr] sm:gap-6">
              <dt className="text-support text-mute">{k}</dt>
              <dd className="text-body text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="rounded-[28px] bg-white p-7 sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-body font-medium">Price, last 12 weeks</p>
            <span className={clsx("rounded-full px-3 py-1 text-meta font-medium", insight.verifiedDeal ? "bg-brand" : "bg-mist")}>{insight.label}</span>
          </div>
          <PriceHistory history={p.history} height={140} className="mt-6" />
          <div className="mt-4 flex justify-between text-meta text-mute">
            <span>Low <Money usd={Math.min(...p.history)} /></span>
            <span>Typical <Money usd={Math.round(insight.typical)} /></span>
            <span>High <Money usd={Math.max(...p.history)} /></span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 8 · Compare ──────────────────────────────────────────────── */

export function CompareBlock({ product: p, alts }: { product: Product; alts: { product: Product; label: string; why: string }[] }) {
  if (!alts.length) return null;
  const cols = [{ product: p, label: "This one", why: "" }, ...alts];
  const rows: { label: string; cell: (x: Product) => React.ReactNode }[] = [
    { label: "Price", cell: (x) => <Price usd={x.price} size="md" strike={x.compareAt} /> },
    { label: "Rated", cell: (x) => <span className="num">{x.rating.toFixed(1)} <span className="text-mute">({x.reviewCount.toLocaleString("en-US")})</span></span> },
    { label: "Arrives", cell: (x) => deliveryLabel(x) },
    { label: "Returns", cell: (x) => (x.returns.free ? `${x.returns.days} days, free` : `${x.returns.days} days`) },
    { label: "Best for", cell: (x) => x.brief.bestFor },
  ];
  return (
    <section id="compare" className="shell scroll-mt-20 pt-20 sm:pt-28">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <h2 className="display text-display-sm sm:text-display-md">Compare.</h2>
        <Link href={`/compare?ids=${cols.map((c) => c.product.id).join(",")}`} className="text-body font-medium text-brand-deep hover:underline">
          Open the full comparison
        </Link>
      </div>
      <div className="scroll-x mt-10 rounded-[28px] bg-white">
        <table className="w-full min-w-[760px] table-fixed text-left">
          <thead>
            <tr>
              <th className="w-[140px] p-6" scope="col"><span className="sr-only">Attribute</span></th>
              {cols.map((c) => {
                const photo = productMedia(c.product)[0];
                return (
                  <th key={c.product.id} scope="col" className="p-5 align-top font-normal">
                    <Link href={`/p/${c.product.slug}`} className="group block">
                      {photo && <span className="relative block aspect-[4/3] overflow-hidden rounded-[18px] bg-mist"><Pic photo={photo} widths={[360, 640]} sizes="240px" /></span>}
                      {c.label !== "This one" && <span className="mt-4 inline-flex rounded-full bg-mist px-2.5 py-1 text-meta font-medium">{c.label}</span>}
                      <span className="mt-3 block text-body font-medium leading-snug group-hover:underline">{c.product.name}</span>
                    </Link>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <th scope="row" className="p-6 text-support font-normal text-mute">{r.label}</th>
                {cols.map((c) => (
                  <td key={c.product.id} className="p-5 align-top text-support text-ink">{r.cell(c.product)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
