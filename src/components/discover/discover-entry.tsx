import Link from "next/link";
import { productBySlug } from "@/lib/catalog/products";
import { EVENING } from "@/lib/discover/evening";
import { photoFullUrl, productPhoto } from "@/lib/images";
import { Icon } from "@/components/ui/icon";

/**
 * The home page's door into Discover Mode — an editorial panel, clearly optional.
 * Its photograph is the scene's opening frame, graded the same way.
 */
export function DiscoverEntry() {
  const first = EVENING.chapters[0];
  const product = productBySlug(first.slug);
  const photo = product ? productPhoto(product, first.variant, first.view) : undefined;
  const count = new Set([...EVENING.chapters.map((c) => c.slug), ...EVENING.look.map((l) => l.slug)]).size;

  return (
    <section aria-labelledby="discover-entry" className="relative mx-3 mt-24 overflow-hidden rounded-[36px] bg-[#070d1d] lg:mt-32">
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoFullUrl(photo, 1600)}
          srcSet={[960, 1600, 2400].map((w) => `${photoFullUrl(photo, w)} ${w}w`).join(", ")}
          sizes="100vw"
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover [filter:saturate(0.88)_contrast(1.06)_brightness(0.72)_sepia(0.12)]"
          style={{ objectPosition: `${first.hotspot.x * 100}% ${first.hotspot.y * 100}%` }}
        />
      )}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(90deg,rgb(7_13_29/0.92)_0%,rgb(7_13_29/0.6)_45%,rgb(7_13_29/0.15)_100%)]" />
      <div className="relative flex min-h-[520px] flex-col justify-end p-7 sm:p-10 lg:min-h-[600px] lg:p-14 short:min-h-[clamp(420px,calc(100vh-120px),600px)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#ffa624]">Discover · New</p>
        <h2 id="discover-entry" className="display mt-4 text-[clamp(48px,7vw,104px)] leading-[0.92] text-[#f4f6fa]">
          Don’t search.
          <br />
          Explore.
        </h2>
        <p className="mt-5 max-w-md text-[16px] leading-relaxed text-[#c7d0e3]">
          Step into {EVENING.title.replace("The ", "the ")} — an apartment at dusk where everything you see is real, and {count} of those things are yours to shop.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/discover" className="btn btn-brand btn-lg">
            Enter Discover <Icon name="arrowRight" size={18} />
          </Link>
          <span className="text-[13px] text-[#a3b0cc]">Optional — the shop is always one click away.</span>
        </div>
      </div>
    </section>
  );
}
