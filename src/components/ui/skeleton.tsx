import { clsx } from "clsx";

/** Shimmering placeholder block. Decorative — wrap groups in <Loading> for a single announcement. */
export function Skeleton({ className, dark }: { className?: string; dark?: boolean }) {
  return <div aria-hidden className={clsx("shimmer rounded-control", dark && "shimmer-dark", className)} />;
}

export function Loading({ label = "Loading", children, className }: { label?: string; children: React.ReactNode; className?: string }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" className={className}>
      <span className="sr-only">{label}…</span>
      {children}
    </div>
  );
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/4.4] w-full !rounded-surface" />
      <div className="mt-3.5 space-y-2 px-1">
        <div className="flex justify-between gap-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="mt-3 h-5 w-16" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, cols = "grid-cols-2 lg:grid-cols-4" }: { count?: number; cols?: string }) {
  return (
    <div className={clsx("grid gap-x-4 gap-y-10", cols)}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex gap-4 rounded-surface bg-white p-3 shadow-[var(--shadow-hair)]">
      <Skeleton className="h-24 w-24 shrink-0 !rounded-surface sm:h-32 sm:w-32" />
      <div className="flex-1 space-y-2.5 py-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="hidden w-[240px] space-y-3 border-l border-line pl-5 pt-2 sm:block">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-full !rounded-full" />
      </div>
    </div>
  );
}

export function PageHeaderSkeleton({ wide }: { wide?: boolean }) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-3 w-28" />
      <Skeleton className={clsx("h-14 sm:h-20", wide ? "w-full max-w-4xl" : "w-2/3 max-w-2xl")} />
      <Skeleton className="h-4 w-full max-w-md" />
    </div>
  );
}

/** Product page: gallery + buy box */
export function ProductPageSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col-reverse gap-3 sm:flex-row lg:col-span-7">
        <div className="flex gap-2 sm:flex-col">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-[72px] !rounded-surface sm:w-[84px]" />
          ))}
        </div>
        <Skeleton className="aspect-square flex-1 !rounded-surface" />
      </div>
      <div className="space-y-4 lg:col-span-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-11/12" />
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-6 h-12 w-40" />
        <div className="flex gap-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 !rounded-full" />
          ))}
        </div>
        <Skeleton className="h-[148px] w-full !rounded-surface" />
        <div className="flex gap-3">
          <Skeleton className="h-12 flex-1 !rounded-full" />
          <Skeleton className="h-12 flex-1 !rounded-full" />
        </div>
        <Skeleton className="h-[120px] w-full !rounded-surface" />
      </div>
    </div>
  );
}

/** Two-column page: list of line items + summary panel (cart, checkout, confirmation) */
export function SplitSkeleton({ rows = 3, tall }: { rows?: number; tall?: boolean }) {
  return (
    <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 rounded-surface bg-white p-4 shadow-[var(--shadow-hair)]">
            <Skeleton className={clsx("shrink-0 !rounded-surface", tall ? "h-14 w-14" : "h-24 w-24 sm:h-28 sm:w-28")} />
            <div className="flex-1 space-y-2.5 py-1">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="hidden h-5 w-16 sm:block" />
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-surface bg-white p-6 shadow-[var(--shadow-hair)]">
        <Skeleton className="h-5 w-32" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
        <Skeleton className="!mt-6 h-12 w-full !rounded-full" />
      </div>
    </div>
  );
}

/** Generic panel grid (dashboards, compare) */
export function PanelsSkeleton({ count = 4, className = "md:grid-cols-2 lg:grid-cols-4" }: { count?: number; className?: string }) {
  return (
    <div className={clsx("mt-10 grid gap-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-surface bg-white p-5 shadow-[var(--shadow-hair)]">
          <Skeleton className="aspect-[4/3] w-full !rounded-surface" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
