import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmationView } from "@/components/checkout/confirmation-view";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false } };

export default function ConfirmationPage() {
  return (
    <div className="shell pt-6 lg:pt-8">
      <Suspense fallback={<div className="mt-10 h-[500px] rounded-[28px] bg-mist" />}>
        <ConfirmationView />
      </Suspense>
    </div>
  );
}
