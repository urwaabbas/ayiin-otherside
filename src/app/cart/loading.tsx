import { Loading, PageHeaderSkeleton, SplitSkeleton } from "@/components/ui/skeleton";

export default function CartLoading() {
  return (
    <Loading label="Loading bag" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <SplitSkeleton />
    </Loading>
  );
}
