"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { CategoryIcon } from "@/components/ui/category-icon";
import { Eyebrow } from "@/components/ui/signal";
import { categories } from "@/lib/catalog/categories";
import { productsByCategory } from "@/lib/catalog/products";
import { PRODUCT_PHOTOS } from "@/lib/catalog/photos";
import type { ProductPhoto } from "@/lib/catalog/photos";
import { photoFullUrl } from "@/lib/images";

/**
 * The photograph that stands for each department: [product slug, variant, view].
 * Every pick is a landscape original (~3:2) so it fills the 3:2 tile uncropped.
 */
const DEPARTMENT_PHOTO: Record<string, [string, string, "hero" | "angle" | "scene"]> = {
  "home-living": ["stoneware-bud-vases", "bone", "angle"],
  "audio-tech": ["aurel-anc-over-ear", "graphite", "hero"],
  kitchen: ["pour-gooseneck-kettle", "matte-black", "scene"],
  fashion: ["solstice-sunglasses", "tortoise", "hero"],
  beauty: ["night-recovery-oil", "30", "scene"],
  office: ["kova-keys-low-profile", "graphite", "hero"],
  supplies: ["double-wall-cartons-12x10x8", "kraft", "hero"],
  safety: ["vented-safety-helmet", "red", "hero"],
};

const photoFor = (slug: string): ProductPhoto | undefined => {
  const pick = DEPARTMENT_PHOTO[slug];
  if (!pick) return undefined;
  const [product, variant, view] = pick;
  const views = PRODUCT_PHOTOS[product]?.[variant];
  return views?.[view] ?? views?.hero;
};

/**
 * Department directory — all eight departments as identical cards, four across in two rows.
 * Images keep their whole subject: a fixed 3:2 tile filled by landscape originals of the same shape.
 */
export function DiscoveryTiles() {
  return (
    <section aria-label="Shop by department" className="scroll-mt-[var(--nav-h)] lg:py-6">
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end lg:mb-7">
        <div>
          <Eyebrow index="DISCOVERY">Departments</Eyebrow>
          <h2 className="display mt-3 text-display-sm text-ink lg:text-display-md">
            Shop by department.
          </h2>
          <p className="mt-3 max-w-xl text-body text-ink-2">
            Eight departments, from lounge chairs to safety wear — every listing from a verified seller, with an exact delivery date.
          </p>
        </div>
        <Link
          href="/search"
          className="link-underline flex shrink-0 items-center gap-1.5 self-start text-support font-medium text-brand-deep sm:self-auto"
        >
          <span>Browse all products</span>
          <Icon name="arrowRight" size={14} />
        </Link>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
        {categories.map((c) => {
          const photo = photoFor(c.slug);
          const count = productsByCategory(c.slug).length;
          return (
            <li key={c.slug}>
              <Link
                href={`/c/${c.slug}`}
                className="group flex h-full flex-col border-b border-line pb-3 transition-colors duration-300 hover:border-line-hover"
              >
                {/* 3:2 frame for 3:2 originals: the whole photograph shows (16:9 ones lose only empty side margin) */}
                <span
                  className="relative block aspect-[3/2] w-full overflow-hidden rounded-surface bg-mist"
                  style={photo ? { backgroundColor: photo.color } : undefined}
                >
                  {photo && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={photoFullUrl(photo, 720, 80)}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                    />
                  )}
                </span>
                <span className="flex shrink-0 items-end justify-between gap-3 px-0.5 pt-3">
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-mute">
                      <CategoryIcon slug={c.slug} size={15} />
                      <span className="font-mono text-[11px] uppercase tracking-[0.14em]">
                        {count} {count === 1 ? "product" : "products"}
                      </span>
                    </span>
                    <span className="display mt-1.5 block truncate text-emphasis leading-tight tracking-[-0.02em] text-ink lg:text-section">
                      {c.name}
                    </span>
                  </span>
                  <Icon
                    name="arrowRight"
                    size={16}
                    className="mb-1 shrink-0 text-mute transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-ink"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
