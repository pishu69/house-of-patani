import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  couponFormSchema,
  type CouponFormValues,
} from "@/lib/admin-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import type { CouponInput } from "@/types/admin.types";
import type { CouponRow } from "@/types/database.types";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/common/IconButton";
import { FormFieldError } from "@/components/admin/FormFieldError";

interface CouponFormDialogProps {
  coupon: CouponRow | null;
  coupons: CouponRow[];
  isOpen: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: CouponInput) => void;
}

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";

const defaults: CouponFormValues = {
  active: true,
  code: "",
  expiresAt: "",
  minimumOrderValue: 0,
  type: "percentage",
  usageLimit: 0,
  value: 10,
};

export function CouponFormDialog({
  coupon,
  coupons,
  isOpen,
  isSaving,
  onClose,
  onSubmit,
}: CouponFormDialogProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
    watch,
  } = useForm<CouponFormValues>({ defaultValues: defaults });
  const type = watch("type");

  useEffect(() => {
    if (!isOpen) return;

    reset(
      coupon
        ? {
            active: coupon.active,
            code: coupon.code,
            expiresAt: coupon.expires_at?.slice(0, 10) ?? "",
            minimumOrderValue: coupon.minimum_order_value,
            type: coupon.type,
            usageLimit: coupon.usage_limit ?? 0,
            value: coupon.value,
          }
        : defaults,
    );

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [coupon, isOpen, onClose, reset]);

  if (!isOpen) return null;

  function submitForm(values: CouponFormValues) {
    const result = couponFormSchema.safeParse(values);

    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    const duplicateCode = coupons.some(
      (item) =>
        item.code.toLowerCase() === result.data.code.toLowerCase() &&
        item.id !== coupon?.id,
    );

    if (duplicateCode) {
      setError("code", { message: "This coupon code is already in use." });
      return;
    }

    onSubmit({
      active: result.data.active,
      code: result.data.code.toUpperCase(),
      expiresAt: result.data.expiresAt
        ? new Date(`${result.data.expiresAt}T23:59:59`).toISOString()
        : null,
      minimumOrderValue: result.data.minimumOrderValue,
      type: result.data.type,
      usageLimit:
        result.data.usageLimit > 0 ? result.data.usageLimit : null,
      value: result.data.value,
    });
  }

  return (
    <div
      aria-labelledby="coupon-dialog-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
    >
      <form
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-5 shadow-elegant sm:p-6"
        noValidate
        onSubmit={handleSubmit(submitForm)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl" id="coupon-dialog-title">
              {coupon ? "Edit coupon" : "New coupon"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure eligibility, value, usage, and availability.
            </p>
          </div>
          <IconButton
            aria-label="Close coupon form"
            autoFocus
            onClick={onClose}
            size="sm"
          >
            <X aria-hidden="true" size={18} />
          </IconButton>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-charcoal">
            Coupon code
            <input
              className={inputClassName}
              placeholder="HERITAGE10"
              {...register("code")}
            />
            <FormFieldError message={errors.code?.message} />
          </label>
          <label className="text-sm font-medium text-charcoal">
            Discount type
            <select className={inputClassName} {...register("type")}>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed amount</option>
            </select>
            <FormFieldError message={errors.type?.message} />
          </label>
          <label className="text-sm font-medium text-charcoal">
            {type === "percentage" ? "Percentage value" : "Amount"}
            <input
              className={inputClassName}
              min="0"
              step="0.01"
              type="number"
              {...register("value", { valueAsNumber: true })}
            />
            <FormFieldError message={errors.value?.message} />
          </label>
          <label className="text-sm font-medium text-charcoal">
            Minimum order value
            <input
              className={inputClassName}
              min="0"
              step="0.01"
              type="number"
              {...register("minimumOrderValue", { valueAsNumber: true })}
            />
            <FormFieldError message={errors.minimumOrderValue?.message} />
          </label>
          <label className="text-sm font-medium text-charcoal">
            Usage limit
            <input
              className={inputClassName}
              min="0"
              placeholder="0 for unlimited"
              type="number"
              {...register("usageLimit", { valueAsNumber: true })}
            />
            <FormFieldError message={errors.usageLimit?.message} />
          </label>
          <label className="text-sm font-medium text-charcoal">
            Expiry date
            <input
              className={inputClassName}
              type="date"
              {...register("expiresAt")}
            />
            <FormFieldError message={errors.expiresAt?.message} />
          </label>
          <label className="flex items-center justify-between gap-4 rounded-md border border-maroon/10 bg-background px-4 py-3 text-sm font-medium text-charcoal sm:col-span-2">
            Coupon active
            <input
              className="h-4 w-4 accent-maroon"
              type="checkbox"
              {...register("active")}
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose} variant="ghost">
            Cancel
          </Button>
          <Button disabled={isSaving} type="submit">
            {isSaving ? "Saving..." : "Save coupon"}
          </Button>
        </div>
      </form>
    </div>
  );
}
