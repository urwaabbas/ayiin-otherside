import { Loading, PageHeaderSkeleton, PanelsSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function BusinessLoading() {
  return (
    <Loading label="Loading procurement hub" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <div className="mt-8 flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 !rounded-full" />
        ))}
      </div>
      <PanelsSkeleton count={4} />
    </Loading>
  );
}
