import { Loading, ProductPageSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
  return (
    <Loading label="Loading product" className="shell pt-6 lg:pt-8">
      <Skeleton className="mb-6 h-3 w-56" />
      <ProductPageSkeleton />
    </Loading>
  );
}
