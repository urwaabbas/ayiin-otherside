"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { categories } from "@/lib/catalog/categories";
import { sellerById } from "@/lib/catalog/sellers";
import { readableOn } from "@/lib/color";
import { monthlySpend, quarterSpend, savings, spendBySupplier, listValue } from "@/lib/b2b/policy";
import { useWorkspace } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { Icon } from "@/components/ui/icon";
import { PageHead, Panel, Stat, downloadCsv, td, th } from "@/components/business/console/ui";

/**
 * Department colours: validated categorical order (dataviz reference slots 1–5),
 * assigned to the department, never to its rank — filtering never repaints.
 */
const SERIES: { slug: string; color: string }[] = [
  { slug: "audio-tech", color: "#2a78d6" },
  { slug: "supplies", color: "#eb6834" },
  { slug: "safety", color: "#1baf7a" },
  { slug: "office", color: "#eda100" },
  { slug: "kitchen", color: "#e87ba4" },
];
const nameOf = (slug: string) => categories.find((c) => c.slug === slug)?.short ?? slug;

export function SpendView() {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const months = monthlySpend(ws.pos);
  const [hidden, setHidden] = useState<string[]>([]);
  const visible = SERIES.filter((s) => !hidden.includes(s.slug));
  const total = months.reduce((s, m) => s + m.total, 0);
  const byDept = SERIES.map((s) => ({ ...s, v: months.reduce((a, m) => a + (m.byCategory[s.slug] ?? 0), 0) })).sort((a, b) => b.v - a.v);
  const suppliers = spendBySupplier(ws.pos);
  const supTotal = suppliers.reduce((s, [, v]) => s + v, 0);
  const saved = savings(ws.pos);
  const list = ws.pos.reduce((s, p) => s + listValue(p.lines), 0);
  const last = months[months.length - 1];
  const prev = months[months.length - 2];

  const exportCsv = () =>
    downloadCsv(`northwind-spend-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["Month", ...SERIES.map((s) => nameOf(s.slug)), "Total"],
      ...months.map((m) => [m.month, ...SERIES.map((s) => (m.byCategory[s.slug] ?? 0).toFixed(2)), m.total.toFixed(2)]),
    ]);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Track"
        title="Spend"
        description="Where the money goes, by month, team and supplier. Savings are measured against list price."
        actions={
          <button type="button" onClick={exportCsv} className="btn btn-secondary">
            <Icon name="upload" size={16} className="rotate-180" /> Export CSV
          </button>
        }
      />
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label={`${months.length}-month spend`} value={fmt(Math.round(total))} foot={`${fmt(Math.round(total / months.length))} a month on average`} />
        <Stat label={`${last.label} to date`} value={fmt(Math.round(last.total))} foot={prev ? `${prev.label}: ${fmt(Math.round(prev.total))}` : undefined} />
        <Stat label="This quarter" value={fmt(Math.round(quarterSpend(ws.pos)))} foot="Issued purchase orders" />
        <Stat tone="ink" label="Saved vs list" value={fmt(Math.round(saved))} foot={`${list ? Math.round((saved / list) * 100) : 0}% below list on tracked orders`} />
      </dl>

      <Panel title="Monthly spend by department" meta="Hover a month for the breakdown · click a department to hide it">
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Departments">
          {SERIES.map((s) => {
            const off = hidden.includes(s.slug);
            return (
              <button
                key={s.slug}
                type="button"
                aria-pressed={!off}
                onClick={() => setHidden((h) => (off ? h.filter((x) => x !== s.slug) : [...h, s.slug]))}
                className={clsx("chip !h-8 !text-meta", off && "opacity-50")}
              >
                <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: off ? "transparent" : s.color, boxShadow: off ? `inset 0 0 0 1.5px ${s.color}` : undefined }} />
                {nameOf(s.slug)}
              </button>
            );
          })}
        </div>
        <StackedBars months={months} series={visible} fmt={fmt} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="By department" meta={`${months[0].label} – ${last.label}`} flush>
          <table className="w-full text-support">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Department</th>
                <th className={clsx(th, "w-[40%]")}>
                  <span className="sr-only">Share</span>
                </th>
                <th className={clsx(th, "text-right")}>Spend</th>
              </tr>
            </thead>
            <tbody>
              {byDept.map((d) => (
                <tr key={d.slug} className="border-t border-line first:border-t-0">
                  <td className={td}>
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: d.color }} />
                      {nameOf(d.slug)}
                    </span>
                  </td>
                  <td className={td}>
                    <div className="h-2 rounded-full bg-mist">
                      <div className="h-2 rounded-full bg-ink" style={{ width: `${total ? (d.v / total) * 100 : 0}%` }} />
                    </div>
                  </td>
                  <td className={clsx(td, "num text-right")}>
                    {fmt(Math.round(d.v))} <span className="text-mute">· {total ? Math.round((d.v / total) * 100) : 0}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <Panel title="By supplier" meta="Purchase orders since August" flush>
          <table className="w-full text-support">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Supplier</th>
                <th className={clsx(th, "text-right")}>On time</th>
                <th className={clsx(th, "text-right")}>Spend</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(([id, v]) => {
                const s = sellerById(id);
                return (
                  <tr key={id} className="border-t border-line first:border-t-0">
                    <td className={td}>
                      <span className="flex items-center gap-2.5">
                        <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] font-medium" style={{ background: s.color, color: readableOn(s.color) }}>
                          {s.initials}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate">{s.name}</span>
                          <span className="block text-meta text-mute">{s.netTerms ?? "Card"}</span>
                        </span>
                      </span>
                    </td>
                    <td className={clsx(td, "num text-right text-ink-2")}>{s.onTime}%</td>
                    <td className={clsx(td, "num text-right")}>
                      {fmt(Math.round(v))} <span className="text-mute">· {Math.round((v / supTotal) * 100)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  );
}

type Month = ReturnType<typeof monthlySpend>[number];

function StackedBars({ months, series, fmt }: { months: Month[]; series: typeof SERIES; fmt: (n: number) => string }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 280;
  const padL = 48;
  const padB = 30;
  const padT = 16;
  const sums = months.map((m) => series.reduce((s, x) => s + (m.byCategory[x.slug] ?? 0), 0));
  const step = 5000;
  const top = Math.max(step, Math.ceil(Math.max(...sums, 1) / step) * step);
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const band = (W - padL) / months.length;
  const bw = Math.min(40, band * 0.5);
  const y = (v: number) => padT + (1 - v / top) * (H - padT - padB);
  const gap = 2;

  return (
    <figure className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Monthly spend by department, ${months[0].label} to ${months[months.length - 1].label}`}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} x2={W} y1={y(t)} y2={y(t)} className="stroke-line" strokeWidth="1" />
            <text x={padL - 10} y={y(t) + 4} textAnchor="end" fontSize="11" className="fill-mute" fontFamily="var(--font-geist-mono)">
              {t === 0 ? "0" : `${t / 1000}k`}
            </text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = padL + band * i + band / 2;
          const x = cx - bw / 2;
          let acc = 0;
          const segs = series
            .map((s) => ({ s, v: m.byCategory[s.slug] ?? 0 }))
            .filter((d) => d.v > 0);
          return (
            <g key={m.month} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} opacity={hover == null || hover === i ? 1 : 0.4} className="transition-opacity">
              <rect x={cx - band / 2} y={padT} width={band} height={H - padT - padB} fill="transparent" />
              {segs.map((d, j) => {
                const y0 = y(acc);
                acc += d.v;
                const y1 = y(acc);
                const isTop = j === segs.length - 1;
                const h = Math.max(0, y0 - y1 - (j > 0 ? gap : 0));
                const yy = y1;
                const r = isTop ? Math.min(4, h) : 0;
                const path = r
                  ? `M${x} ${yy + h}V${yy + r}Q${x} ${yy} ${x + r} ${yy}H${x + bw - r}Q${x + bw} ${yy} ${x + bw} ${yy + r}V${yy + h}Z`
                  : `M${x} ${yy}H${x + bw}V${yy + h}H${x}Z`;
                return <path key={d.s.slug} d={path} fill={d.s.color} />;
              })}
              <text x={cx} y={H - 9} textAnchor="middle" fontSize="11.5" className={hover === i ? "fill-ink" : "fill-mute"}>
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute z-10 w-48 -translate-x-1/2 rounded-control bg-ink p-3 text-meta text-porcelain shadow-[var(--shadow-float)]"
          style={{ left: `${Math.min(85, Math.max(15, ((padL + band * hover + band / 2) / W) * 100))}%`, top: 0 }}
        >
          <p className="flex justify-between font-medium">
            <span>{months[hover].label} 2026</span>
            <span className="num">{fmt(Math.round(sums[hover]))}</span>
          </p>
          <ul className="mt-2 space-y-1">
            {series
              .slice()
              .reverse()
              .map((s) => (
                <li key={s.slug} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-mute-dark">
                    <span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
                    {nameOf(s.slug)}
                  </span>
                  <span className="num">{fmt(Math.round(months[hover].byCategory[s.slug] ?? 0))}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
      <table className="sr-only">
        <caption>Monthly spend by department</caption>
        <thead>
          <tr>
            <th>Month</th>
            {series.map((s) => (
              <th key={s.slug}>{nameOf(s.slug)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map((m) => (
            <tr key={m.month}>
              <th scope="row">{m.label}</th>
              {series.map((s) => (
                <td key={s.slug}>{fmt(Math.round(m.byCategory[s.slug] ?? 0))}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
