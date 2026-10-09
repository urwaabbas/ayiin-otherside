import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/checkout/account-view";
import { Loading, Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Customer Account · AYIIN Marketplace",
  description: "Manage orders, multi-brand shipments, saved pieces, delivery addresses, and security settings.",
};

export default function AccountPage() {
  return (
    <div className="shell pt-6 lg:pt-8 pb-20">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="eyebrow">Customer Command Center</p>
          <h1 className="display mt-1 text-2xl sm:text-3xl text-ink">
            Account Management
          </h1>
        </div>
      </div>

      <Suspense
        fallback={
          <Loading label="Loading Account" className="space-y-6">
            <Skeleton className="h-44 w-full !rounded-panel" />
            <Skeleton className="h-12 w-96 !rounded-control" />
            <Skeleton className="h-64 w-full !rounded-surface" />
          </Loading>
        }
      >
        <AccountView />
      </Suspense>
    </div>
  );
}
