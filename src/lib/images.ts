import type { Product } from "@/lib/types";

/** Studio renders live in /public/products/{slug}/{variant}-{view}.webp */
export type ImageView = "hero" | "angle" | "detail" | "scene";

export const IMAGE_VIEWS: { id: ImageView; label: string }[] = [
  { id: "hero", label: "Front" },
  { id: "angle", label: "Angle" },
  { id: "detail", label: "Detail" },
  { id: "scene", label: "In context" },
];

export function productImageSrc(p: Pick<Product, "slug" | "variants">, variantId?: string, view: ImageView = "hero") {
  const v = p.variants.find((x) => x.id === variantId) ?? p.variants[0];
  return `/products/${p.slug}/${v.id}-${view}.webp`;
}
