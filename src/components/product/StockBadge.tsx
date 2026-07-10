import { Badge } from "@/components/common/Badge";
import { cn } from "@/lib/utils";

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
}

const labels: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

const badgeStyles: Record<StockStatus, string> = {
  "in-stock": "border border-emerald-900/10 bg-emerald-900/5 text-emerald-800",
  "low-stock": "border border-gold/25 bg-gold/10 text-charcoal",
  "out-of-stock": "border border-destructive/15 bg-destructive/5 text-destructive",
};

export function StockBadge({ status }: StockBadgeProps) {
  return (
    <Badge
      className={cn(
        "px-2 py-0.5 text-[10px] font-semibold leading-4",
        badgeStyles[status],
      )}
      variant="ghost"
    >
      {labels[status]}
    </Badge>
  );
}
