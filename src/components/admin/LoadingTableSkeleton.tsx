import { Skeleton } from "@/components/common/Skeleton";

interface LoadingTableSkeletonProps {
  columns?: number;
  rows?: number;
}

export function LoadingTableSkeleton({
  columns = 5,
  rows = 6,
}: LoadingTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-maroon/10 bg-card">
      <div
        className="grid gap-4 border-b border-maroon/10 bg-linen/60 p-4"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton className="h-4" key={index} />
        ))}
      </div>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          className="grid gap-4 border-b border-maroon/10 p-4 last:border-b-0"
          key={rowIndex}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }, (_, columnIndex) => (
            <Skeleton className="h-5" key={columnIndex} />
          ))}
        </div>
      ))}
    </div>
  );
}
