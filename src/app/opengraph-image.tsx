import { ImageResponse } from "next/og";
import { LENS_PATH, SYMBOL_PATH } from "@/components/brand/logo";

export const alt = "Ayiin — See more. Doubt less.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const G = "#F7F7F2";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0A0B0D", padding: 72 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="58" height="60" viewBox="6 6 52 54">
            <path fill={G} fillRule="evenodd" d={SYMBOL_PATH} />
            <path fill="#C8FF3D" d={LENS_PATH} />
          </svg>
          <div style={{ display: "flex", color: "#9097A0", fontSize: 24, letterSpacing: 4 }}>INTELLIGENT COMMERCE</div>
        </div>
        <svg width="820" height="389" viewBox="0 -40 401 190">
          <circle cx="50" cy="50" r="40.5" fill="none" stroke={G} strokeWidth="19" />
          <rect x="81" y="0" width="19" height="100" fill={G} />
          <path d="M109.77 0H130.23L170.23 100H149.77Z" fill={G} />
          <path d="M189.77 0H210.23L150.23 150H129.77Z" fill={G} />
          <rect x="226.5" y="0" width="19" height="100" fill={G} />
          <rect x="264.5" y="0" width="19" height="100" fill={G} />
          <path d="M226.5 -28Q255 -46 283.5 -28Q255 -10 226.5 -28Z" fill="#C8FF3D" />
          <rect x="300.5" y="0" width="19" height="100" fill={G} />
          <path d="M310 50A40.5 40.5 0 0 1 391 50V100" fill="none" stroke={G} strokeWidth="19" />
        </svg>
      </div>
    ),
    size,
  );
}
