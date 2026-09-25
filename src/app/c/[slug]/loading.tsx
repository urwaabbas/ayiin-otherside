import { Loading, ProductGridSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CategoryLoading() {
  return (
    <Loading label="Loading category" className="shell pt-6 lg:pt-8">
      <Skeleton className="h-3 w-40" />
      <div className="mt-6 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-16 w-4/5 sm:h-24" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <div className="flex gap-2 pt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 !rounded-full" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[220px] w-full !rounded-[28px]" />
      </div>
      <div className="mt-12 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
        <ProductGridSkeleton count={9} cols="grid-cols-2 xl:grid-cols-3" />
      </div>
    </Loading>
  );
}
