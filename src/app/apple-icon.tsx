import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BRAND_COLORS } from "@/lib/brand-colors";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const mark = await readFile(join(process.cwd(), "public/brand/ayiin-mark.svg"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: BRAND_COLORS.graphite }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${mark.toString("base64")}`} width={80} height={112} alt="" />
      </div>
    ),
    size,
  );
}
