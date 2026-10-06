"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { forecastQuarter, pacing, quarterLabel, quarterProgress, quarterSpend } from "@/lib/b2b/policy";
import type { CostCenter } from "@/lib/b2b/types";
import { useWorkspace } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";
import { Badge, PageHead, Panel, Stat } from "@/components/business/console/ui";
import { MemberChip } from "@/components/business/console/records";

export function BudgetsView({ go }: { go: (id: string, extra?: string) => void }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const pace = quarterProgress();
  const budget = ws.costCenters.reduce((s, c) => s + c.budget, 0);
  const spent = quarterSpend(ws.pos);
  const pending = ws.requisitions.filter((r) => r.status === "pending").reduce((s, r) => s + r.total, 0);

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow={`Control · ${quarterLabel()}`}
        title="Budgets"
        description="Quarterly budgets per cost centre. Spend counts the moment a purchase order is issued; pending requests show what's about to land."
      />
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Quarter budget" value={fmt(Math.round(budget))} foot={`${ws.costCenters.length} cost centres`} />
        <Stat label="Spent" value={fmt(Math.round(spent))} foot={`${Math.round((spent / budget) * 100)}% used · ${Math.round(pace * 100)}% of quarter gone`} />
        <Stat label="Pending approval" value={fmt(Math.round(pending))} foot="Committed if approved" onClick={() => go("approvals")} />
        <Stat tone="ink" label="Remaining" value={fmt(Math.round(Math.max(0, budget - spent)))} foot={`If every request is approved: ${fmt(Math.round(Math.max(0, budget - spent - pending)))}`} />
      </dl>
      <div className="grid gap-4 lg:grid-cols-2">
        {ws.costCenters.map((c) => (
          <BudgetCard key={c.id} c={c} pace={pace} />
        ))}
      </div>
    </div>
  );
}

function BudgetCard({ c, pace }: { c: CostCenter; pace: number }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(c.budget));
  const spent = quarterSpend(ws.pos, c.id);
  const pending = ws.requisitions.filter((r) => r.status === "pending" && r.costCenterId === c.id).reduce((s, r) => s + r.total, 0);
  const forecast = forecastQuarter(spent);
  const status = pacing(spent, c.budget);
  const orders = ws.pos.filter((p) => p.costCenterId === c.id).length;

  return (
    <Panel>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="num text-meta text-mute">CC-{c.code}</p>
          <h3 className="mt-0.5 text-emphasis font-medium tracking-[-0.02em]">{c.name}</h3>
          <div className="mt-2 text-meta text-mute">
            <MemberChip id={c.ownerId} /> <span className="sr-only">owns this budget</span>
          </div>
        </div>
        <Badge tone={status === "over" ? "warning" : status === "under" ? "neutral" : "success"} dot>
          {status === "over" ? "Ahead of pace" : status === "under" ? "Under-using" : "On track"}
        </Badge>
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-meta text-mute">Spent this quarter</p>
          <p className="num mt-1 text-heading font-medium leading-none tracking-[-0.03em]">{fmt(Math.round(spent))}</p>
        </div>
        {editing ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(draft);
              if (n > 0) {
                ws.setBudget(c.id, n);
                notify(`${c.name} budget updated`, `${fmt(Math.round(n))} for ${quarterLabel()}`, false);
              }
              setEditing(false);
            }}
            className="flex items-center gap-1.5"
          >
            <label htmlFor={`b-${c.id}`} className="sr-only">
              Quarterly budget
            </label>
            <input id={`b-${c.id}`} autoFocus inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))} className="field num !h-9 !w-28 !text-support" />
            <button type="submit" className="btn btn-primary !h-9 !px-3 !text-support">
              Save
            </button>
          </form>
        ) : (
          <button type="button" onClick={() => {
              setDraft(String(c.budget));
              setEditing(true);
            }} className="group text-right">
            <p className="text-meta text-mute">Budget</p>
            <p className="num mt-1 flex items-center gap-1.5 text-body font-medium group-hover:underline">
              {fmt(Math.round(c.budget))} <Icon name="sliders" size={14} className="text-mute" />
            </p>
          </button>
        )}
      </div>

      {/* Spent, then pending stacked after it */}
      <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-mist" role="img" aria-label={`${fmt(Math.round(spent))} spent and ${fmt(Math.round(pending))} pending of ${fmt(Math.round(c.budget))}`}>
        <div className={clsx("absolute inset-y-0 left-0 rounded-full", spent > c.budget ? "bg-danger" : "bg-ink")} style={{ width: `${Math.min(100, (spent / c.budget) * 100)}%` }} />
        {pending > 0 && (
          <div
            className="absolute inset-y-0 rounded-r-full bg-brand [background-image:repeating-linear-gradient(135deg,transparent_0_3px,rgb(255_255_255/0.55)_3px_5px)]"
            style={{ left: `${Math.min(100, (spent / c.budget) * 100)}%`, width: `${Math.min(100 - Math.min(100, (spent / c.budget) * 100), (pending / c.budget) * 100)}%` }}
          />
        )}
        <span aria-hidden className="absolute inset-y-0 w-0.5 bg-ink/40" style={{ left: `${pace * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-meta text-mute">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink" /> Spent
        </span>
        {pending > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-brand" /> Pending {fmt(Math.round(pending))}
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-0.5 bg-ink/40" /> Today
        </span>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-support">
        <div>
          <dt className="text-meta text-mute">Remaining</dt>
          <dd className="num mt-0.5 font-medium">{fmt(Math.round(Math.max(0, c.budget - spent)))}</dd>
        </div>
        <div>
          <dt className="text-meta text-mute">Forecast</dt>
          <dd className={clsx("num mt-0.5 font-medium", status === "over" && "text-warning")}>{fmt(Math.round(forecast))}</dd>
        </div>
        <div>
          <dt className="text-meta text-mute">Orders · all time</dt>
          <dd className="num mt-0.5 font-medium">{orders}</dd>
        </div>
      </dl>
    </Panel>
  );
}
