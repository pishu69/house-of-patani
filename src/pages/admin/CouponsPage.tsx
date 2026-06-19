import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  AdminSourceBadge,
  DataTable,
  LoadingTableSkeleton,
  PageTitle,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useCoupons } from "@/hooks";
import type { CouponRow } from "@/types/database.types";
import { formatCurrency, formatDate } from "@/utils";

const columns: DataTableColumn<CouponRow>[] = [
  {
    header: "Code",
    id: "code",
    render: (coupon) => (
      <span className="font-semibold tracking-wide text-charcoal">
        {coupon.code}
      </span>
    ),
  },
  {
    header: "Offer",
    id: "offer",
    render: (coupon) =>
      coupon.type === "percentage"
        ? `${coupon.value}% off`
        : `${formatCurrency(coupon.value)} off`,
  },
  {
    header: "Minimum order",
    id: "minimum",
    render: (coupon) => formatCurrency(coupon.minimum_order_value),
  },
  {
    header: "Usage",
    id: "usage",
    render: (coupon) =>
      `${coupon.used_count} / ${coupon.usage_limit ?? "Unlimited"}`,
  },
  {
    header: "Expires",
    id: "expires",
    render: (coupon) =>
      coupon.expires_at ? formatDate(coupon.expires_at) : "No expiry",
  },
  {
    header: "Status",
    id: "status",
    render: (coupon) => (
      <StatusBadge
        label={coupon.active ? "Active" : "Inactive"}
        tone={coupon.active ? "positive" : "neutral"}
      />
    ),
  },
];

export function CouponsPage() {
  const couponsQuery = useCoupons();
  const coupons = couponsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Button
            onClick={() =>
              toast.info("Coupon creation will be enabled in Phase 7B.")
            }
            size="md"
          >
            <Plus aria-hidden="true" size={17} />
            New coupon
          </Button>
        }
        description="A campaign workspace prepared for promotion management."
        title="Coupons"
      />
      <div className="flex justify-end">
        <AdminSourceBadge source={couponsQuery.data?.source} />
      </div>
      {couponsQuery.isLoading ? (
        <LoadingTableSkeleton columns={6} rows={4} />
      ) : (
        <DataTable
          caption="Coupons"
          columns={columns}
          getRowKey={(coupon) => coupon.id}
          rows={coupons}
        />
      )}
    </div>
  );
}
