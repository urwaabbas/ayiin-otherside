"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export function SellForm() {
  const [done, setDone] = useState(false);
  if (done)
    return (
      <div className="rounded-[28px] bg-white p-8 text-center shadow-[var(--shadow-hair)]">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-lime shadow-[inset_0_0_0_1.5px_#0A0B0D]">
          <Icon name="check" size={20} strokeWidth={2.4} />
        </span>
        <p className="mt-4 text-[18px] font-medium">Application received</p>
        <p className="mt-1 text-[14px] text-mute">Verification usually takes 2 business days. We&apos;ll email next steps.</p>
      </div>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (e.currentTarget.checkValidity()) setDone(true);
      }}
      className="grid gap-4 rounded-[28px] bg-white p-6 shadow-[var(--shadow-hair)] sm:grid-cols-2 sm:p-8"
    >
      <div>
        <label htmlFor="biz" className="field-label">Business name</label>
        <input id="biz" required className="field" />
      </div>
      <div>
        <label htmlFor="web" className="field-label">Website or store</label>
        <input id="web" type="url" placeholder="https://" className="field" />
      </div>
      <div>
        <label htmlFor="sell-email" className="field-label">Work email</label>
        <input id="sell-email" type="email" required className="field" />
      </div>
      <div>
        <label htmlFor="cat" className="field-label">Main category</label>
        <select id="cat" className="field">
          {["Audio & Tech", "Home & Living", "Kitchen & Coffee", "Fashion & Carry", "Beauty & Wellness", "Office & Workspace", "Packaging & Supplies", "Safety & Facility"].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2.5 text-[14px] sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-ink" /> I also sell wholesale / to businesses
      </label>
      <button type="submit" className="btn btn-ink sm:col-span-2">Apply to sell</button>
    </form>
  );
}
