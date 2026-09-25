import { Loading, PageHeaderSkeleton, SplitSkeleton } from "@/components/ui/skeleton";

export default function CheckoutLoading() {
  return (
    <Loading label="Loading checkout" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <SplitSkeleton rows={4} tall />
    </Loading>
  );
}
