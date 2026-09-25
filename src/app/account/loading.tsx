import { Loading, PageHeaderSkeleton, PanelsSkeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <Loading label="Loading account" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <PanelsSkeleton count={3} className="md:grid-cols-3" />
    </Loading>
  );
}
