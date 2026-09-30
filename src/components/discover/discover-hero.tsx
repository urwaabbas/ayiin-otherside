import Link from "next/link";
import { productBySlug } from "@/lib/catalog/products";
import { EVENING } from "@/lib/discover/evening";
import { ProductImage } from "@/components/product/product-image";
import { Icon } from "@/components/ui/icon";

/** Every product you can discover in the scene: chapter products first, then the look. */
export function discoverProducts() {
  const slugs = [...EVENING.chapters.map((c) => c.slug), ...EVENING.look.map((l) => l.slug)];
  return [...new Set(slugs)].flatMap((s) => {
    const p = productBySlug(s);
    return p ? [p] : [];
  });
}

/**
 * The home hero — Discover Mode is the headline feature.
 * Sits over the flashlight wall (whose tiles are the scene's own products); the strip
 * below the call to action previews the evening's moments, each opening Discover.
 */
export function DiscoverHero() {
  const moments = EVENING.chapters.flatMap((c) => {
    const p = productBySlug(c.slug);
    return p ? [{ ...c, product: p }] : [];
  });
  const count = discoverProducts().length;

  return (
    <div className="mx-auto flex max-w-[1180px] flex-col items-center text-center lg:py-[clamp(8px,2.4vh,32px)]">
      <p className="inline-flex animate-fade items-center gap-2 rounded-full bg-[rgb(255_255_255/0.06)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-brand ring-1 ring-[rgb(255_255_255/0.1)]">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" /> New · Discover Mode
      </p>
      <h1 className="display mt-6 text-balance text-[clamp(56px,9vw,136px)] lg:mt-[clamp(12px,2.4vh,24px)] lg:text-[clamp(56px,min(9vw,14.5vh),136px)]">
        <span className="block animate-rise">Don&apos;t search.</span>{" "}
        <span className="block animate-rise [animation-delay:120ms] text-brand-gradient">Explore.</span>
      </h1>
      <p className="mt-6 max-w-[600px] animate-rise text-[17px] leading-relaxed text-ink-2 [animation-delay:220ms] sm:text-[19px] lg:mt-[clamp(12px,2.6vh,26px)] lg:text-[clamp(16px,2.1vh,19px)]">
        Step into {EVENING.title} — an apartment at dusk where everything you see is real, and {count} of those things are yours to shop.
      </p>
      <div className="mt-8 flex animate-rise flex-wrap items-center justify-center gap-3 [animation-delay:300ms] lg:mt-[clamp(14px,3vh,32px)]">
        <Link href="/discover" className="btn btn-brand btn-lg">
          Enter Discover <Icon name="arrowRight" size={18} />
        </Link>
        <Link href="/search" className="btn btn-on-dark btn-lg">
          Shop everything
        </Link>
      </div>

      {/* The evening's moments — a preview of what's inside */}
      <ul aria-label={`Moments in ${EVENING.title}`} className="scroll-x -mx-[var(--gutter)] mt-10 flex w-[calc(100%+2*var(--gutter))] animate-rise gap-2.5 px-[var(--gutter)] [animation-delay:380ms] lg:mt-[clamp(16px,3.6vh,40px)] lg:justify-center">
        {moments.map((m) => (
          <li key={m.id} className="shrink-0">
            <Link
              href="/discover"
              className="group flex w-[136px] items-center gap-2.5 rounded-2xl bg-[rgb(7_13_29/0.55)] p-1.5 pr-3 text-left ring-1 ring-[rgb(255_255_255/0.1)] backdrop-blur transition-colors hover:bg-[rgb(7_13_29/0.8)] hover:ring-[rgb(255_166_36/0.5)]"
            >
              <ProductImage product={m.product} variant={m.variant} sizes="44px" className="h-11 w-11 shrink-0 rounded-xl" />
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.14em] text-brand">{m.time}</span>
                <span className="block truncate text-[12.5px] text-porcelain">{m.title.replace(/^The /, "")}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
