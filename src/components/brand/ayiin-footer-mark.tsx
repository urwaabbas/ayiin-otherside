"use client";

import { clsx } from "clsx";
import { useEffect, useId, useRef, useState } from "react";

/**
 * The footer's big Ayiin wordmark, drawn from the supplied logo artwork (ayiin-logo-on-dark.svg).
 *
 * Two stacked layers:
 *  · an outline of every glyph, stroked in the logo's own gradients;
 *  · the full-colour logo on top, revealed only inside a soft spotlight that follows the pointer.
 * When the footer scrolls into view, each glyph rises into place with a slight alternating tilt.
 * Touch devices (no hover) get the full-colour logo; reduced motion skips the rise.
 */
const VIEWBOX = "0 0 108.426665 47.36182";

const GLYPHS = [
  { name: "A", tone: "sun", x1: 0, x2: 29.974396, y: 20.984569, step: 0, rise: 48, d: "M27.638545.536185l2.284099,6.17324c.198413.536252-.198317,1.106057-.770098,1.106057h-3.747131c-2.11242,0-4.001816,1.314309-4.73653,3.294842l-5.557408,14.98084c-.198973.536361.197778,1.106712.769855,1.106712h8.12271c.32996,0,.62787.197508.756333.501434l2.510204,5.938776c.228823.541362-.168597,1.140808-.756333,1.140808h-13.724478c-.352451,0-.66559.224924-.778134.558924l-2.046133,6.072396c-.112543.334-.425683.558924-.778134.558924H.821912c-.578771,0-.975902-.58273-.764242-1.12141L13.936786,5.525049c1.309673-3.333148,4.525955-5.525049,8.107172-5.525049h4.824489c.343599,0,.650866.213936.770098.536185Z" },
  { name: "y", tone: "moon", x1: 23.302714, x2: 55.289163, y: 31.848088, step: 1, rise: 62, d: "M24.203027,16.334356h7.032697c.771886,0,1.462048.480879,1.729406,1.204984l2.225676,6.027956c.085925.232716.307732.387262.555804.387262h8.662512c.412397,0,.698645-.410827.555804-.797696l-2.224514-6.024808c-.142842-.386869.143406-.797696.555804-.797696h7.728396c.246223,0,.466782.152284.554033.38253l3.449938,9.104004c.981754,2.59074-.932258,5.362882-3.702778,5.362882h-12.686695c-.421137,0-.707824.427029-.548367.816811l3.032211,7.412072c.091092.222669.307787.368147.548367.368147h6.931707c.419608,0,.706242.424179.549711.813497l-2.571611,6.396059c-.090232.224423-.307828.371461-.549711.371461h-7.41728c-1.982725,0-3.766859-1.203529-4.509257-3.042018-2.687292-6.654862-8.986127-22.269587-10.739686-26.759109-.230344-.589733.204711-1.226336.837833-1.226336Z" },
  { name: "i", tone: "moon", x1: 53.868663, x2: 67.611733, y: 23.797686, step: 2, rise: 54, d: "M54.415095,16.333444h7.11554c.226313,0,.429161.139633.509953.351034l5.571145,14.57745h-7.908615c-.226313,0-.429161-.139633-.509953-.351034l-5.288023-13.836633c-.136594-.357413.127328-.740817.509953-.740817Z" },
  { name: "i", tone: "moon", x1: 64.732183, x2: 78.22861, y: 23.797686, step: 3, rise: 66, d: "M65.278615,16.333444h7.11554c.226313,0,.429161.139633.509953.351034l5.288023,13.836633c.136594.357413-.127328.740817-.509953.740817h-7.491336l-5.42218-14.187667c-.136594-.357413.127328-.740817.509953-.740817Z" },
  { name: "n", tone: "moon", x1: 74.38484, x2: 108.426665, y: 22.117814, step: 4, rise: 58, d: "M83.208382,13.771289l.615714,1.764566c.166659.477627.617185.797589,1.123054.797589h17.558536c.495079,0,.938391.306658,1.113013.769919l4.730437,12.549567c.293228.777916-.281667,1.608998-1.113013,1.608998h-7.356052c-.508477,0-.960722-.323217-1.125373-.804299l-1.95041-5.698772c-.16465-.481081-.616896-.804299-1.125373-.804299h-7.081756c-.820674,0-1.394786.811453-1.121646,1.585339l1.46003,4.136691c.27314.773886-.300972,1.585339-1.121646,1.585339h-6.323535c-.497044,0-.941681-.30906-1.114895-.774946l-5.915-15.909311c-.28892-.777095.285828-1.603971,1.114895-1.603971h6.509966c.505869,0,.956394.319962,1.123054.797589Z" },
  { name: "dot", tone: "sun", x1: 52.247167, x2: 60.257621, y: 11.840455, step: 2, rise: 52, d: "M58.657829,9.621366l1.545199,3.877044c.198342.497657-.168243,1.038387-.703969,1.038387h-5.315302c-.333656,0-.628056-.218225-.725075-.537464l-1.178263-3.877044c-.147938-.486785.216307-.978175.725075-.978175h4.948367c.310221,0,.589116.189075.703969.477252Z" },
  { name: "dot", tone: "sun", x1: 63.110687, x2: 71.121141, y: 11.840455, step: 3, rise: 64, d: "M69.521348,9.621366l1.545199,3.877044c.198342.497657-.168243,1.038387-.703969,1.038387h-5.315302c-.333656,0-.628056-.218225-.725075-.537464l-1.178263-3.877044c-.147938-.486785.216307-.978175.725075-.978175h4.948367c.310221,0,.589116.189075.703969.477252Z" },
] as const;

const STOPS = {
  sun: ["#ff9b2b", "#ffa624", "#fdd207"],
  moon: ["#f7f7f7", "#e5e5e5", "#ffffff"],
} as const;

export function AyiinFooterMark({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const leave = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.removeProperty("--mx");
    e.currentTarget.style.removeProperty("--my");
  };

  const gradients = GLYPHS.map((g, n) => (
    <linearGradient key={n} id={`${uid}-${n}`} x1={g.x1} x2={g.x2} y1={g.y} y2={g.y} gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor={STOPS[g.tone][0]} />
      <stop offset="0.54" stopColor={STOPS[g.tone][1]} />
      <stop offset="1" stopColor={STOPS[g.tone][2]} />
    </linearGradient>
  ));

  const glyphs = (outline: boolean) =>
    GLYPHS.map((g, n) => (
      <path
        key={n}
        d={g.d}
        className="ayiin-glyph"
        style={{ "--step": g.step, "--rise": `${g.rise}px`, "--tilt": `${n % 2 ? 6 : -6}deg` } as React.CSSProperties}
        fill={outline ? "none" : `url(#${uid}-${n})`}
        stroke={outline ? `url(#${uid}-${n})` : undefined}
        strokeWidth={outline ? 1.25 : undefined}
        vectorEffect={outline ? "non-scaling-stroke" : undefined}
      />
    ));

  return (
    <div
      ref={ref}
      aria-hidden
      data-in={inView}
      onPointerMove={move}
      onPointerLeave={leave}
      className={clsx("ayiin-footer-mark relative overflow-hidden p-1", className)}
    >
      <svg viewBox={VIEWBOX} className="block h-auto w-full overflow-visible">
        <defs>{gradients}</defs>
        {glyphs(true)}
      </svg>
      <svg viewBox={VIEWBOX} className="ayiin-footer-mark-fill pointer-events-none absolute inset-1 overflow-visible">
        {glyphs(false)}
      </svg>
    </div>
  );
}
