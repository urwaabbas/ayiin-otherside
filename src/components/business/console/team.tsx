"use client";

import { clsx } from "clsx";
import { useState } from "react";
import { quarterStart } from "@/lib/b2b/policy";
import type { Member, Role } from "@/lib/b2b/types";
import { useWorkspace, VIEWER_ID } from "@/lib/b2b/workspace";
import { usePrefs } from "@/components/providers";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";
import { Avatar, Badge, PageHead, Panel, td, th } from "@/components/business/console/ui";

const ROLES: { role: Role; does: string }[] = [
  { role: "Admin", does: "Everything, including policy, budgets and billing" },
  { role: "Approver", does: "Approves requests routed to them; buys without a limit" },
  { role: "Buyer", does: "Orders directly up to their limit" },
  { role: "Requester", does: "Builds carts; every order goes for approval" },
  { role: "Finance", does: "Invoices, statements and payments only" },
];

const LIMITS: { v: string; label: string; value: number | null }[] = [
  { v: "0", label: "Needs approval", value: 0 },
  { v: "500", label: "$500 / order", value: 500 },
  { v: "1000", label: "$1,000 / order", value: 1000 },
  { v: "2500", label: "$2,500 / order", value: 2500 },
  { v: "5000", label: "$5,000 / order", value: 5000 },
  { v: "none", label: "No limit", value: null },
];
const limitKey = (l: number | null) => (l === null ? "none" : String(l));

export function TeamView() {
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("Requester");
  const [cc, setCc] = useState(ws.costCenters[0].id);
  const [error, setError] = useState("");

  const invite = (e: React.FormEvent) => {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(v)) return setError("Enter a work email address.");
    if (ws.members.some((m) => m.email === v)) return setError("That person is already on the team.");
    ws.invite({ email: v, role, costCenterId: cc });
    notify("Invite sent", `${v} joins as ${role} · they'll get a sign-in link`, false);
    setEmail("");
    setError("");
  };

  return (
    <div className="space-y-6">
      <PageHead eyebrow="Control" title="Team" description="One company account. Everyone buys within the limit and team budget you set." />

      <Panel title="Invite a teammate">
        <form onSubmit={invite} noValidate className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-end">
          <div>
            <label htmlFor="inv-email" className="field-label">
              Work email
            </label>
            <input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="name@northwind.studio"
              aria-invalid={!!error}
              aria-describedby={error ? "inv-err" : undefined}
              className={clsx("field !h-11", error && "!border-danger")}
            />
          </div>
          <div>
            <label htmlFor="inv-role" className="field-label">
              Role
            </label>
            <select id="inv-role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="field !h-11">
              {ROLES.map((r) => (
                <option key={r.role}>{r.role}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="inv-cc" className="field-label">
              Cost centre
            </label>
            <select id="inv-cc" value={cc} onChange={(e) => setCc(e.target.value)} className="field !h-11">
              {ws.costCenters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn btn-primary !h-11">
            <Icon name="plus" size={16} /> Send invite
          </button>
          {error && (
            <p id="inv-err" className="text-meta text-danger md:col-span-4">
              {error}
            </p>
          )}
          <p className="text-meta text-mute md:col-span-4">{ROLES.find((r) => r.role === role)?.does}.</p>
        </form>
      </Panel>

      <Panel flush title={`${ws.members.length} members`} meta="Changes apply to the next order they place">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-support">
            <thead className="border-b border-line">
              <tr>
                <th className={th}>Member</th>
                <th className={th}>Role</th>
                <th className={th}>Per-order limit</th>
                <th className={th}>Cost centre</th>
                <th className={clsx(th, "text-right")}>Spend this quarter</th>
                <th className={th}>
                  <span className="sr-only">Remove</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {ws.members.map((m) => (
                <MemberRow key={m.id} m={m} />
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function MemberRow({ m }: { m: Member }) {
  const { fmt } = usePrefs();
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const self = m.id === VIEWER_ID;
  const start = quarterStart().getTime();
  const spend = ws.pos.filter((p) => p.buyerId === m.id && Date.parse(p.createdAt) >= start).reduce((s, p) => s + p.total, 0);
  const sel = "field !h-9 !w-auto !min-w-[150px] !px-2.5 !text-support disabled:!bg-transparent disabled:!border-transparent disabled:!text-ink-2 disabled:!px-0";

  return (
    <tr className="border-t border-line first:border-t-0">
      <td className={td}>
        <div className="flex items-center gap-3">
          <Avatar initials={m.initials} tone={m.role === "Admin" ? "ink" : "soft"} />
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium">
              {m.name}
              {self && <Badge>You</Badge>}
              {m.status === "invited" && <Badge tone="brand">Invited</Badge>}
            </p>
            <p className="truncate text-meta text-mute">
              {m.email} · {m.title}
            </p>
          </div>
        </div>
      </td>
      <td className={td}>
        <select
          aria-label={`Role for ${m.name}`}
          value={m.role}
          disabled={self}
          onChange={(e) => {
            const role = e.target.value as Role;
            ws.updateMember(m.id, { role, limit: role === "Admin" || role === "Approver" ? null : role === "Requester" || role === "Finance" ? 0 : (m.limit ?? 2500) || 2500 });
            notify(`${m.name.split(" ")[0]} is now ${role === "Admin" ? "an" : "a"} ${role}`, undefined, false);
          }}
          className={sel}
        >
          {ROLES.map((r) => (
            <option key={r.role}>{r.role}</option>
          ))}
        </select>
      </td>
      <td className={td}>
        <select
          aria-label={`Order limit for ${m.name}`}
          value={limitKey(m.limit)}
          disabled={self || m.role === "Finance"}
          onChange={(e) => ws.updateMember(m.id, { limit: LIMITS.find((l) => l.v === e.target.value)!.value })}
          className={sel}
        >
          {LIMITS.map((l) => (
            <option key={l.v} value={l.v}>
              {l.label}
            </option>
          ))}
        </select>
      </td>
      <td className={td}>
        <select aria-label={`Cost centre for ${m.name}`} value={m.costCenterId} onChange={(e) => ws.updateMember(m.id, { costCenterId: e.target.value })} className={sel}>
          {ws.costCenters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </td>
      <td className={clsx(td, "num text-right")}>{spend ? fmt(Math.round(spend)) : <span className="text-mute">—</span>}</td>
      <td className={clsx(td, "w-12 text-right")}>
        {!self && (
          <button
            type="button"
            aria-label={m.status === "invited" ? `Revoke invite for ${m.name}` : `Remove ${m.name}`}
            onClick={() => {
              ws.removeMember(m.id);
              notify(m.status === "invited" ? "Invite revoked" : `${m.name} removed`, "Their open requests stay in the approval queue.", false);
            }}
            className="grid h-8 w-8 place-items-center rounded-full text-mute hover:bg-mist hover:text-danger"
          >
            <Icon name="trash" size={15} />
          </button>
        )}
      </td>
    </tr>
  );
}
