import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ayiin",
    short_name: "Ayiin",
    description: "The smarter way to shop — and to buy for business.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F7F2",
    theme_color: "#0A0B0D",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
