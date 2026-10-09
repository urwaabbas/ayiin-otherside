"use client";

import { Suspense } from "react";
import { AccountCommandCenter } from "@/components/account/account-command-center";
import { Loading, Skeleton } from "@/components/ui/skeleton";

export function AccountView() {
  return (
    <div className="mt-8">
      <Suspense
        fallback={
          <Loading label="Loading Account..." className="space-y-6">
            <Skeleton className="h-44 w-full !rounded-panel" />
            <Skeleton className="h-12 w-96 !rounded-control" />
            <Skeleton className="h-64 w-full !rounded-surface" />
          </Loading>
        }
      >
        <AccountCommandCenter />
      </Suspense>
    </div>
  );
}
