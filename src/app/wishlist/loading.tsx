import { Loading, PageHeaderSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function WishlistLoading() {
  return (
    <Loading label="Loading saved items" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton />
      <div className="mt-10">
        <ProductGridSkeleton count={4} />
      </div>
    </Loading>
  );
}
