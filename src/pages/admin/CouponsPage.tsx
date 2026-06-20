import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  ActionMenu,
  AdminSourceBadge,
  ConfirmDialog,
  CouponFormDialog,
  DataTable,
  LoadingTableSkeleton,
  PageTitle,
  StatusBadge,
  type DataTableColumn,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { couponQueryKeys, useCoupons } from "@/hooks";
import { couponService } from "@/services";
import type { CouponInput } from "@/types/admin.types";
import type { CouponRow } from "@/types/database.types";
import { formatCurrency, formatDate } from "@/utils";

export function CouponsPage() {
  const queryClient = useQueryClient();
  const couponsQuery = useCoupons();
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<CouponRow | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<CouponRow | null>(null);
  const coupons = couponsQuery.data?.data ?? [];

  const saveMutation = useMutation({
    mutationFn: (input: CouponInput) =>
      selectedCoupon
        ? couponService.update(selectedCoupon.id, input)
        : couponService.create(input),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: couponQueryKeys.all });
      setEditorOpen(false);
      setSelectedCoupon(null);
      toast.success(selectedCoupon ? "Coupon updated." : "Coupon created.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The coupon could not be saved."),
  });

  const toggleMutation = useMutation({
    mutationFn: (coupon: CouponRow) =>
      couponService.update(coupon.id, { active: !coupon.active }),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: couponQueryKeys.all });
      toast.success("Coupon availability updated.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The coupon could not be updated."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => couponService.remove(id),
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: couponQueryKeys.all });
      setCouponToDelete(null);
      toast.success("Coupon deleted.", {
        description: response.warning?.message,
      });
    },
    onError: () => toast.error("The coupon could not be deleted."),
  });

  const columns = useMemo<DataTableColumn<CouponRow>[]>(
    () => [
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
      {
        header: "Actions",
        id: "actions",
        render: (coupon) => (
          <ActionMenu
            items={[
              {
                icon: Pencil,
                label: "Edit coupon",
                onSelect: () => {
                  setSelectedCoupon(coupon);
                  setEditorOpen(true);
                },
              },
              {
                icon: coupon.active ? EyeOff : Eye,
                label: coupon.active ? "Deactivate" : "Activate",
                onSelect: () => toggleMutation.mutate(coupon),
              },
              {
                destructive: true,
                icon: Trash2,
                label: "Delete coupon",
                onSelect: () => setCouponToDelete(coupon),
              },
            ]}
            label={`Actions for ${coupon.code}`}
          />
        ),
      },
    ],
    [toggleMutation],
  );

  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Button
            onClick={() => {
              setSelectedCoupon(null);
              setEditorOpen(true);
            }}
            size="md"
          >
            <Plus aria-hidden="true" size={17} />
            New coupon
          </Button>
        }
        description="Create and manage promotion rules for the storefront."
        title="Coupons"
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {coupons.length} coupons
        </p>
        <AdminSourceBadge source={couponsQuery.data?.source} />
      </div>
      {couponsQuery.isLoading ? (
        <LoadingTableSkeleton columns={7} rows={4} />
      ) : (
        <DataTable
          caption="Coupons"
          columns={columns}
          getRowKey={(coupon) => coupon.id}
          rows={coupons}
        />
      )}

      <CouponFormDialog
        coupon={selectedCoupon}
        coupons={coupons}
        isOpen={editorOpen}
        isSaving={saveMutation.isPending}
        onClose={() => {
          setEditorOpen(false);
          setSelectedCoupon(null);
        }}
        onSubmit={(input) => saveMutation.mutate(input)}
      />
      <ConfirmDialog
        confirmLabel={deleteMutation.isPending ? "Deleting..." : "Delete"}
        confirmDisabled={deleteMutation.isPending}
        description={`Delete coupon ${couponToDelete?.code ?? ""}? This cannot be undone.`}
        isOpen={couponToDelete !== null}
        onCancel={() => setCouponToDelete(null)}
        onConfirm={() => {
          if (couponToDelete) deleteMutation.mutate(couponToDelete.id);
        }}
        title="Delete coupon"
      />
    </div>
  );
}
