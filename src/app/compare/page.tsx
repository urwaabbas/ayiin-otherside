import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/compare/compare-view";
import { PanelsSkeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Compare</p>
      <h1 className="display mt-3 text-display-sm sm:text-display-lg">Side by side, honestly.</h1>
      <p className="mt-4 max-w-xl text-body text-mute">Strongest value on each line is marked. Turn on “Differences only” to hide everything that&apos;s the same.</p>
      <Suspense fallback={<PanelsSkeleton count={4} />}>
        <CompareView />
      </Suspense>
    </div>
  );
}
