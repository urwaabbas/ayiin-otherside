"use client";

import { useState } from "react";
import { useWorkspace } from "@/lib/b2b/workspace";
import { useUI } from "@/lib/store";
import { Icon } from "@/components/ui/icon";
import { Badge, Drawer, PageHead, Panel } from "@/components/business/console/ui";

const EMPTY = { label: "", line: "", city: "", contact: "", notes: "" };

export function LocationsView() {
  const ws = useWorkspace();
  const notify = useUI((s) => s.notify);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [tried, setTried] = useState(false);
  const missing = (k: keyof typeof EMPTY) => tried && !form[k].trim();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    setTried(true);
    if (!form.label.trim() || !form.line.trim() || !form.city.trim()) return;
    ws.addLocation({ label: form.label.trim(), line: form.line.trim(), city: form.city.trim(), contact: form.contact.trim() || "Reception", notes: form.notes.trim() });
    notify("Location added", `${form.label.trim()} is now available at checkout and on quotes.`, false);
    setForm(EMPTY);
    setTried(false);
    setOpen(false);
  };

  const field = (k: keyof typeof EMPTY, label: string, placeholder: string, required = false) => (
    <div>
      <label htmlFor={`loc-${k}`} className="field-label">
        {label} {!required && <span className="font-normal text-mute">(optional)</span>}
      </label>
      <input
        id={`loc-${k}`}
        value={form[k]}
        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
        placeholder={placeholder}
        aria-invalid={missing(k)}
        className={missing(k) ? "field !border-danger" : "field"}
      />
      {required && missing(k) && <p className="mt-1 text-meta text-danger">Required.</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHead
        eyebrow="Control"
        title="Locations"
        description="Ship any order to any site. Receiving notes and dock hours travel with every purchase order, so the driver knows before they arrive."
        actions={
          <button type="button" onClick={() => setOpen(true)} className="btn btn-primary">
            <Icon name="plus" size={16} /> Add location
          </button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {ws.locations.map((l) => {
          const orders = ws.pos.filter((p) => p.locationId === l.id).length;
          return (
            <Panel key={l.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-control bg-mist">
                  <Icon name="pin" size={18} />
                </span>
                {l.isDefault ? <Badge tone="ink">Default</Badge> : <span className="num text-meta text-mute">{orders} orders</span>}
              </div>
              <p className="mt-4 text-body font-medium">{l.label}</p>
              <p className="mt-1 text-support text-ink-2">
                {l.line}
                <br />
                {l.city}
              </p>
              <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-meta">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-mute">Contact</dt>
                  <dd className="text-ink-2">{l.contact}</dd>
                </div>
                {l.notes && (
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-mute">Receiving</dt>
                    <dd className="text-ink-2">{l.notes}</dd>
                  </div>
                )}
              </dl>
              {!l.isDefault && (
                <div className="mt-auto flex gap-2 pt-5">
                  <button
                    type="button"
                    onClick={() => {
                      ws.setDefaultLocation(l.id);
                      notify("Default location changed", `New orders ship to ${l.label} unless you choose otherwise.`, false);
                    }}
                    className="btn btn-secondary !h-9 !text-support"
                  >
                    Make default
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      ws.removeLocation(l.id);
                      notify("Location removed", l.label, false);
                    }}
                    className="btn btn-ghost !h-9 !text-support text-mute"
                  >
                    Remove
                  </button>
                </div>
              )}
            </Panel>
          );
        })}
      </div>

      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Locations"
        title="Add a location"
        footer={
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost">
              Cancel
            </button>
            <button type="submit" form="loc-form" className="btn btn-primary">
              Save location
            </button>
          </div>
        }
      >
        <form id="loc-form" onSubmit={save} noValidate className="space-y-4">
          {field("label", "Name", "e.g. Studio — Austin", true)}
          {field("line", "Street address", "Building, street, unit", true)}
          {field("city", "City, state, ZIP", "Austin, TX 78701", true)}
          {field("contact", "Receiving contact", "Name or desk")}
          {field("notes", "Receiving notes", "Dock hours, access codes, lift…")}
          <p className="text-meta text-mute">Addresses are verified with the carrier before the first shipment.</p>
        </form>
      </Drawer>
    </div>
  );
}
