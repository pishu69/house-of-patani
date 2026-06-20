import { LoaderCircle, X } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { FormFieldError } from "@/components/admin/FormFieldError";
import { IconButton } from "@/components/common/IconButton";
import { Button } from "@/components/ui/button";
import {
  customerAddressSchema,
  type CustomerAddressFormValues,
} from "@/lib/customer-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import type { CustomerAddress } from "@/types/customer-account.types";

interface AddressEditorProps {
  address?: CustomerAddress | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: CustomerAddressFormValues) => void;
}

const defaults: CustomerAddressFormValues = {
  city: "",
  country: "India",
  isDefault: false,
  label: "Home",
  line1: "",
  line2: "",
  postalCode: "",
  state: "",
};

export function AddressEditor({
  address,
  isOpen,
  onClose,
  onSave,
}: AddressEditorProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CustomerAddressFormValues>({ defaultValues: defaults });

  useEffect(() => {
    reset(
      address
        ? {
            city: address.city,
            country: address.country,
            isDefault: address.isDefault,
            label: address.label,
            line1: address.line1,
            line2: address.line2,
            postalCode: address.postalCode,
            state: address.state,
          }
        : defaults,
    );
  }, [address, isOpen, reset]);

  if (!isOpen) return null;

  function submit(values: CustomerAddressFormValues) {
    const result = customerAddressSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }
    onSave(result.data);
  }

  const fieldClass =
    "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm font-normal text-charcoal";

  return (
    <div
      aria-labelledby="address-editor-title"
      aria-modal="true"
      className="fixed inset-0 z-[80] flex items-center justify-center bg-charcoal/50 p-4"
      role="dialog"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-elegant sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Saved address</p>
            <h2 className="mt-2 text-3xl" id="address-editor-title">
              {address ? "Edit address" : "Add an address"}
            </h2>
          </div>
          <IconButton aria-label="Close address form" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </IconButton>
        </div>
        <form
          className="mt-6 grid gap-5 sm:grid-cols-2"
          noValidate
          onSubmit={handleSubmit(submit)}
        >
          <label className="text-sm font-semibold text-charcoal">
            Label
            <input className={fieldClass} {...register("label")} />
            <FormFieldError message={errors.label?.message} />
          </label>
          <label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold text-charcoal">
            <input
              className="h-4 w-4 accent-maroon"
              type="checkbox"
              {...register("isDefault")}
            />
            Use as default address
          </label>
          <label className="text-sm font-semibold text-charcoal sm:col-span-2">
            Address line 1
            <input className={fieldClass} {...register("line1")} />
            <FormFieldError message={errors.line1?.message} />
          </label>
          <label className="text-sm font-semibold text-charcoal sm:col-span-2">
            Address line 2
            <input className={fieldClass} {...register("line2")} />
            <FormFieldError message={errors.line2?.message} />
          </label>
          <label className="text-sm font-semibold text-charcoal">
            City
            <input className={fieldClass} {...register("city")} />
            <FormFieldError message={errors.city?.message} />
          </label>
          <label className="text-sm font-semibold text-charcoal">
            State
            <input className={fieldClass} {...register("state")} />
            <FormFieldError message={errors.state?.message} />
          </label>
          <label className="text-sm font-semibold text-charcoal">
            Pincode
            <input
              className={fieldClass}
              inputMode="numeric"
              maxLength={6}
              {...register("postalCode")}
            />
            <FormFieldError message={errors.postalCode?.message} />
          </label>
          <label className="text-sm font-semibold text-charcoal">
            Country
            <input className={fieldClass} {...register("country")} />
            <FormFieldError message={errors.country?.message} />
          </label>
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button onClick={onClose} variant="ghost">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? (
                <LoaderCircle className="animate-spin" size={17} />
              ) : null}
              Save address
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
