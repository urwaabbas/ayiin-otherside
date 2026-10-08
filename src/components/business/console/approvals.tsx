"use client";

import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { categories } from "@/lib/catalog/categories";
import { products } from "@/lib/catalog/products";
import { decide, ruleLabel, waitingOn } from "@/lib/b2b/policy";
import { line } from "@/lib/b2b/seed";
import type { ApprovalRule } from "@/lib/b2b/types";
import { ESCALATION_ID, memberName, useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { Icon } from "@/components/ui/icon";
import { Empty, PageHead, Panel, Segmented } from "@/components/business/console/ui";
import { MemberChip, RequestCard } from "@/components/business/console/records";

type Filter = "mine" | "open" | "decided";

export function ApprovalsView() {
  const ws = useWorkspace();
  const [filter, setFilter] = useState<Filter>("mine");
  const mine = waitingOn(ws.requisitions);
  const open = ws.requisitions.filter((r) => r.status === "pending");
  const decided = ws.requisitions.filter((r) => r.status !== "pending");
  const shown = filter === "mine" ? mine : filter === "open" ? open : decided;

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Control"
        title="Approvals"
        description="Your rules decide what needs approval. Everything else becomes a purchase order as soon as it's placed."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <Segmented
            label="Filter requests"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "mine", label: "Waiting on you", count: mine.length },
              { value: "open", label: "All open", count: open.length },
              { value: "decided", label: "Decided", count: decided.length },
            ]}
          />
          {shown.length ? (
            <div className="space-y-3">
              {shown.map((r) => (
                <RequestCard key={r.id} r={r} />
              ))}
            </div>
          ) : (
            <Panel>
              <Empty
                icon="approve"
                title={filter === "mine" ? "Nothing waiting on you" : "No requests here"}
                body={filter === "mine" ? "When someone orders outside their limit, the request lands here with everything you need to decide." : undefined}
              />
            </Panel>
          )}
        </div>
        <div className="space-y-6">
          <PolicyPanel />
          <Simulator />
        </div>
      </div>
    </div>
  );
}

function PolicyPanel() {
  const ws = useWorkspace();
  const approvers = ws.members.filter((m) => m.status === "active" && (m.role === "Admin" || m.role === "Approver"));
  return (
    <Panel title="Approval policy" meta="Checked top to bottom. The first match picks the approver">
      <ol className="space-y-2">
        {ws.rules.map((r, i) => (
          <RuleRow key={r.id} rule={r} index={i + 1} approvers={approvers} />
        ))}
      </ol>
      <div className="mt-5 space-y-2 border-t border-line pt-5 text-support">
        <p className="eyebrow">Always applies</p>
        <p className="flex gap-2.5 text-ink-2">
          <Icon name="check" size={16} className="mt-0.5 shrink-0 text-success" />
          No rule matched and within the buyer&apos;s own limit → ordered directly.
        </p>
        <p className="flex gap-2.5 text-ink-2">
          <Icon name="users" size={16} className="mt-0.5 shrink-0" />
          Over the buyer&apos;s limit → the cost centre owner approves.
        </p>
        <p className="flex gap-2.5 text-ink-2">
          <Icon name="shield" size={16} className="mt-0.5 shrink-0" />
          Nobody approves their own request — it escalates to {memberName(ws.members, ESCALATION_ID)}.
        </p>
      </div>
    </Panel>
  );
}

