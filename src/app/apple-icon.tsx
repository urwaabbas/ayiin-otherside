import { ImageResponse } from "next/og";
import { LENS_PATH, SYMBOL_PATH } from "@/components/brand/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0B0D" }}>
        <svg width="112" height="116" viewBox="6 6 52 54">
          <path fill="#F7F7F2" fillRule="evenodd" d={SYMBOL_PATH} />
          <path fill="#C8FF3D" d={LENS_PATH} />
        </svg>
      </div>
    ),
    size,
  );
}
