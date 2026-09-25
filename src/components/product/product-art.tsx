import { useId, type ReactNode } from "react";
import type { ArtKind } from "@/lib/types";

/**
 * Ayiin Studio renders.
 * Every product is drawn in one consistent art direction: soft top-left key light,
 * porcelain studio sweep, a single contact shadow. Consistency is the point —
 * it removes the "bad product photography" problem entirely.
 */

export type ArtView = "hero" | "angle" | "detail" | "context" | "pill";

type Props = {
  kind: ArtKind;
  color: string;
  accent?: string;
  tint?: string;
  view?: ArtView;
  backdrop?: boolean;
  className?: string;
  title?: string;
};

/* ─── colour math ─── */
function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex([r, g, b]: number[]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
export function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}
const lighten = (c: string, t: number) => mix(c, "#ffffff", t);
const darken = (c: string, t: number) => mix(c, "#0a0b0d", t);
function luminance(hex: string) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

type Ctx = {
  id: (name: string) => string;
  url: (name: string) => string;
  c: string;
  a: string;
  light: boolean;
};

function Defs({ ctx, tint }: { ctx: Ctx; tint: string }) {
  const { id, c, a } = ctx;
  return (
    <defs>
      <radialGradient id={id("studio")} cx="42%" cy="30%" r="80%">
        <stop offset="0" stopColor={lighten(tint, 0.65)} />
        <stop offset="0.55" stopColor={tint} />
        <stop offset="1" stopColor={darken(tint, 0.06)} />
      </radialGradient>
      <radialGradient id={id("shadow")} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#0a0b0d" stopOpacity="0.32" />
        <stop offset="0.55" stopColor="#0a0b0d" stopOpacity="0.1" />
        <stop offset="1" stopColor="#0a0b0d" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={id("body")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={lighten(c, 0.22)} />
        <stop offset="0.5" stopColor={c} />
        <stop offset="1" stopColor={darken(c, 0.22)} />
      </linearGradient>
      <linearGradient id={id("bodyH")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={darken(c, 0.14)} />
        <stop offset="0.28" stopColor={lighten(c, 0.2)} />
        <stop offset="0.62" stopColor={c} />
        <stop offset="1" stopColor={darken(c, 0.26)} />
      </linearGradient>
      <linearGradient id={id("bodyV")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={lighten(c, 0.2)} />
        <stop offset="1" stopColor={darken(c, 0.2)} />
      </linearGradient>
      <linearGradient id={id("dark")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={darken(c, 0.35)} />
        <stop offset="1" stopColor={darken(c, 0.6)} />
      </linearGradient>
      <linearGradient id={id("accent")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={lighten(a, 0.2)} />
        <stop offset="1" stopColor={darken(a, 0.18)} />
      </linearGradient>
      <linearGradient id={id("accentH")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={darken(a, 0.15)} />
        <stop offset="0.3" stopColor={lighten(a, 0.2)} />
        <stop offset="1" stopColor={darken(a, 0.25)} />
      </linearGradient>
      <linearGradient id={id("gloss")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.65" />
        <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={id("glass")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="0.2" stopColor="#ffffff" stopOpacity="0.18" />
        <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.05" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
      </linearGradient>
      <linearGradient id={id("screen")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#1b1e24" />
        <stop offset="0.55" stopColor="#262a35" />
        <stop offset="1" stopColor="#0f1115" />
      </linearGradient>
      <linearGradient id={id("wall")} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#5967FF" />
        <stop offset="0.55" stopColor="#8B94FF" />
        <stop offset="1" stopColor="#C8FF3D" />
      </linearGradient>
      <linearGradient id={id("wood")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9C7148" />
        <stop offset="0.5" stopColor="#C49A6C" />
        <stop offset="1" stopColor="#80593A" />
      </linearGradient>
      <linearGradient id={id("steel")} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8E939B" />
        <stop offset="0.35" stopColor="#E9EBEE" />
        <stop offset="0.7" stopColor="#B7BCC3" />
        <stop offset="1" stopColor="#7C818A" />
      </linearGradient>
      <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
        <stop offset="0" stopColor="#FFF4D6" stopOpacity="0.95" />
        <stop offset="1" stopColor="#FFF4D6" stopOpacity="0" />
      </radialGradient>
      <pattern id={id("dots")} width="9" height="9" patternUnits="userSpaceOnUse">
        <circle cx="4.5" cy="4.5" r="1.6" fill={darken(c, 0.3)} opacity="0.55" />
      </pattern>
      <pattern id={id("mesh")} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill={c} />
        <path d="M0 0H8M0 0V8" stroke={darken(c, 0.35)} strokeWidth="1.4" />
      </pattern>
      <pattern id={id("speckle")} width="23" height="19" patternUnits="userSpaceOnUse">
        <circle cx="3" cy="4" r="1" fill={darken(c, 0.45)} opacity="0.5" />
        <circle cx="15" cy="11" r="0.8" fill={darken(c, 0.5)} opacity="0.45" />
        <circle cx="9" cy="16" r="0.7" fill={darken(c, 0.4)} opacity="0.4" />
      </pattern>
    </defs>
  );
}

const Shadow = ({ ctx, cx = 200, cy = 322, rx = 120, ry = 16 }: { ctx: Ctx; cx?: number; cy?: number; rx?: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={ctx.url("shadow")} />
);

/* ─── Kinds ─────────────────────────────────────────────────── */

const draw: Record<ArtKind, (ctx: Ctx) => ReactNode> = {
  headphones: (x) => (
    <g>
      <Shadow ctx={x} rx={125} ry={15} cy={318} />
      {/* headband */}
      <path d="M112 232C108 118 292 118 288 232" fill="none" stroke={darken(x.c, 0.3)} strokeWidth="24" strokeLinecap="round" />
      <path d="M112 232C108 118 292 118 288 232" fill="none" stroke={x.url("bodyH")} strokeWidth="18" strokeLinecap="round" />
      <path d="M130 170C150 128 250 128 270 170" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" strokeLinecap="round" />
      {/* yokes */}
      <rect x="104" y="204" width="16" height="44" rx="8" fill={x.url("steel")} />
      <rect x="280" y="204" width="16" height="44" rx="8" fill={x.url("steel")} />
      {/* cups */}
      <rect x="78" y="220" width="74" height="104" rx="34" fill={x.url("body")} />
      <rect x="248" y="220" width="74" height="104" rx="34" fill={x.url("body")} />
      <rect x="128" y="228" width="26" height="88" rx="13" fill={x.url("dark")} />
      <rect x="246" y="228" width="26" height="88" rx="13" fill={x.url("dark")} />
      <rect x="86" y="228" width="26" height="60" rx="13" fill="#fff" opacity="0.22" />
      <rect x="256" y="228" width="22" height="60" rx="11" fill="#fff" opacity="0.18" />
      <circle cx="304" cy="300" r="3" fill={x.a} />
    </g>
  ),

  earbuds: (x) => (
    <g>
      <Shadow ctx={x} rx={110} ry={13} cy={300} />
      <rect x="112" y="160" width="176" height="136" rx="56" fill={x.url("body")} />
      <path d="M112 210H288" stroke={darken(x.c, 0.25)} strokeWidth="2" />
      <rect x="126" y="170" width="120" height="30" rx="15" fill="#fff" opacity="0.25" />
      <circle cx="200" cy="244" r="4" fill={x.light ? "#0a0b0d" : "#C8FF3D"} opacity="0.8" />
      {/* buds */}
      <g transform="translate(96 250) rotate(-18)">
        <ellipse cx="0" cy="0" rx="30" ry="26" fill={x.url("body")} />
        <rect x="-9" y="10" width="18" height="52" rx="9" fill={x.url("bodyV")} />
        <ellipse cx="-10" cy="-8" rx="10" ry="7" fill="#fff" opacity="0.35" />
        <ellipse cx="18" cy="-6" rx="10" ry="12" fill={x.url("dark")} />
      </g>
      <g transform="translate(314 256) rotate(22)">
        <ellipse cx="0" cy="0" rx="30" ry="26" fill={x.url("body")} />
        <rect x="-9" y="10" width="18" height="52" rx="9" fill={x.url("bodyV")} />
        <ellipse cx="-8" cy="-8" rx="10" ry="7" fill="#fff" opacity="0.35" />
      </g>
    </g>
  ),

  speaker: (x) => (
    <g>
      <Shadow ctx={x} rx={96} ry={14} cy={322} />
      <rect x="128" y="104" width="144" height="214" rx="40" fill={x.url("bodyH")} />
      <rect x="128" y="104" width="144" height="214" rx="40" fill={x.url("dots")} />
      <ellipse cx="200" cy="112" rx="66" ry="14" fill={lighten(x.c, 0.25)} />
      <ellipse cx="200" cy="112" rx="24" ry="5" fill={darken(x.c, 0.2)} />
      <rect x="140" y="130" width="18" height="160" rx="9" fill="#fff" opacity="0.2" />
      <rect x="182" y="286" width="36" height="8" rx="4" fill={darken(x.c, 0.4)} opacity="0.7" />
      <path d="M150 300Q200 316 250 300" stroke={x.url("accent")} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.9" />
    </g>
  ),

  laptop: (x) => (
    <g>
      <Shadow ctx={x} rx={165} ry={14} cy={292} />
      <path d="M96 92Q96 80 108 80H292Q304 80 304 92V246H96Z" fill={x.url("bodyV")} />
      <rect x="106" y="90" width="188" height="150" rx="4" fill={x.url("screen")} />
      <g opacity="0.95">
        <rect x="120" y="104" width="94" height="10" rx="5" fill="#fff" opacity="0.25" />
        <rect x="120" y="124" width="160" height="62" rx="8" fill={x.url("wall")} opacity="0.85" />
        <rect x="120" y="196" width="48" height="30" rx="6" fill="#fff" opacity="0.12" />
        <rect x="176" y="196" width="48" height="30" rx="6" fill="#fff" opacity="0.12" />
        <rect x="232" y="196" width="48" height="30" rx="6" fill="#C8FF3D" opacity="0.85" />
      </g>
      <path d="M60 252H340L326 276Q322 282 314 282H86Q78 282 74 276Z" fill={x.url("bodyH")} />
      <path d="M60 252H340" stroke={lighten(x.c, 0.5)} strokeWidth="2" />
      <rect x="176" y="252" width="48" height="6" rx="3" fill={darken(x.c, 0.25)} />
    </g>
  ),

  keyboard: (x) => {
    const keys: ReactNode[] = [];
    for (let r = 0; r < 4; r++)
      for (let k = 0; k < 12; k++) {
        const w = r === 3 && k === 4 ? 0 : 16;
        if (r === 3 && k > 4 && k < 8) continue;
        keys.push(
          <rect key={`${r}-${k}`} x={78 + k * 20.5} y={176 + r * 22} width={w || 96} height="16" rx="4" fill={lighten(x.c, 0.12)} stroke={darken(x.c, 0.18)} strokeWidth="1" />,
        );
      }
    return (
      <g>
        <Shadow ctx={x} rx={165} ry={16} cy={292} />
        <g transform="translate(200 230) skewX(-14) scale(1 0.8) translate(-200 -230)">
          <rect x="62" y="160" width="276" height="112" rx="16" fill={darken(x.c, 0.22)} transform="translate(0 8)" />
          <rect x="62" y="160" width="276" height="112" rx="16" fill={x.url("body")} />
          {keys}
          <rect x="304" y="167" width="20" height="4" rx="2" fill="#C8FF3D" />
        </g>
      </g>
    );
  },

  monitor: (x) => (
    <g>
      <Shadow ctx={x} rx={110} ry={13} cy={318} />
      <path d="M186 244H214L222 306H178Z" fill={x.url("steel")} />
      <ellipse cx="200" cy="310" rx="74" ry="12" fill={x.url("steel")} />
      <rect x="54" y="72" width="292" height="182" rx="10" fill={x.url("bodyV")} />
      <rect x="62" y="80" width="276" height="160" rx="4" fill={x.url("screen")} />
      <rect x="62" y="80" width="276" height="160" rx="4" fill={x.url("wall")} opacity="0.9" />
      <path d="M170 222V180A30 30 0 0 1 230 180V222Z M186 222A70 70 0 0 1 200 150A70 70 0 0 1 214 222Z" fill="#0a0b0d" fillRule="evenodd" opacity="0.85" />
      <path d="M186.5 200Q200 192 213.5 200Q200 208 186.5 200Z" fill="#C8FF3D" />
      <rect x="62" y="80" width="276" height="160" rx="4" fill={x.url("gloss")} opacity="0.5" />
    </g>
  ),

  phone: (x) => (
    <g>
      <Shadow ctx={x} rx={80} ry={12} cy={330} />
      <g transform="rotate(-9 200 200)">
        <rect x="136" y="56" width="128" height="268" rx="30" fill={x.url("bodyH")} />
        <rect x="143" y="63" width="114" height="254" rx="24" fill={x.url("screen")} />
        <rect x="143" y="63" width="114" height="254" rx="24" fill={x.url("wall")} opacity="0.75" />
        <rect x="182" y="72" width="36" height="10" rx="5" fill="#0a0b0d" />
        <text x="200" y="140" textAnchor="middle" fontSize="34" fontWeight="300" fill="#fff" fontFamily="system-ui">9:41</text>
        <rect x="160" y="270" width="80" height="26" rx="13" fill="#fff" opacity="0.2" />
        <rect x="143" y="63" width="60" height="254" rx="24" fill="#fff" opacity="0.08" />
        <rect x="262" y="120" width="4" height="40" rx="2" fill={darken(x.c, 0.3)} />
      </g>
    </g>
  ),

  lamp: (x) => (
    <g>
      <ellipse cx="200" cy="210" rx="120" ry="90" fill={x.url("glow")} opacity="0.55" />
      <Shadow ctx={x} rx={92} ry={13} cy={322} />
      <path d="M152 318Q152 282 200 276Q248 282 248 318Z" fill={x.url("body")} />
      <ellipse cx="200" cy="318" rx="48" ry="7" fill={darken(x.c, 0.25)} />
      <rect x="196" y="140" width="8" height="140" rx="4" fill={x.url("steel")} />
      <path d="M126 180L152 88H248L274 180Z" fill="#F4EEE2" />
      <path d="M126 180L152 88H248L274 180Z" fill={x.url("gloss")} opacity="0.6" />
      <path d="M248 88L274 180H240L226 88Z" fill="#0a0b0d" opacity="0.07" />
      <ellipse cx="200" cy="180" rx="74" ry="9" fill="#FFF3D1" />
      <ellipse cx="200" cy="88" rx="48" ry="5" fill="#E8DFCE" />
    </g>
  ),

  chair: (x) => (
    <g>
      <Shadow ctx={x} rx={140} ry={16} cy={322} />
      {/* legs */}
      <path d="M118 272L108 320H118L130 272Z" fill={x.url("wood")} />
      <path d="M282 272L292 320H282L270 272Z" fill={x.url("wood")} />
      <path d="M160 276L156 306H164L168 276Z" fill={x.url("wood")} opacity="0.8" />
      <path d="M240 276L244 306H236L232 276Z" fill={x.url("wood")} opacity="0.8" />
      {/* back */}
      <rect x="118" y="104" width="164" height="136" rx="56" fill={x.url("body")} />
      <rect x="118" y="104" width="164" height="136" rx="56" fill={x.url("speckle")} />
      <rect x="134" y="114" width="80" height="40" rx="20" fill="#fff" opacity="0.18" />
      {/* seat */}
      <rect x="96" y="214" width="208" height="64" rx="30" fill={x.url("bodyV")} />
      <rect x="96" y="214" width="208" height="64" rx="30" fill={x.url("speckle")} />
      {/* arms */}
      <rect x="82" y="168" width="48" height="110" rx="24" fill={x.url("bodyH")} />
      <rect x="270" y="168" width="48" height="110" rx="24" fill={x.url("bodyH")} />
      <rect x="82" y="168" width="48" height="110" rx="24" fill={x.url("speckle")} />
      <rect x="270" y="168" width="48" height="110" rx="24" fill={x.url("speckle")} />
      <path d="M100 272H300" stroke={x.url("wood")} strokeWidth="6" strokeLinecap="round" />
    </g>
  ),

  taskchair: (x) => (
    <g>
      <Shadow ctx={x} rx={120} ry={14} cy={326} />
      {/* base */}
      <g stroke={darken(x.c, 0.1)} strokeWidth="10" strokeLinecap="round">
        <path d="M200 296L118 312" />
        <path d="M200 296L282 312" />
        <path d="M200 296L160 322" />
        <path d="M200 296L240 322" />
        <path d="M200 296L200 306" />
      </g>
      {[118, 282, 160, 240].map((cx, i) => (
        <circle key={i} cx={cx} cy={i < 2 ? 318 : 326} r="7" fill="#0a0b0d" />
      ))}
      <rect x="192" y="232" width="16" height="64" rx="4" fill={x.url("steel")} />
      {/* seat */}
      <path d="M118 222Q118 206 134 206H266Q282 206 282 222V236Q282 246 270 246H130Q118 246 118 236Z" fill={x.url("bodyV")} />
      {/* back */}
      <path d="M140 76Q140 60 158 60H242Q260 60 260 76L252 190Q250 204 236 204H164Q150 204 148 190Z" fill={x.url("dark")} />
      <path d="M150 80Q150 70 162 70H238Q250 70 250 80L243 186Q242 194 234 194H166Q158 194 157 186Z" fill={x.url("mesh")} />
      <path d="M156 150Q200 162 244 150" stroke={x.a} strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="194" y="196" width="12" height="16" fill={darken(x.c, 0.3)} />
      {/* arms */}
      <path d="M112 196H138V226H130V206H112Z" fill={darken(x.c, 0.35)} />
      <path d="M288 196H262V226H270V206H288Z" fill={darken(x.c, 0.35)} />
      <rect x="100" y="188" width="44" height="12" rx="6" fill={darken(x.c, 0.45)} />
      <rect x="256" y="188" width="44" height="12" rx="6" fill={darken(x.c, 0.45)} />
    </g>
  ),

  vase: (x) => (
    <g>
      <Shadow ctx={x} rx={140} ry={14} cy={318} />
      <path d="M92 318Q74 286 92 250Q104 226 104 206V192H128V206Q128 226 140 250Q158 286 140 318Z" fill={x.url("bodyH")} />
      <path d="M92 318Q74 286 92 250Q104 226 104 206V192H128V206Q128 226 140 250Q158 286 140 318Z" fill={x.url("speckle")} />
      <path d="M170 318Q150 270 172 220Q186 190 186 160V132H214V160Q214 190 228 220Q250 270 230 318Z" fill={x.url("bodyH")} />
      <path d="M170 318Q150 270 172 220Q186 190 186 160V132H214V160Q214 190 228 220Q250 270 230 318Z" fill={x.url("speckle")} />
      <path d="M262 318Q248 290 262 262Q274 244 272 222H300Q298 244 310 262Q324 290 310 318Z" fill={x.url("bodyH")} />
      <path d="M262 318Q248 290 262 262Q274 244 272 222H300Q298 244 310 262Q324 290 310 318Z" fill={x.url("speckle")} />
      {/* stems */}
      <path d="M200 132Q196 90 214 58" stroke="#6F8455" strokeWidth="3" fill="none" />
      <ellipse cx="216" cy="56" rx="10" ry="16" fill="#E9D8B4" transform="rotate(24 216 56)" />
      <path d="M116 192Q112 164 96 146" stroke="#6F8455" strokeWidth="2.5" fill="none" />
      <ellipse cx="94" cy="144" rx="6" ry="11" fill="#C8FF3D" transform="rotate(-30 94 144)" opacity="0.9" />
      <ellipse cx="186" cy="196" rx="8" ry="28" fill="#fff" opacity="0.18" />
    </g>
  ),

  candle: (x) => (
    <g>
      <ellipse cx="200" cy="120" rx="60" ry="70" fill={x.url("glow")} opacity="0.7" />
      <Shadow ctx={x} rx={100} ry={14} cy={318} />
      <path d="M128 142H272V296Q272 318 250 318H150Q128 318 128 296Z" fill={x.url("bodyH")} opacity="0.95" />
      <path d="M136 168H264V292Q264 310 246 310H154Q136 310 136 292Z" fill={x.a} opacity="0.92" />
      <ellipse cx="200" cy="168" rx="64" ry="9" fill={lighten(x.a, 0.3)} />
      <rect x="148" y="214" width="104" height="58" rx="3" fill="#F7F4EC" />
      <text x="200" y="239" textAnchor="middle" fontSize="11" letterSpacing="3" fill="#0a0b0d" fontFamily="system-ui">FIG &amp; CEDAR</text>
      <rect x="182" y="250" width="36" height="2" fill="#0a0b0d" opacity="0.5" />
      <path d="M198 168V150" stroke="#2a2a2a" strokeWidth="2.5" />
      <path d="M198 150Q186 132 198 112Q210 132 198 150Z" fill="#FFB547" />
      <path d="M198 148Q192 138 198 126Q204 138 198 148Z" fill="#FFF3C4" />
      <ellipse cx="200" cy="142" rx="72" ry="10" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" />
      <rect x="138" y="150" width="14" height="150" rx="7" fill="#fff" opacity="0.28" />
    </g>
  ),

  plant: (x) => {
    const leaves = [
      [150, 120, -40], [170, 96, -20], [200, 84, 0], [230, 96, 22], [252, 122, 40], [140, 150, -60], [262, 152, 60],
      [180, 124, -10], [218, 120, 14], [196, 110, 4], [164, 160, -30], [236, 160, 34], [200, 140, 0], [124, 132, -52],
      [276, 134, 52], [186, 70, -12], [214, 70, 14],
    ];
    return (
      <g>
        <Shadow ctx={x} rx={96} ry={13} cy={322} />
        <path d="M200 250Q196 210 204 170Q208 150 196 128" stroke="#6B5236" strokeWidth="7" fill="none" strokeLinecap="round" />
        <path d="M200 200Q224 180 240 150" stroke="#6B5236" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M198 186Q176 170 162 146" stroke="#6B5236" strokeWidth="4" fill="none" strokeLinecap="round" />
        {leaves.map(([cx, cy, r], i) => (
          <ellipse
            key={i}
            cx={cx}
            cy={cy}
            rx="7"
            ry="22"
            transform={`rotate(${r} ${cx} ${cy})`}
            fill={i % 3 === 0 ? "#7D9164" : i % 3 === 1 ? "#98A982" : "#6A7D55"}
          />
        ))}
        <path d="M140 240H260L248 318H152Z" fill={x.url("bodyH")} />
        <rect x="132" y="232" width="136" height="22" rx="4" fill={x.url("bodyH")} />
        <rect x="132" y="232" width="136" height="6" rx="3" fill="#fff" opacity="0.2" />
      </g>
    );
  },

  kettle: (x) => (
    <g>
      <Shadow ctx={x} rx={120} ry={14} cy={318} />
      <ellipse cx="192" cy="306" rx="84" ry="12" fill={darken(x.c, 0.35)} />
      <path d="M126 272C82 268 66 236 66 190Q66 170 54 154" stroke={darken(x.c, 0.1)} strokeWidth="11" fill="none" strokeLinecap="round" />
      <path d="M126 272C82 268 66 236 66 190Q66 170 54 154" stroke={lighten(x.c, 0.25)} strokeWidth="3" fill="none" strokeLinecap="round" transform="translate(-2 -2)" opacity="0.6" />
      <path d="M122 170Q120 150 144 146H240Q264 150 262 170L270 290Q270 304 254 304H130Q114 304 114 290Z" fill={x.url("bodyH")} />
      <rect x="130" y="176" width="16" height="116" rx="8" fill="#fff" opacity="0.22" />
      <ellipse cx="192" cy="148" rx="50" ry="8" fill={lighten(x.c, 0.2)} />
      <rect x="184" y="126" width="16" height="20" rx="6" fill={x.url("accent")} />
      <path d="M262 176Q318 176 312 232Q308 270 266 272" stroke={x.url("accent")} strokeWidth="14" fill="none" strokeLinecap="round" />
      <rect x="170" y="262" width="44" height="14" rx="7" fill="#0a0b0d" opacity="0.7" />
      <rect x="178" y="266" width="18" height="6" rx="3" fill="#C8FF3D" />
    </g>
  ),

  mug: (x) => (
    <g>
      <Shadow ctx={x} rx={140} ry={15} cy={320} />
      {/* back mug */}
      <g transform="translate(62 -34)">
        <path d="M188 190H292V300Q292 318 274 318H206Q188 318 188 300Z" fill={x.url("bodyH")} opacity="0.9" />
        <ellipse cx="240" cy="190" rx="52" ry="9" fill={darken(x.c, 0.35)} />
        <path d="M292 214Q330 214 328 250Q326 282 292 282" stroke={x.url("bodyH")} strokeWidth="13" fill="none" />
      </g>
      {/* front mug */}
      <path d="M104 190H236V300Q236 320 214 320H126Q104 320 104 300Z" fill={x.url("bodyH")} />
      <ellipse cx="170" cy="190" rx="66" ry="11" fill={darken(x.c, 0.4)} />
      <ellipse cx="170" cy="190" rx="66" ry="11" fill="none" stroke={lighten(x.c, 0.35)} strokeWidth="3" />
      <path d="M236 216Q280 214 278 256Q276 292 236 292" stroke={x.url("bodyH")} strokeWidth="15" fill="none" />
      <rect x="116" y="200" width="16" height="104" rx="8" fill="#fff" opacity="0.22" />
      <rect x="104" y="192" width="132" height="128" rx="20" fill={x.url("speckle")} opacity="0.6" />
    </g>
  ),

  coffeebag: (x) => (
    <g>
      <Shadow ctx={x} rx={110} ry={14} cy={324} />
      <path d="M124 110L134 84H266L276 110L288 310Q288 322 276 322H124Q112 322 112 310Z" fill={x.url("bodyH")} />
      <path d="M134 84H266L276 110H124Z" fill={darken(x.c, 0.12)} />
      <path d="M130 96H270" stroke={darken(x.c, 0.3)} strokeWidth="2" strokeDasharray="4 4" />
      <rect x="144" y="150" width="112" height="126" rx="6" fill="#F7F7F2" />
      <text x="200" y="182" textAnchor="middle" fontSize="11" letterSpacing="3" fill="#0a0b0d" fontFamily="system-ui">ORO · GUJI</text>
      <path d="M186 206A14 14 0 0 1 214 206V236H186Z M194 236A40 40 0 0 1 200 214A40 40 0 0 1 206 236Z" fill="#0a0b0d" fillRule="evenodd" />
      <rect x="164" y="248" width="72" height="3" rx="1.5" fill="#0a0b0d" opacity="0.4" />
      <rect x="176" y="256" width="48" height="3" rx="1.5" fill="#0a0b0d" opacity="0.25" />
      <circle cx="244" cy="130" r="9" fill={darken(x.c, 0.2)} />
      <circle cx="244" cy="130" r="4" fill={darken(x.c, 0.4)} />
      <rect x="126" y="118" width="14" height="190" rx="7" fill="#fff" opacity="0.25" />
    </g>
  ),

  sneaker: (x) => (
    <g>
      <Shadow ctx={x} rx={160} ry={14} cy={292} />
      <g transform="translate(0 8)">
        {/* upper */}
        <path d="M60 246C52 214 80 198 122 194L190 174C214 150 240 132 262 128Q282 124 292 138Q302 150 316 146C336 150 348 194 346 240Z" fill={x.url("body")} />
        <path d="M60 246C54 216 78 200 118 196C108 214 108 232 112 246Z" fill={darken(x.c, 0.1)} opacity="0.55" />
        <path d="M262 128Q282 124 292 138Q302 150 316 146Q304 164 282 160Q264 154 262 128Z" fill={darken(x.c, 0.55)} />
        <path d="M184 190L262 144" stroke={darken(x.c, 0.18)} strokeWidth="10" strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => {
          const px = 192 + i * 15;
          const py = 184 - i * 9.4;
          return <path key={i} d={`M${px - 6} ${py - 9}L${px + 8} ${py + 5}`} stroke={lighten(x.c, 0.75)} strokeWidth="4.5" strokeLinecap="round" />;
        })}
        <path d="M316 146Q334 148 340 176L328 178Q324 160 312 156Z" fill={x.url("accent")} />
        <path d="M120 206Q170 194 214 190" stroke="#fff" strokeOpacity="0.45" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M224 222A11 11 0 0 1 246 222V236H224Z M231 236A26 26 0 0 1 235 225A26 26 0 0 1 239 236Z" fill={x.url("accent")} fillRule="evenodd" />
        {/* midsole + outsole */}
        <path d="M50 262Q46 242 66 240L322 234Q352 234 354 254Q354 272 328 276L82 282Q54 282 50 262Z" fill="#F6F5F0" />
        <path d="M66 240L322 234Q340 234 348 244Q250 250 64 256Z" fill="#fff" opacity="0.7" />
        <path d="M52 270Q60 284 84 284L330 278Q350 274 354 262L352 258Q340 270 318 270L82 274Q60 274 52 266Z" fill={x.url("accent")} />
      </g>
    </g>
  ),

  backpack: (x) => (
    <g>
      <Shadow ctx={x} rx={110} ry={14} cy={324} />
      <path d="M172 70Q172 50 200 50Q228 50 228 70V84H216V72Q216 62 200 62Q184 62 184 72V84H172Z" fill={x.url("dark")} />
      <rect x="112" y="82" width="176" height="238" rx="56" fill={x.url("bodyH")} />
      <path d="M124 150Q200 132 276 150" stroke={darken(x.c, 0.3)} strokeWidth="2.5" fill="none" />
      <path d="M124 150Q200 132 276 150" stroke={lighten(x.c, 0.3)} strokeWidth="1" fill="none" transform="translate(0 3)" />
      <rect x="140" y="196" width="120" height="104" rx="30" fill={x.url("body")} />
      <path d="M150 214H250" stroke={darken(x.c, 0.3)} strokeWidth="2.5" />
      <rect x="244" y="208" width="10" height="20" rx="3" fill={x.url("accent")} />
      <rect x="180" y="250" width="40" height="22" rx="4" fill={darken(x.c, 0.25)} />
      <path d="M190 266A6 6 0 0 1 202 266V270H190Z" fill={x.a} opacity="0.9" />
      <rect x="124" y="96" width="22" height="200" rx="11" fill="#fff" opacity="0.15" />
      <rect x="96" y="120" width="18" height="160" rx="9" fill={x.url("dark")} />
      <rect x="286" y="120" width="18" height="160" rx="9" fill={x.url("dark")} />
    </g>
  ),

  watch: (x) => (
    <g>
      <Shadow ctx={x} rx={80} ry={12} cy={330} />
      <path d="M168 60H232L226 142H174Z" fill="#26282c" />
      <path d="M174 258H226L232 330H168Z" fill="#26282c" />
      <path d="M178 70H222M178 90H222M178 110H222" stroke="#3c3f45" strokeWidth="2" />
      <circle cx="200" cy="200" r="86" fill={x.url("steel")} />
      <circle cx="200" cy="200" r="86" fill={x.c} opacity="0.35" />
      <circle cx="200" cy="200" r="74" fill={x.a} />
      <circle cx="200" cy="200" r="74" fill={x.url("gloss")} opacity="0.35" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * Math.PI) / 6;
        const long = i % 3 === 0;
        const r1 = long ? 56 : 60;
        return (
          <line
            key={i}
            x1={r2(200 + Math.sin(a) * r1)}
            y1={r2(200 - Math.cos(a) * r1)}
            x2={r2(200 + Math.sin(a) * 68)}
            y2={r2(200 - Math.cos(a) * 68)}
            stroke={luminance(x.a) > 0.5 ? "#1a1b1e" : "#eeeae0"}
            strokeWidth={long ? 4 : 2}
          />
        );
      })}
      <line x1="200" y1="200" x2="236" y2="178" stroke={luminance(x.a) > 0.5 ? "#1a1b1e" : "#eeeae0"} strokeWidth="5" strokeLinecap="round" />
      <line x1="200" y1="200" x2="188" y2="146" stroke={luminance(x.a) > 0.5 ? "#1a1b1e" : "#eeeae0"} strokeWidth="3.5" strokeLinecap="round" />
      <line x1="200" y1="214" x2="214" y2="252" stroke="#5967FF" strokeWidth="1.8" />
      <circle cx="200" cy="200" r="5" fill="#5967FF" />
      <rect x="284" y="192" width="14" height="16" rx="3" fill={x.url("steel")} />
    </g>
  ),

  sunglasses: (x) => (
    <g>
      <Shadow ctx={x} rx={150} ry={12} cy={272} />
      <path d="M64 170Q40 164 30 190" stroke={x.url("body")} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M336 170Q360 164 370 190" stroke={x.url("body")} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M60 158Q60 144 76 144H176Q190 144 190 160Q188 222 150 238Q112 250 80 232Q60 218 60 170Z" fill={x.url("body")} />
      <path d="M340 158Q340 144 324 144H224Q210 144 210 160Q212 222 250 238Q288 250 320 232Q340 218 340 170Z" fill={x.url("body")} />
      <path d="M72 162Q72 156 80 156H172Q178 156 178 164Q176 214 146 226Q116 236 90 222Q72 212 72 176Z" fill={x.url("accent")} />
      <path d="M328 162Q328 156 320 156H228Q222 156 222 164Q224 214 254 226Q284 236 310 222Q328 212 328 176Z" fill={x.url("accent")} />
      <path d="M86 166L128 166L96 214Q84 204 86 176Z" fill="#fff" opacity="0.18" />
      <path d="M236 166L278 166L246 214Q234 204 236 176Z" fill="#fff" opacity="0.18" />
      <path d="M186 160Q200 146 214 160" stroke={x.url("body")} strokeWidth="10" fill="none" />
    </g>
  ),

  bottle: (x) => (
    <g>
      <Shadow ctx={x} rx={70} ry={12} cy={326} />
      <path d="M156 128Q156 108 176 104H224Q244 108 244 128V304Q244 322 226 322H174Q156 322 156 304Z" fill={x.url("bodyH")} />
      <rect x="166" y="120" width="14" height="190" rx="7" fill="#fff" opacity="0.28" />
      <path d="M172 104V80Q172 70 182 70H218Q228 70 228 80V104Z" fill={x.url("accentH")} />
      <path d="M190 70V58Q190 48 200 48Q210 48 210 58V70" stroke={x.url("accentH")} strokeWidth="8" fill="none" />
      <path d="M186 212A14 14 0 0 1 214 212V244H186Z M194 244A44 44 0 0 1 200 222A44 44 0 0 1 206 244Z" fill={luminance(x.c) > 0.55 ? "#0a0b0d" : "#F7F7F2"} fillRule="evenodd" opacity="0.9" />
    </g>
  ),

  serum: (x) => (
    <g>
      <Shadow ctx={x} rx={70} ry={12} cy={324} />
      <rect x="150" y="150" width="100" height="172" rx="18" fill={x.url("bodyH")} />
      <rect x="150" y="150" width="100" height="172" rx="18" fill={x.url("glass")} />
      <rect x="158" y="200" width="84" height="80" rx="2" fill="#F7F4EE" />
      <text x="200" y="226" textAnchor="middle" fontSize="10" letterSpacing="2.5" fill="#0a0b0d" fontFamily="system-ui">SOLACE</text>
      <rect x="176" y="236" width="48" height="2" fill="#0a0b0d" opacity="0.4" />
      <text x="200" y="262" textAnchor="middle" fontSize="9" fill="#0a0b0d" opacity="0.7" fontFamily="system-ui">30 ml</text>
      <rect x="176" y="126" width="48" height="28" rx="4" fill={x.url("accentH")} />
      <path d="M182 126V96Q182 74 200 74Q218 74 218 96V126Z" fill={darken(x.a, 0.05)} />
      <rect x="186" y="84" width="8" height="34" rx="4" fill="#fff" opacity="0.2" />
      <rect x="158" y="160" width="12" height="150" rx="6" fill="#fff" opacity="0.35" />
    </g>
  ),

  paper: (x) => {
    const box = isoBox(200, 318, 150, 110, 140);
    return (
      <g>
        <Shadow ctx={x} rx={150} ry={20} cy={300} />
        <path d={box.left} fill={darken(x.c, 0.08)} />
        <path d={box.right} fill={darken(x.c, 0.16)} />
        <path d={box.top} fill={lighten(x.c, 0.4)} />
        {/* band */}
        <path d={isoBand(200, 318, 150, 110, 140, 0.35, 0.62).left} fill={x.a} />
        <path d={isoBand(200, 318, 150, 110, 140, 0.35, 0.62).right} fill={darken(x.a, 0.2)} />
        {[0.2, 0.4, 0.8].map((t) => (
          <path key={t} d={isoLineRight(200, 318, 150, 140 * t)} stroke={darken(x.c, 0.25)} strokeWidth="1" opacity="0.5" />
        ))}
        <text transform="translate(226 262) skewY(-30)" fontSize="15" fontWeight="600" fill="#fff" fontFamily="system-ui" letterSpacing="1">A4 · 80</text>
      </g>
    );
  },

  scanner: (x) => (
    <g>
      <Shadow ctx={x} rx={110} ry={13} cy={326} />
      <path d="M200 262L270 262L240 150" fill="none" stroke="#C8FF3D" strokeWidth="0" />
      <path d="M92 118Q92 96 116 96H266Q290 96 290 120V150Q290 170 268 170H200L184 300Q182 318 164 318H146Q128 318 132 300L150 170H116Q92 170 92 148Z" fill={x.url("body")} />
      <path d="M266 96Q290 96 290 120V150Q290 170 268 170H258V96Z" fill={darken(x.c, 0.25)} />
      <rect x="272" y="104" width="12" height="58" rx="4" fill="#C8FF3D" />
      <path d="M284 133L372 118M284 133L372 150" stroke="#C8FF3D" strokeWidth="1.5" opacity="0.8" />
      <path d="M200 176Q212 198 200 222" stroke={darken(x.c, 0.4)} strokeWidth="10" fill="none" strokeLinecap="round" />
      <rect x="112" y="112" width="100" height="10" rx="5" fill="#fff" opacity="0.18" />
      <rect x="124" y="136" width="30" height="16" rx="4" fill="#0a0b0d" opacity="0.8" />
      <rect x="128" y="140" width="10" height="8" rx="2" fill="#5967FF" />
    </g>
  ),

  carton: (x) => {
    const b = isoBox(200, 318, 160, 130, 130);
    const tape = isoTopStrip(200, 318, 160, 130, 130);
    return (
      <g>
        <Shadow ctx={x} rx={165} ry={22} cy={298} />
        <path d={b.left} fill={x.url("bodyV")} />
        <path d={b.right} fill={darken(x.c, 0.18)} />
        <path d={b.top} fill={lighten(x.c, 0.18)} />
        <path d={tape} fill={x.light ? "#E9E4D6" : "#C8FF3D"} opacity="0.85" />
        <path d={isoFlapLine(200, 318, 160, 130, 130)} stroke={darken(x.c, 0.3)} strokeWidth="1.5" />
        <g transform="translate(118 250) skewY(30)">
          <rect x="0" y="0" width="58" height="36" fill="#F7F7F2" />
          <rect x="6" y="6" width="30" height="3" fill="#0a0b0d" opacity="0.7" />
          <rect x="6" y="13" width="44" height="2" fill="#0a0b0d" opacity="0.4" />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <rect key={i} x={6 + i * 4.4} y="20" width={i % 3 === 0 ? 2.4 : 1.2} height="11" fill="#0a0b0d" />
          ))}
        </g>
        <path d="M258 222l14 -8 M258 232l14 -8 M258 242l14 -8" stroke="#0a0b0d" strokeWidth="2" opacity="0.35" />
      </g>
    );
  },

  gloves: (x) => {
    const b = isoBox(200, 322, 170, 90, 96);
    return (
      <g>
        <Shadow ctx={x} rx={160} ry={20} cy={300} />
        <path d={b.left} fill="#EDEFF3" />
        <path d={b.right} fill="#D7DBE2" />
        <path d={b.top} fill="#F7F8FA" />
        {/* dispenser slot */}
        <ellipse cx="202" cy="192" rx="46" ry="14" fill="#C9CED6" transform="rotate(-8 202 192)" />
        {/* glove */}
        <path
          d="M170 196Q160 150 168 120Q172 106 180 120L184 150L186 96Q188 82 198 94L200 146L206 88Q210 76 218 90L216 148L226 104Q232 92 238 106L230 164Q248 150 256 158Q262 166 250 176L222 206Z"
          fill={x.url("body")}
        />
        <path d="M184 150L186 110M200 146L204 104M216 148L220 110" stroke={lighten(x.c, 0.35)} strokeWidth="2" opacity="0.5" />
        {/* label */}
        <g transform="translate(206 300) skewY(-30)">
          <rect x="0" y="-62" width="120" height="44" fill={x.c} opacity="0.95" />
          <text x="10" y="-44" fontSize="11" fontWeight="600" fill="#fff" fontFamily="system-ui" letterSpacing="1">NITRILE 4 MIL</text>
          <text x="10" y="-28" fontSize="9" fill="#fff" opacity="0.8" fontFamily="system-ui">100 · POWDER FREE</text>
        </g>
      </g>
    );
  },

  helmet: (x) => (
    <g>
      <Shadow ctx={x} rx={150} ry={16} cy={300} />
      <path d="M60 262Q60 244 90 240H310Q340 244 340 262Q340 272 318 272H82Q60 272 60 262Z" fill={x.url("bodyH")} />
      <path d="M92 244Q88 134 200 118Q312 134 308 244Z" fill={x.url("body")} />
      <path d="M186 122Q200 112 214 122L216 242H184Z" fill={lighten(x.c, 0.25)} />
      <path d="M186 122Q200 112 214 122L216 242H184Z" fill="#fff" opacity="0.15" />
      <path d="M130 170Q152 140 180 130" stroke="#fff" strokeOpacity="0.45" strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="136" y="160" width="34" height="8" rx="4" fill={darken(x.c, 0.35)} transform="rotate(-22 153 164)" />
      <rect x="230" y="160" width="34" height="8" rx="4" fill={darken(x.c, 0.35)} transform="rotate(22 247 164)" />
      <path d="M100 250H300" stroke={x.a} strokeWidth="4" opacity="0.6" />
    </g>
  ),

  spray: (x) => (
    <g>
      <Shadow ctx={x} rx={80} ry={12} cy={326} />
      <path d="M156 170Q156 150 176 146H226Q246 150 246 170V304Q246 322 228 322H174Q156 322 156 304Z" fill={x.url("bodyH")} />
      <rect x="166" y="160" width="12" height="150" rx="6" fill="#fff" opacity="0.4" />
      <rect x="176" y="118" width="50" height="30" rx="6" fill={x.url("dark")} />
      <path d="M170 90Q170 74 188 74H244Q262 74 266 88L272 104H228L226 120H176Z" fill="#26282C" />
      <path d="M266 90H284V102H270Z" fill="#26282C" />
      <path d="M204 120Q196 150 214 168" stroke="#26282C" strokeWidth="9" fill="none" strokeLinecap="round" />
      <rect x="166" y="206" width="70" height="80" rx="4" fill={x.a} />
      <text x="201" y="236" textAnchor="middle" fontSize="10" fontWeight="600" fill="#0a0b0d" fontFamily="system-ui" letterSpacing="1.5">ECO</text>
      <text x="201" y="252" textAnchor="middle" fontSize="8" fill="#0a0b0d" opacity="0.7" fontFamily="system-ui">SURFACE</text>
      <path d="M190 264A11 11 0 0 1 212 264V276H190Z" fill="#0a0b0d" opacity="0.8" />
    </g>
  ),
};

/* ─── Isometric helpers ─── */
/** Round to 2dp so server and client serialise identical SVG attributes. */
function r2(n: number) {
  return Math.round(n * 100) / 100;
}
const C30 = 0.866025;
const S30 = 0.5;
function isoBox(cx: number, cy: number, w: number, d: number, h: number) {
  const R = [r2(cx + w * C30), r2(cy - w * S30)];
  const L = [r2(cx - d * C30), r2(cy - d * S30)];
  const B = [r2(cx + w * C30 - d * C30), r2(cy - w * S30 - d * S30)];
  return {
    right: `M${cx} ${cy}L${R[0]} ${R[1]}L${R[0]} ${R[1] - h}L${cx} ${cy - h}Z`,
    left: `M${cx} ${cy}L${L[0]} ${L[1]}L${L[0]} ${L[1] - h}L${cx} ${cy - h}Z`,
    top: `M${cx} ${cy - h}L${R[0]} ${R[1] - h}L${B[0]} ${B[1] - h}L${L[0]} ${L[1] - h}Z`,
  };
}
function isoBand(cx: number, cy: number, w: number, d: number, h: number, t0: number, t1: number) {
  const R = [r2(cx + w * C30), r2(cy - w * S30)];
  const L = [r2(cx - d * C30), r2(cy - d * S30)];
  const y0 = r2(h * t0);
  const y1 = r2(h * t1);
  return {
    right: `M${cx} ${cy - y0}L${R[0]} ${R[1] - y0}L${R[0]} ${R[1] - y1}L${cx} ${cy - y1}Z`,
    left: `M${cx} ${cy - y0}L${L[0]} ${L[1] - y0}L${L[0]} ${L[1] - y1}L${cx} ${cy - y1}Z`,
  };
}
function isoLineRight(cx: number, cy: number, w: number, y: number) {
  return `M${cx} ${r2(cy - y)}L${r2(cx + w * C30)} ${r2(cy - w * S30 - y)}`;
}
function isoTopStrip(cx: number, cy: number, w: number, d: number, h: number) {
  // Tape running along the width axis, centred across depth
  const half = 0.12;
  const p = (u: number, v: number) => [r2(cx + u * w * C30 - v * d * C30), r2(cy - h - u * w * S30 - v * d * S30)];
  const a = p(0, 0.5 - half);
  const b = p(1, 0.5 - half);
  const c = p(1, 0.5 + half);
  const e = p(0, 0.5 + half);
  return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}L${c[0]} ${c[1]}L${e[0]} ${e[1]}Z`;
}
function isoFlapLine(cx: number, cy: number, w: number, d: number, h: number) {
  const p = (u: number, v: number) => [r2(cx + u * w * C30 - v * d * C30), r2(cy - h - u * w * S30 - v * d * S30)];
  const a = p(0, 0.5);
  const b = p(1, 0.5);
  return `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`;
}

/* ─── Component ─────────────────────────────────────────────── */

const VIEWS: Record<ArtView, { viewBox: string; transform?: string }> = {
  hero: { viewBox: "0 0 400 400" },
  angle: { viewBox: "0 0 400 400", transform: "translate(200 210) rotate(-7) scale(0.9) translate(-200 -210)" },
  detail: { viewBox: "90 80 220 220" },
  context: { viewBox: "0 0 400 400", transform: "translate(200 250) scale(0.62) translate(-200 -250)" },
  pill: { viewBox: "10 92 380 198" },
};

export function ProductArt({ kind, color, accent, tint = "#EEEFEA", view = "hero", backdrop = true, className, title }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ctx: Ctx = {
    id: (n) => `${uid}-${n}`,
    url: (n) => `url(#${uid}-${n})`,
    c: color,
    a: accent ?? darken(color, 0.3),
    light: luminance(color) > 0.6,
  };
  const v = VIEWS[view];
  return (
    <svg
      viewBox={v.viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
    >
      <Defs ctx={ctx} tint={tint} />
      {backdrop && (
        <>
          <rect x="0" y="0" width="400" height="400" fill={ctx.url("studio")} />
          {view === "context" && (
            <>
              <rect x="0" y="290" width="400" height="110" fill={darken(tint, 0.05)} />
              <path d="M0 290H400" stroke={darken(tint, 0.1)} strokeWidth="1" />
              <rect x="120" y="120" width="160" height="170" rx="80" fill={lighten(tint, 0.45)} opacity="0.7" />
            </>
          )}
        </>
      )}
      <g transform={v.transform}>{draw[kind](ctx)}</g>
    </svg>
  );
}
