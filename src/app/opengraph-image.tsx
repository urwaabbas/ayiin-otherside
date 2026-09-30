import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/brand-colors";

export const alt = "Ayiin — See more. Doubt less.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // The supplied logo artwork, light-lettering version for dark surfaces (2.29:1).
  const logo = await readFile(join(process.cwd(), "public/brand/ayiin-logo-on-dark.svg"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: BRAND_COLORS.graphite, padding: 72 }}>
        <div style={{ display: "flex", color: BRAND_COLORS.muteDark, fontSize: 24, letterSpacing: 4 }}>INTELLIGENT COMMERCE</div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${logo.toString("base64")}`} width={687} height={300} alt="" />
      </div>
    ),
    size,
  );
}
