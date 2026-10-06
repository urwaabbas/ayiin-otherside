"use client";

import Link from "next/link";
import { clsx } from "clsx";
import { ruleLabel, waitingOn } from "@/lib/b2b/policy";
import { memberName, useWorkspace } from "@/lib/b2b/workspace";
import { Icon, type IconName } from "@/components/ui/icon";
import { Reveal } from "@/components/ui/reveal";
import { RfqCard } from "@/components/business/console/quotes";

/** The most recent open quote request, live — replies keep arriving while you watch. */
export function RfqBoard() {
  const rfqs = useWorkspace((s) => s.rfqs);
  const rfq = rfqs.find((r) => r.status === "open") ?? rfqs[0];
  if (!rfq) return null;
  return (
    <div className="relative">
      <div aria-hidden className="absolute -inset-3 -z-10 rounded-[24px] bg-mist sm:-inset-5" />
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
      title: "Approval policy that fits your org",
      body: `${rules.length} rules, ${approvers.size} approvers. Routine orders go straight to a PO; anything unusual waits for the right person. Nobody approves their own spend.`,
      stat: pending ? `${pending} waiting on you` : "Inbox zero",
      chips: rules.map((r) => `${ruleLabel(r, ws.costCenters).replace("Anything charged to ", "").replace("Any ", "").replace(" purchase", "")} → ${memberName(ws.members, r.approverId).split(" ")[0]}`),
      wide: true,
      dark: true,
    },
    {
      href: "/business?tab=budgets",
      icon: "wallet",
      title: "Budgets that pace themselves",
      body: "Quarterly budgets per cost centre, with a forecast that warns you before a team overspends.",
      stat: `${ws.costCenters.length} cost centres`,
    },
    {
      href: "/business?tab=team",
      icon: "users",
      title: "Roles and limits per person",
      body: "Admins, approvers, buyers and requesters — each with a per-order limit you set.",
      stat: `${activeMembers} members${invited ? ` · ${invited} invited` : ""}`,
    },
    {
      href: "/business?tab=addresses",
      icon: "pin",
      title: "Every site, one account",
      body: "Ship to HQ, warehouses or studios. Dock hours and receiving notes travel with every PO.",
      stat: `${ws.locations.length} locations`,
    },
    {
      href: "/business?tab=spend",
      icon: "trend",
      title: "Spend you can explain",
      body: "By month, department and supplier, with savings measured against real list prices.",
      stat: `${ws.pos.length} purchase orders tracked`,
    },
    {
      href: "/business?tab=invoices",
      icon: "receipt",
      title: "One statement, every supplier",
      body: "Net terms, PO-matched invoices, tax exemption on file, and a statement finance can import.",
      stat: `${ws.invoices.filter((i) => i.status !== "paid").length} open invoices`,
      chips: ["NetSuite", "QuickBooks", "Coupa", "SAP Ariba", "CSV"],
      wide: true,
    },
    {
      href: "/business?tab=quotes",
      icon: "file",
      title: "Quotes that compete",
      body: "One request reaches every qualified supplier. Replies are normalised so the best offer is obvious.",
      stat: `${ws.rfqs.filter((r) => r.status === "open").length} open requests`,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tiles.map((t, i) => (
        <Reveal key={t.title} delay={i * 50} className={t.wide ? "lg:col-span-2" : ""}>
          <Link
            href={t.href}
            className={clsx(
              "group flex h-full flex-col rounded-surface p-6 transition-shadow duration-300 sm:p-7",
              t.dark ? "panel-ink" : "bg-white shadow-[var(--shadow-hair)] hover:shadow-[var(--shadow-soft)]",
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <span className={clsx("grid h-11 w-11 place-items-center rounded-control", t.dark ? "bg-graphite-2 text-brand" : "bg-mist")}>
                <Icon name={t.icon} size={20} />
              </span>
              <span className={clsx("flex items-center gap-1.5 text-meta", t.dark ? "text-mute-dark group-hover:text-porcelain" : "text-mute group-hover:text-ink")}>
                {t.stat} <Icon name="arrowUpRight" size={14} />
              </span>
            </div>
            <p className="mt-6 text-emphasis font-medium tracking-[-0.02em]">{t.title}</p>
            <p className={clsx("mt-1.5 max-w-xl text-support leading-relaxed", t.dark ? "text-mute-dark" : "text-mute")}>{t.body}</p>
            {t.chips && (
              <div className="mt-auto flex flex-wrap gap-2 pt-5">
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
