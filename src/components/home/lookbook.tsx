import Link from "next/link";
import { clsx } from "clsx";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Price } from "@/components/ui/money";
import { Icon } from "@/components/ui/icon";

/**
 * Editorial lookbook: every product photographed in the same window-lit room.
 * Lays out 3–5 scenes: one large scene, with the rest sharing the other half.
 * Inside a `.fold` the two rows share the fold height, so the whole lookbook sits on one laptop screen.
 */
export function Lookbook({ index = "03", items }: { index?: string; items: Product[] }) {
  const rest = items.length - 1;
  return (
    <>
      <SectionHeader
        index={index}
        kicker="Seen in context"
        title="Shop the scene."
        description="Every product is photographed on the same stage in the same window light, so the colour you see is the colour that arrives."
        action={{ href: "/search", label: "Browse everything" }}
      />
      <div className="fold-body mt-8 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[300px] lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(220px,1fr))] lg:gap-4">
        {items.map((p, n) => {
          const big = n === 0;
          return (
            <Reveal
              key={p.id}
              delay={n * 70}
              className={clsx(big && "col-span-2 row-span-2", !big && rest === 2 && "lg:col-span-2", !big && rest === 3 && n === 3 && "col-span-2")}
            >
              <Link href={`/p/${p.slug}`} className="group relative block h-full overflow-hidden rounded-surface" aria-label={`${p.name} — shop the scene`}>
                <ProductImage
                  product={p}
                  view="scene"
                  sizes={big ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
                  className="absolute inset-0 transition-transform duration-[1400ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <span
                  className={clsx(
                    "absolute bottom-3 left-3 right-3 flex items-center gap-3 rounded-surface bg-white/88 p-2.5 pr-3.5 shadow-[var(--shadow-hair)] backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1",
                    big ? "sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[380px]" : "",
                  )}
                >
                  <ProductImage product={p} sizes="48px" className="hidden h-11 w-11 shrink-0 rounded-control sm:block" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-support font-medium">{p.name}</span>
                    <span className="mt-0.5 flex items-center gap-2 text-meta text-ink-2">
                      <Price usd={p.price} size="sm" />
                      <span className="text-mute">· {p.brand}</span>
                    </span>
                  </span>
                  <Icon name="arrowUpRight" size={16} className="shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
