import { Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { OrderDetails } from "@/components/account/OrderDetails";
import { FormFieldError } from "@/components/admin/FormFieldError";
import { PageHero } from "@/components/common/PageHero";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks";
import {
  guestOrderLookupSchema,
  type GuestOrderLookupFormValues,
} from "@/lib/customer-schemas";
import { applyZodErrors } from "@/lib/form-validation";
import { customerAccountService } from "@/services";
import type { OrderConfirmation } from "@/types/order.types";

export function OrderLookupPage() {
  const [confirmation, setConfirmation] =
    useState<OrderConfirmation | null>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const settingsQuery = useSettings();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setError,
  } = useForm<GuestOrderLookupFormValues>({
    defaultValues: { contact: "", orderNumber: "" },
  });

  async function submit(values: GuestOrderLookupFormValues) {
    const result = guestOrderLookupSchema.safeParse(values);
    if (!result.success) {
      applyZodErrors(result.error.issues, setError);
      return;
    }

    setLookupError(null);
    setConfirmation(null);
    const response = await customerAccountService.lookupGuestOrder(result.data);
    if (!response.data) {
      setLookupError(
        "We could not find an order matching both details. Check the order number and the email or phone used at checkout.",
      );
      return;
    }
    setConfirmation(response.data);
  }

  const supportNumber =
    settingsQuery.data?.data.whatsappNumber.replace(/\D/g, "") ?? "";
  const supportUrl =
    supportNumber && confirmation
      ? `https://wa.me/${supportNumber}?text=${encodeURIComponent(
          `Hello House of Patani, I need help with order ${confirmation.order.order_number}.`,
        )}`
      : "#";
  const fieldClass =
    "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm font-normal text-charcoal";

  return (
    <>
      <PageHero
        description="Enter the order number and the contact detail used at checkout. Both must match before any order information is shown."
        eyebrow="Guest support"
        title="Find your order"
      />
      <section className="bg-background py-12 sm:py-16">
        <div className="section-shell">
          <form
            className="mx-auto grid max-w-3xl gap-5 rounded-lg border border-maroon/10 bg-card p-6 shadow-lift sm:grid-cols-2 sm:p-8"
            noValidate
            onSubmit={handleSubmit(submit)}
          >
            <label className="text-sm font-semibold text-charcoal">
              Order number
              <input
                autoComplete="off"
                className={fieldClass}
                placeholder="HOP-..."
                {...register("orderNumber")}
              />
              <FormFieldError message={errors.orderNumber?.message} />
            </label>
            <label className="text-sm font-semibold text-charcoal">
              Email or phone
              <input
                autoComplete="email"
                className={fieldClass}
                placeholder="Used at checkout"
                {...register("contact")}
              />
              <FormFieldError message={errors.contact?.message} />
            </label>
            {lookupError ? (
              <p
                className="rounded-md border border-destructive/20 bg-destructive/5 p-3 text-sm leading-6 text-destructive sm:col-span-2"
                role="alert"
              >
                {lookupError}
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <Button disabled={isSubmitting} type="submit">
                <Search aria-hidden="true" size={17} />
                {isSubmitting ? "Looking up order..." : "Find order"}
              </Button>
            </div>
          </form>

          {confirmation ? (
            <div className="mx-auto mt-10 max-w-6xl rounded-lg border border-maroon/10 bg-card p-5 shadow-lift sm:p-8">
              <OrderDetails
                confirmation={confirmation}
                supportUrl={supportUrl}
              />
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
