import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, productBySlug } from "@/lib/catalog/products";
import { EVENING } from "@/lib/discover/evening";
import { DiscoverExperience } from "@/components/discover/discover-experience";

export const metadata: Metadata = {
  title: "Discover · The Ayiin Evening",
  description: "Don't search. Explore. Step into an evening curated by Ayiin, where everything you see is real and shoppable.",
};

/** Products the scene's look can swap between: everything a shopper can buy. */
const SHOPPER_CATEGORIES = new Set(["audio-tech", "home-living", "kitchen", "fashion", "beauty", "office"]);

export default function DiscoverPage() {
  const chapters = EVENING.chapters.flatMap((c) => {
    const product = productBySlug(c.slug);
    return product ? [{ ...c, product }] : [];
  });
  const look = EVENING.look.flatMap((l) => {
    const product = productBySlug(l.slug);
    return product ? [{ product, variant: l.variant, role: l.role }] : [];
  });
  if (!chapters.length) notFound();

  return (
    <DiscoverExperience
      title={EVENING.title}
      kicker={EVENING.kicker}
      chapters={chapters}
      look={look}
      catalog={products.filter((p) => SHOPPER_CATEGORIES.has(p.category))}
    />
  );
}
