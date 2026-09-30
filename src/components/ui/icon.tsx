import type { SVGProps } from "react";

/* Ayiin icon set — 24px grid, 1.6 stroke, rounded joins. Drawn to sit with Geist. */
const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 4.5 4.5" /></>,
  bag: <><path d="M5 8.5h14l-1 11.2a1.5 1.5 0 0 1-1.5 1.3h-9a1.5 1.5 0 0 1-1.5-1.3Z" /><path d="M8.5 8.5V7a3.5 3.5 0 0 1 7 0v1.5" /></>,
  heart: <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />,
  user: <><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h10" /></>,
  close: <><path d="m6 6 12 12" /><path d="M18 6 6 18" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronUp: <path d="m6 15 6-6 6 6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  chevronLeft: <path d="m15 6-6 6 6 6" />,
  arrowRight: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
  arrowUpRight: <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>,
  plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  star: <path d="m12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8Z" />,
  truck: <><path d="M3 6.5h11v10H3z" /><path d="M14 10h4l3 3v3.5h-7" /><circle cx="7" cy="17.5" r="1.8" /><circle cx="17.5" cy="17.5" r="1.8" /></>,
  returns: <><path d="M4 12a8 8 0 1 0 2.4-5.7" /><path d="M4 4v4.5h4.5" /></>,
  shield: <><path d="M12 3.5 19 6v5.5c0 4.4-3 7.7-7 9-4-1.3-7-4.6-7-9V6Z" /><path d="m9 12 2 2 4-4" /></>,
  sparkle: <><path d="M11 3.5c.7 4.6 2.6 6.6 7.5 7.5-4.9.9-6.8 2.9-7.5 7.5-.7-4.6-2.6-6.6-7.5-7.5 4.9-.9 6.8-2.9 7.5-7.5Z" /><path d="M18.5 3v3.5M16.75 4.75h3.5" /></>,
  bolt: <path d="M13 3 5 13.5h6L10.5 21 19 10h-6Z" />,
  box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z" /><path d="m4 7.5 8 4.5 8-4.5" /><path d="M12 12v9" /></>,
  building: <><path d="M5 21V5l8-2v18" /><path d="M13 8h6v13" /><path d="M3 21h18" /><path d="M8.5 8h1M8.5 12h1M8.5 16h1M16 12h.5M16 16h.5" /></>,
  list: <><path d="M9 6.5h11M9 12h11M9 17.5h11" /><circle cx="4.8" cy="6.5" r=".6" fill="currentColor" /><circle cx="4.8" cy="12" r=".6" fill="currentColor" /><circle cx="4.8" cy="17.5" r=".6" fill="currentColor" /></>,
  file: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4" /><path d="M9 12h6M9 16h4" /></>,
  users: <><circle cx="9" cy="9" r="3" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 6.2a3 3 0 0 1 0 5.6" /><path d="M17.5 14.2A5.5 5.5 0 0 1 20.5 19" /></>,
  repeat: <><path d="M17 3l3 3-3 3" /><path d="M4 11V9a3 3 0 0 1 3-3h13" /><path d="m7 21-3-3 3-3" /><path d="M20 13v2a3 3 0 0 1-3 3H4" /></>,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></>,
  rows: <><rect x="4" y="4.5" width="16" height="6" rx="1.5" /><rect x="4" y="13.5" width="16" height="6" rx="1.5" /></>,
  compare: <><rect x="3.5" y="5" width="7" height="14" rx="1.5" /><rect x="13.5" y="5" width="7" height="14" rx="1.5" /><path d="M7 9h0M17 9h0" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.5 2.6 3.5 5.5 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.5-3.5-8.5s1-5.9 3.5-8.5Z" /></>,
  help: <><circle cx="12" cy="12" r="8.5" /><path d="M9.6 9.5a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6" /><path d="M12 17h.01" /></>,
  pin: <><path d="M12 21s6.5-5.8 6.5-11a6.5 6.5 0 0 0-13 0c0 5.2 6.5 11 6.5 11Z" /><circle cx="12" cy="10" r="2.3" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  tag: <><path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0Z" /><circle cx="8" cy="8" r="1.4" /></>,
  trash: <><path d="M4.5 7h15" /><path d="M9.5 7V4.5h5V7" /><path d="m6.5 7 .9 12.2a1.5 1.5 0 0 0 1.5 1.3h6.2a1.5 1.5 0 0 0 1.5-1.3L17.5 7" /></>,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 9.5h18" /><path d="M7 15h3" /></>,
  chat: <path d="M4.5 18.5 5.8 15A7.5 7.5 0 1 1 9 18.2Z" />,
  bell: <><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15Z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>,
  trend: <><path d="m3.5 16.5 5-5 4 4 7.5-7.5" /><path d="M15 8h5v5" /></>,
  leaf: <><path d="M5 19c0-8 5-13.5 14.5-14-0.5 9.5-6 14.5-14 14Z" /><path d="M5 19 13 11" /></>,
  receipt: <><path d="M6 3.5h12v17l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z" /><path d="M9 8h6M9 11.5h6M9 15h3" /></>,
  expand: <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" /><circle cx="12" cy="12" r="2.8" /></>,
  share: <><path d="M12 15V3.5" /><path d="m7.5 8 4.5-4.5L16.5 8" /><path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" /></>,
  home: <><path d="M4 10.5 12 4l8 6.5V20H4Z" /><path d="M9.5 20v-5.5h5V20" /></>,
  layers: <><path d="m12 3.5 8.5 4.5-8.5 4.5L3.5 8Z" /><path d="m3.5 12 8.5 4.5 8.5-4.5" /><path d="m3.5 16 8.5 4.5 8.5-4.5" /></>,
  scan: <><path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" /><path d="M8 9v6M11 9v6M14 9v6M17 9v6" /></>,
  upload: <><path d="M12 15.5V4" /><path d="m7.5 8.5 4.5-4.5 4.5 4.5" /><path d="M4 15.5v3A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5v-3" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M8.5 3v4M15.5 3v4" /></>,
  percent: <><path d="M19 5 5 19" /><circle cx="7" cy="7" r="2.2" /><circle cx="17" cy="17" r="2.2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5.5" /><path d="M12 7.6h.01" /></>,
  more: <><circle cx="6" cy="12" r="1" fill="currentColor" /><circle cx="12" cy="12" r="1" fill="currentColor" /><circle cx="18" cy="12" r="1" fill="currentColor" /></>,
  wand: <><path d="m4 20 11-11" /><path d="m13.5 7.5 3 3" /><path d="M18 3v3M16.5 4.5h3M20 9v2M19 10h2M9 3v2M8 4h2" /></>,
  approve: <><circle cx="12" cy="12" r="8.5" /><path d="m8.5 12.2 2.4 2.4 4.8-4.9" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><path d="M4 7.5V18a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5Z" /><circle cx="16" cy="14.5" r="1.2" fill="currentColor" /></>,
  store: <><path d="M4.5 9.5V20h15V9.5" /><path d="M3 9.5 5 4h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" /><path d="M9.5 20v-5h5v5" /></>,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, size = 20, strokeWidth = 1.6, ...rest }: { name: IconName; size?: number; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
