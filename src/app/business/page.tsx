import type { Metadata } from "next";
import { Suspense } from "react";
import { BusinessHub } from "@/components/business/business-hub";
import { company } from "@/lib/business";

export const metadata: Metadata = {
  title: "Ayiin Business",
  description: "Volume pricing, multi-supplier quotes, approvals, purchase orders and net terms — procurement on Ayiin.",
};

export default function BusinessPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Ayiin Business · {company.name}</p>
          <h1 className="display mt-3 text-[48px] sm:text-[80px]">Procurement, handled.</h1>
        </div>
        <div className="flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-[var(--shadow-hair)]">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-ink font-mono text-[12px] text-porcelain">PR</span>
          <span className="text-[13px]">
            <span className="block font-medium">Priya Raman</span>
            <span className="block text-mute">Admin · {company.terms}</span>
          </span>
        </div>
      </div>
      <Suspense fallback={<div className="mt-10 h-[600px] rounded-[26px] bg-mist" />}>
        <BusinessHub />
      </Suspense>
    </div>
  );
}
