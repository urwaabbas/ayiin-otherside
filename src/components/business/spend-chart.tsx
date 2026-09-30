"use client";

import { useState } from "react";
import { usePrefs } from "@/components/providers";

/**
 * Monthly spend — single series, so one hue (ink) with the current month in the brand amber.
 * Columns ≤ 24px, 4px rounded caps, square at the baseline; hairline solid gridlines;
 * value labelled on the latest cap only; hover tooltip per column; table fallback for AT.
 */
export function SpendChart({ data }: { data: { m: string; v: number }[] }) {
  const { fmt } = usePrefs();
  const [hover, setHover] = useState<number | null>(null);
  const W = 560;
  const H = 220;
  const padL = 44;
  const padB = 28;
  const padT = 26;
  const top = Math.ceil(Math.max(...data.map((d) => d.v)) / 5000) * 5000;
  const ticks = Array.from({ length: top / 5000 + 1 }, (_, i) => i * 5000);
  const band = (W - padL) / data.length;
  const bw = Math.min(24, band * 0.45);
  const y = (v: number) => padT + (1 - v / top) * (H - padT - padB);
  const last = data.length - 1;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Monthly spend, ${data[0].m} to ${data[last].m}. Latest ${fmt(data[last].v)}.`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" className="fill-mute" fontFamily="var(--font-geist-mono)">
              {t === 0 ? "0" : `${t / 1000}k`}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const cx = padL + band * i + band / 2;
          const x = cx - bw / 2;
          const yt = y(d.v);
          const yb = y(0);
          const r = 4;
          const path = `M${x} ${yb}V${yt + r}Q${x} ${yt} ${x + r} ${yt}H${x + bw - r}Q${x + bw} ${yt} ${x + bw} ${yt + r}V${yb}Z`;
          return (
            <g key={d.m} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={cx - band / 2} y={padT} width={band} height={H - padT - padB} fill="transparent" />
              <path d={path} opacity={hover == null || hover === i ? 1 : 0.35} strokeWidth={i === last ? 1.5 : 0} className={`transition-opacity ${i === last ? "fill-brand stroke-ink" : "fill-ink"}`} />
              <text x={cx} y={H - 8} textAnchor="middle" fontSize="11.5" className="fill-mute">
                {d.m}
              </text>
              {i === last && (
                <text x={cx} y={yt - 8} textAnchor="middle" fontSize="12" fontWeight="500" className="fill-ink">
                  {fmt(d.v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-xl bg-ink px-3 py-2 text-[12px] text-porcelain shadow-[var(--shadow-float)]"
          style={{ left: `${((padL + band * hover + band / 2) / W) * 100}%`, top: `${(y(data[hover].v) / H) * 100 - 22}%` }}
        >
          <span className="text-mute-dark">{data[hover].m} 2026</span> · <span className="num">{fmt(data[hover].v)}</span>
        </div>
      )}
      <table className="sr-only">
        <caption>Monthly spend</caption>
        <tbody>
          {data.map((d) => (
            <tr key={d.m}>
              <th scope="row">{d.m}</th>
              <td>{fmt(d.v)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
