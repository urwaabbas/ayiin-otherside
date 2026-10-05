"use client";

import { clsx } from "clsx";
import { useState } from "react";
import type { Approval } from "@/lib/business";
import { Icon } from "@/components/ui/icon";
import { usePrefs } from "@/components/providers";
import { useUI } from "@/lib/store";

export function ApprovalQueue({
  items,
  tone = "light",
  detailed = false,
}: {
  items: Approval[];
  tone?: "light" | "dark";
  detailed?: boolean;
}) {
  const { fmt } = usePrefs();
  const notify = useUI((s) => s.notify);
  const [state, setState] = useState<Record<string, "approved" | "declined">>(
    {},
  );
  const dark = tone === "dark";

  const act = (a: Approval, s: "approved" | "declined") => {
    setState((prev) => ({ ...prev, [a.id]: s }));
    notify(
      s === "approved"
        ? `${a.id} approved`
        : `${a.id} returned to ${a.requester.split(" ")[0]}`,
      s === "approved"
        ? `PO issued · ${fmt(a.total, { cents: true })} on Net 30`
        : "They'll see your note and can resubmit.",
    );
  };

  return (
    <ul className="space-y-2">
      {items.map((a) => {
        const done = state[a.id];
        return (
          <li
            key={a.id}
            className={clsx(
              "rounded-surface p-3.5 transition-opacity",
              dark
                ? "bg-graphite ring-1 ring-graphite-line"
                : "bg-white shadow-[var(--shadow-hair)]",
              done && "opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={clsx(
                    "truncate text-support font-medium",
                    dark && "text-porcelain",
                  )}
                >
                  {a.urgency === "high" && (
                    <span className="mr-1.5 inline-block h-1.5 w-1.5 -translate-y-0.5 rounded-full bg-brand" />
                  )}
                  {a.title}
                </p>
                <p
                  className={clsx(
                    "truncate text-meta",
                    dark ? "text-mute-dark" : "text-mute",
                  )}
                >
                  {a.id} · {a.requester} · {a.submitted}
                  {detailed && ` · ${a.costCenter}`}
                </p>
                {detailed && (
                  <p
                    className={clsx(
                      "mt-1 text-meta",
                      dark ? "text-mute-dark" : "text-ink-2",
                    )}
                  >
                    <Icon
                      name="info"
                      size={12}
                      className="mr-1 inline -translate-y-px"
                    />
                    Rule: {a.rule}
                  </p>
                )}
              </div>
              <p
                className={clsx(
                  "num shrink-0 text-support font-medium",
                  dark && "text-porcelain",
                )}
              >
                {fmt(a.total, { cents: true })}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {done ? (
                <span
                  className={clsx(
                    "inline-flex items-center gap-1.5 text-meta",
                    dark ? "text-brand" : "text-success",
                  )}
                >
                  <Icon
                    name={done === "approved" ? "check" : "returns"}
                    size={14}
                  />{" "}
                  {done === "approved"
                    ? "Approved · PO issued"
                    : "Returned for changes"}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => act(a, "approved")}
                    className="btn btn-primary"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => act(a, "declined")}
                    className="btn btn-ghost"
                  >
                    Return
                  </button>
                  <span
                    className={clsx(
                      "ml-auto text-meta",
                      dark ? "text-mute-dark" : "text-mute",
                    )}
                  >
                    {a.items} {a.items === 1 ? "item" : "items"}
                  </span>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
