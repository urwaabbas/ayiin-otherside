import { Loading, PageHeaderSkeleton, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function SearchLoading() {
  return (
    <Loading label="Searching" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton wide />
      <div className="mt-6 flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-32 !rounded-full" />
        ))}
      </div>
      <div className="mt-12">
        <ProductGridSkeleton count={8} />
      </div>
    </Loading>
  );
}
