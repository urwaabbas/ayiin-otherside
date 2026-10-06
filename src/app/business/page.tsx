import type { Metadata } from "next";
import { Suspense } from "react";
import { ConsoleEntry } from "@/components/business/console/console-entry";

export const metadata: Metadata = {
  title: "Ayiin Business",
  description: "Approvals, purchase orders, quotes, budgets, invoices and spend — the procurement console on Ayiin.",
};

export default function BusinessPage() {
  return (
    <div className="shell pt-2 lg:pt-4">
      <Suspense>
        <ConsoleEntry />
      </Suspense>
    </div>
  );
}
