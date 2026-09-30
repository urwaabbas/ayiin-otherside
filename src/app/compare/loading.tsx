import { Loading, PageHeaderSkeleton, PanelsSkeleton } from "@/components/ui/skeleton";

export default function CompareLoading() {
  return (
    <Loading label="Loading comparison" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <PanelsSkeleton count={4} />
    </Loading>
  );
}
