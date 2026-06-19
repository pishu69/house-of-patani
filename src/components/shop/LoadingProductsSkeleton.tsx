import { Skeleton } from "@/components/common/Skeleton";
import { ProductGrid } from "@/components/shop/ProductGrid";

interface LoadingProductsSkeletonProps {
  count?: number;
}

export function LoadingProductsSkeleton({
  count = 8,
}: LoadingProductsSkeletonProps) {
  return (
    <ProductGrid>
      {Array.from({ length: count }, (_, index) => (
        <div
          aria-hidden="true"
          className="overflow-hidden rounded-lg border border-maroon/10 bg-card p-4"
          key={index}
        >
          <Skeleton className="aspect-[4/5] w-full" />
          <Skeleton className="mt-5 h-7 w-3/4" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-2/3" />
          <Skeleton className="mt-5 h-11 w-full rounded-full" />
        </div>
      ))}
    </ProductGrid>
  );
}
