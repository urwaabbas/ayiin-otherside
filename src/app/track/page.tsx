import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackView } from "@/components/checkout/track-view";

export const metadata: Metadata = { title: "Track order" };

export default function TrackPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <p className="eyebrow">Track order</p>
      <h1 className="display mt-3 text-[48px] sm:text-[80px]">Where it is, exactly.</h1>
      <Suspense fallback={<div className="mt-10 h-[400px] rounded-[28px] bg-mist" />}>
        <TrackView />
      </Suspense>
    </div>
  );
}
