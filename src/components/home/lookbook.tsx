import Link from "next/link";
import { clsx } from "clsx";
import type { Product } from "@/lib/types";
import { ProductImage } from "@/components/product/product-image";
import { SectionHeader } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { Icon } from "@/components/ui/icon";

/**
 * Editorial lookbook: every product photographed in the same window-lit room.
 * Lays out 3–5 scenes: one large scene, with the rest sharing the other half.
 * Inside a `.fold` the two rows share the fold height, so the whole lookbook sits on one laptop screen.
 */
export function Lookbook({ items }: { items: Product[] }) {
  const rest = items.length - 1;
  return (
    <>
      <SectionHeader
        title="Shop the scene."
        action={{ href: "/search", label: "Browse everything" }}
      />
      <div className="fold-body mt-8 grid auto-rows-[220px] grid-cols-2 gap-3 sm:auto-rows-[300px] lg:grid-cols-4 lg:grid-rows-[repeat(2,minmax(150px,1fr))] lg:gap-4">
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
                  aria-hidden
                  className="absolute bottom-3.5 right-3.5 sm:bottom-4 sm:right-4 grid h-8 w-8 sm:h-9 sm:w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-md border border-white/25 shadow-[0_2px_8px_rgba(0,0,0,0.12)] transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:scale-110 group-hover:bg-black/50 group-hover:border-white/40"
                >
                  <Icon
                    name="arrowUpRight"
                    size={16}
                    className="transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
