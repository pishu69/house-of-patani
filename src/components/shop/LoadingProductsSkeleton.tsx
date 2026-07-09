import { Skeleton } from "@/components/common/Skeleton";
import { ProductGrid } from "@/components/shop/ProductGrid";

interface LoadingProductsSkeletonProps {
  count?: number;
}

export function LoadingProductsSkeleton({
  count = 8,
}: LoadingProductsSkeletonProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      <ProductGrid>
        {Array.from({ length: count }, (_, index) => (
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-lg border border-maroon/10 bg-card p-3 shadow-lift sm:p-4"
            key={index}
          >
            <Skeleton className="aspect-[4/5] w-full rounded-md" />

            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-10 w-full rounded-full" />
            </div>
          </div>
        ))}
      </ProductGrid>
    </div>
  );
}
