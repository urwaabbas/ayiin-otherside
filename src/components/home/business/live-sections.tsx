"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ruleLabel, waitingOn } from "@/lib/b2b/policy";
import { memberName, useWorkspace, useWorkspaceReady } from "@/lib/b2b/workspace";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { RfqCard } from "@/components/business/console/quotes";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/primitives";

/** The most recent open quote request, live — replies keep arriving while you watch. */
export function RfqBoard() {
  const rfqs = useWorkspace((s) => s.rfqs);
  const rfq = rfqs.find((r) => r.status === "open") ?? rfqs[0];
  if (!rfq) return null;
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-3 -z-10 rounded-[24px] bg-white/[0.06] ring-1 ring-white/10 sm:-inset-5" />
      <RfqCard rfq={rfq} />
    </div>
  );
}

/** How the company is set up to buy — every tile reads the live workspace and opens its console. */
export function ControlGrid() {
  const ws = useWorkspace();
  const rules = ws.rules.filter((r) => r.enabled);
  const approvers = new Set(rules.map((r) => r.approverId));
  const pending = waitingOn(ws.requisitions).length;
  const activeMembers = ws.members.filter((m) => m.status === "active").length;
  const invited = ws.members.length - activeMembers;

  const tiles: {
    href: string;
    icon: IconName;
    title: string;
    body: string;
    stat: string;
    chips?: string[];
    wide?: boolean;
    dark?: boolean;
  }[] = [
    {
      href: "/business?tab=approvals",
      icon: "approve",
      title: "Approval rules",
      body: `${rules.length} rules, ${approvers.size} approvers. Routine orders go straight through. Larger ones wait for the right approver. Nobody approves their own spend.`,
      stat: pending ? `${pending} waiting on you` : "Inbox zero",
      chips: rules.map((r) => `${ruleLabel(r, ws.costCenters).replace("Anything charged to ", "").replace("Any ", "").replace(" purchase", "")} → ${memberName(ws.members, r.approverId).split(" ")[0]}`),
      wide: true,
      dark: true,
    },
    {
      href: "/business?tab=budgets",
      icon: "wallet",
      title: "Budgets",
      body: "Set a quarterly budget for each team. You are warned before anyone goes over.",
      stat: `${ws.costCenters.length} cost centres`,
    },
    {
      href: "/business?tab=team",
      icon: "users",
      title: "Roles and limits",
      body: "Choose what each person can order, and up to what amount.",
      stat: `${activeMembers} members${invited ? ` · ${invited} invited` : ""}`,
    },
    {
      href: "/business?tab=addresses",
      icon: "pin",
      title: "Delivery sites",
      body: "Ship to any office or warehouse. Dock hours and receiving notes go on every order.",
      stat: `${ws.locations.length} locations`,
    },
    {
      href: "/business?tab=spend",
      icon: "trend",
      title: "Spend reports",
      body: "See spend by month, team and supplier. Savings are measured against real list prices.",
      stat: `${ws.pos.length} purchase orders tracked`,
    },
    {
      href: "/business?tab=invoices",
      icon: "receipt",
      title: "Invoices",
      body: "One statement for every supplier, matched to your POs. Tax exemption on file, and finance can import it.",
      stat: `${ws.invoices.filter((i) => i.status !== "paid").length} open invoices`,
      chips: ["NetSuite", "QuickBooks", "Coupa", "SAP Ariba", "CSV"],
      wide: true,
    },
    {
      href: "/business?tab=quotes",
      icon: "file",
      title: "Quotes",
      body: "One request goes to every qualified supplier, so the best price is easy to spot.",
      stat: `${ws.rfqs.filter((r) => r.status === "open").length} open requests`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-[clamp(0.5rem,1.6svh,1rem)]">
      {tiles.map((t, i) => (
        <Reveal key={t.title} delay={i * 50} className={t.wide ? "lg:col-span-2" : ""}>
          <Link
            href={t.href}
            className={clsx(
              "group flex h-full flex-col rounded-surface p-6 transition-shadow duration-300 sm:p-7 lg:p-[clamp(0.75rem,1.8svh,1.75rem)]",
              t.dark ? "panel-ink" : "bg-white shadow-[var(--shadow-hair)] hover:shadow-[var(--shadow-soft)]",
            )}
          >
            <div className="flex items-center gap-3">
              <span className={clsx("grid h-11 w-11 shrink-0 place-items-center rounded-control lg:h-[clamp(2rem,4.6svh,2.75rem)] lg:w-[clamp(2rem,4.6svh,2.75rem)]", t.dark ? "bg-graphite-2 text-brand" : "bg-mist")}>
                <Icon name={t.icon} size={20} />
              </span>
              <p className="min-w-0 flex-1 text-emphasis font-medium tracking-[-0.02em]">{t.title}</p>
              <span className={clsx("hidden shrink-0 items-center gap-1.5 text-meta sm:flex", t.dark ? "text-mute-dark group-hover:text-porcelain" : "text-mute group-hover:text-ink")}>
                {t.stat} <Icon name="arrowUpRight" size={14} />
              </span>
            </div>
            <p className={clsx("mt-3 max-w-xl text-support leading-relaxed lg:mt-[clamp(0.25rem,1.2svh,0.75rem)] lg:line-clamp-2 xl:line-clamp-none", t.dark ? "text-mute-dark" : "text-mute")}>{t.body}</p>
            <p className={clsx("mt-2 text-meta sm:hidden", t.dark ? "text-mute-dark" : "text-mute")}>{t.stat}</p>
            {t.chips && (
              <div className="mt-auto flex flex-wrap gap-2 pt-5 lg:pt-[clamp(0.5rem,1.6svh,1.25rem)] [@media(min-width:1024px)_and_(max-height:820px)]:hidden">
                {t.chips.map((c) => (
                  <span key={c} className={clsx("rounded-full px-3 py-1.5 text-meta", t.dark ? "bg-graphite-2 text-porcelain" : "bg-mist text-ink-2")}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </Link>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * How a purchase moves through the company, with the live count at each stage.
 * Request → approval rule → purchase order → invoice → payment; every stage opens its console view.
 */
export function FlowStrip() {
  const ws = useWorkspace();
  const ready = useWorkspaceReady();
  const stages: { href: string; icon: IconName; title: string; body: string; n: number; unit: string }[] = [
    { href: "/business?tab=approvals", icon: "list", title: "Request", body: "Anyone on the team asks for what they need.", n: ws.requisitions.filter((r) => r.status === "pending").length, unit: "pending company-wide" },
    { href: "/business?tab=approvals", icon: "approve", title: "Approve", body: "Larger or unusual orders go to the right approver.", n: ws.rules.filter((r) => r.enabled).length, unit: "rules watching spend" },
    { href: "/business?tab=orders", icon: "box", title: "Order", body: "Approved requests become purchase orders.", n: ws.pos.filter((p) => p.status !== "delivered").length, unit: "orders in transit" },
    { href: "/business?tab=invoices", icon: "receipt", title: "Invoice", body: "Invoices match the PO. Pay on net terms.", n: ws.invoices.filter((i) => i.status !== "paid").length, unit: "invoices open" },
    { href: "/business?tab=invoices", icon: "wallet", title: "Pay", body: "Pay by ACH, card or wire.", n: ws.invoices.filter((i) => i.status === "paid").length, unit: "invoices paid" },
  ];
  return (
    <Stagger as="ol" gap={0.1} className="relative grid gap-3 lg:grid-cols-5">
      <span aria-hidden className="pointer-events-none absolute left-[10%] right-[10%] top-[34px] hidden h-px bg-line-strong lg:block" />
      {stages.map((s, i) => (
        <StaggerItem as="li" key={s.title}>
          <Link href={s.href} className="group relative flex h-full flex-col rounded-surface bg-white p-5 shadow-[var(--shadow-hair)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
            <span className="flex items-center justify-between">
              <span className="relative grid h-11 w-11 place-items-center rounded-full bg-ink text-brand transition-transform duration-300 group-hover:scale-105">
                <Icon name={s.icon} size={19} />
              </span>
              <span className="num text-meta text-mute">0{i + 1}</span>
            </span>
            <span className="mt-5 text-emphasis font-medium tracking-[-0.02em]">{s.title}</span>
            <span className="mt-1.5 text-support leading-relaxed text-mute">{s.body}</span>
            <span className="mt-auto flex items-baseline gap-2 border-t border-line pt-4 text-meta text-ink-2">
              <span className="display text-section tabular-nums text-ink">{ready ? <CountUp value={s.n} /> : "–"}</span>
              {s.unit}
            </span>
          </Link>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
