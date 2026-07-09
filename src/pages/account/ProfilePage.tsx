import { Save } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormFieldError } from "@/components/admin/FormFieldError";
import { Button } from "@/components/ui/button";
import {
  customerProfileSchema,
  type CustomerProfileFormValues,
} from "@/lib/customer-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { customerAccountService } from "@/services";
import { useCustomerStore } from "@/stores/customer.store";

export function ProfilePage() {
  const profile = useCustomerStore((state) => state.profile);
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
    setError,
  } = useForm<CustomerProfileFormValues>({ defaultValues: profile });

  useEffect(() => {
    reset(profile);
  }, [profile, reset]);

  function submit(values: CustomerProfileFormValues) {
    const result = customerProfileSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }
    customerAccountService.saveProfile(result.data);
    toast.success("Profile saved on this device.");
  }

  const fieldClass =
    "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm font-normal text-charcoal";

  return (
    <div>
      <p className="eyebrow">Profile</p>
      <h2 className="mt-2 text-3xl">Your contact details</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
        Keep your name, email, and mobile number up to date for orders and
        delivery updates.
      </p>
      <form
        className="mt-7 grid max-w-2xl gap-5 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit(submit)}
      >
        <label className="text-sm font-semibold text-charcoal sm:col-span-2">
          Name
          <input className={fieldClass} {...register("name")} />
          <FormFieldError message={errors.name?.message} />
        </label>
        <label className="text-sm font-semibold text-charcoal">
          Email
          <input
            autoComplete="email"
            className={fieldClass}
            type="email"
            {...register("email")}
          />
          <FormFieldError message={errors.email?.message} />
        </label>
        <label className="text-sm font-semibold text-charcoal">
          Mobile number
          <input
            autoComplete="tel"
            className={fieldClass}
            inputMode="tel"
            {...register("phone")}
          />
          <FormFieldError message={errors.phone?.message} />
        </label>
        <div className="sm:col-span-2">
          <Button type="submit">
            <Save aria-hidden="true" size={17} />
            Save profile
          </Button>
        </div>
      </form>
    </div>
  );
}
