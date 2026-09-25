import { Loading, PageHeaderSkeleton, ProductGridSkeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <Loading label="Loading page" className="shell pt-6 lg:pt-8">
      <PageHeaderSkeleton wide />
      <div className="mt-12">
        <ProductGridSkeleton count={8} />
      </div>
    </Loading>
  );
}