function RuleRow({ rule, index, approvers }: { rule: ApprovalRule; index: number; approvers: { id: string; name: string }[] }) {
  const ws = useWorkspace();
  const [draft, setDraft] = useState(String(rule.threshold ?? ""));
  return (
    <li className={clsx("rounded-surface border p-3.5 transition-colors", rule.enabled ? "border-line bg-white" : "border-dashed border-line-strong bg-porcelain")}>
      <div className="flex items-start gap-3">
        <span className="num mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mist text-meta">{index}</span>
        <div className="min-w-0 flex-1">
          <p className={clsx("text-support font-medium", !rule.enabled && "text-mute")}>{ruleLabel(rule, ws.costCenters)}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-meta text-mute">
            {rule.kind === "amount" && (
              <label className="flex items-center gap-1.5">
                Over
                <span className="relative">
                  <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-2">$</span>
                  <input
                    inputMode="numeric"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.replace(/\D/g, ""))}
                    onBlur={() => {
                      const n = Number(draft);
                      if (n > 0) ws.updateRule(rule.id, { threshold: n });
                      else setDraft(String(rule.threshold ?? ""));
                    }}
                    aria-label="Threshold"
                    className="field num !h-8 !w-24 !pl-5 !pr-2 !text-meta"
                  />
                </span>
              </label>
            )}
            <label className="flex items-center gap-1.5">
              →
              <select
                value={rule.approverId}
                onChange={(e) => ws.updateRule(rule.id, { approverId: e.target.value })}
                aria-label="Approver"
                className="field !h-8 !w-auto !px-2 !text-meta"
              >
                {approvers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <Switch on={rule.enabled} onChange={() => ws.toggleRule(rule.id)} label={`${rule.enabled ? "Disable" : "Enable"} rule ${index}`} />
      </div>
    </li>
  );
}

export function Switch({ on, onChange, label }: { on: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      className={clsx("relative h-6 w-10 shrink-0 rounded-full transition-colors duration-300", on ? "bg-ink" : "bg-line-strong")}
    >
      <span className={clsx("absolute top-1 h-4 w-4 rounded-full transition-all duration-300 ease-[var(--ease-out-expo)]", on ? "left-5 bg-brand" : "left-1 bg-white")} />
    </button>
  );
}

/** Try the policy before it bites: who would approve this purchase? */
function Simulator() {
  const ws = useWorkspace();
  const { fmt } = usePrefs();
  const buyers = ws.members.filter((m) => m.role !== "Finance");
  const [who, setWho] = useState("m-jamie");
  const [cat, setCat] = useState("supplies");
  const [amount, setAmount] = useState("1800");
  const requester = ws.members.find((m) => m.id === who) ?? ws.members[0];

  const result = useMemo(() => {
    const sample = products.find((p) => p.category === cat) ?? products[0];
    const l = line(sample.slug, 1);
    const total = Number(amount) || 0;
    const lines = [{ ...l, unit: total }];
    return decide({ requester, total, lines, costCenterId: requester.costCenterId, rules: ws.rules, costCenters: ws.costCenters });
  }, [cat, amount, requester, ws.rules, ws.costCenters]);

  return (
    <Panel title="Policy simulator" meta="See who signs off before anyone hits Place order">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="sim-who" className="field-label !text-meta">
            Buyer
          </label>
          <select id="sim-who" value={who} onChange={(e) => setWho(e.target.value)} className="field !h-10 !text-support">
            {buyers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="sim-cat" className="field-label !text-meta">
            Department
          </label>
          <select id="sim-cat" value={cat} onChange={(e) => setCat(e.target.value)} className="field !h-10 !text-support">
            {categories
              .filter((c) => c.business)
              .map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.short}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label htmlFor="sim-amt" className="field-label !text-meta">
            Order total
          </label>
          <input id="sim-amt" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} className="field num !h-10 !text-support" />
        </div>
      </div>
      <div
        aria-live="polite"
        className={clsx("mt-4 flex items-start gap-3 rounded-surface p-4", result.kind === "auto" ? "bg-success-soft" : "bg-porcelain ring-1 ring-line")}
      >
        <span className={clsx("grid h-9 w-9 shrink-0 place-items-center rounded-full", result.kind === "auto" ? "bg-success text-white" : "bg-ink text-brand")}>
          <Icon name={result.kind === "auto" ? "check" : "approve"} size={17} strokeWidth={2} />
        </span>
        <div className="min-w-0 text-support">
          {result.kind === "auto" ? (
            <>
              <p className="font-medium text-success">Ordered directly · {fmt(Math.round(Number(amount) || 0))}</p>
              <p className="mt-0.5 text-ink-2">{result.reason}. A purchase order is issued immediately.</p>
            </>
          ) : (
            <>
              <p className="flex flex-wrap items-center gap-x-2 font-medium">
                Needs approval from <MemberChip id={result.approverId} />
              </p>
              <p className="mt-0.5 text-ink-2">
                {result.reason}
                {result.escalated && ` · escalated, ${requester.name.split(" ")[0]} can't approve their own order`}.
                {result.approverId === VIEWER_ID && " That's you."}
              </p>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}
