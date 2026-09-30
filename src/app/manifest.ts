import type { MetadataRoute } from "next";
import { BRAND_COLORS } from "@/lib/brand-colors";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ayiin",
    short_name: "Ayiin",
    description: "The smarter way to shop — and to buy for business.",
    start_url: "/",
    display: "standalone",
    background_color: BRAND_COLORS.porcelain,
    theme_color: BRAND_COLORS.ink,
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
