"use client";

import dynamic from "next/dynamic";
import { Loading, PageHeaderSkeleton, PanelsSkeleton } from "@/components/ui/skeleton";

/**
 * The console is per-company, per-user state that lives in the browser, so it is
 * rendered on the client only — after saved data has loaded — rather than
 * server-rendered with placeholder figures and patched up afterwards.
 */
export const ConsoleEntry = dynamic(() => import("@/components/business/console/console").then((m) => m.Console), {
  ssr: false,
  loading: () => (
    <Loading label="Loading procurement console" className="mt-8">
      <PageHeaderSkeleton />
      <PanelsSkeleton count={4} />
    </Loading>
  ),
});
