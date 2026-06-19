import { Badge } from "@/components/common/Badge";

type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

interface StockBadgeProps {
  status: StockStatus;
}

const labels: Record<StockStatus, string> = {
  "in-stock": "In stock",
  "low-stock": "Low stock",
  "out-of-stock": "Out of stock",
};

export function StockBadge({ status }: StockBadgeProps) {
  return (
    <Badge
      variant={status === "out-of-stock" ? "destructive" : "secondary"}
    >
      {labels[status]}
    </Badge>
  );
}
