import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareView } from "@/components/compare/compare-view";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Compare</p>
      <h1 className="display mt-3 text-[48px] sm:text-[80px]">Side by side, honestly.</h1>
      <p className="mt-4 max-w-xl text-[16px] text-mute">Strongest value on each line is marked. Turn on “Differences only” to hide everything that&apos;s the same.</p>
      <Suspense fallback={<div className="mt-10 h-[500px] rounded-[28px] bg-mist" />}>
        <CompareView />
      </Suspense>
    </div>
  );
}
