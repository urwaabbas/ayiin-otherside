import { BRAND_COLORS } from "@/lib/brand-colors";

/** Relative luminance (WCAG) of a #rrggbb colour, 0–1. */
export function luminance(hex: string) {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Ink or white — whichever reads better on the given fill. */
export function readableOn(hex: string) {
  const l = luminance(hex);
  return (1.05) / (l + 0.05) >= (l + 0.05) / (luminance(BRAND_COLORS.ink) + 0.05) ? BRAND_COLORS.white : BRAND_COLORS.ink;
}
