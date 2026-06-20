import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

interface CheckoutFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string | undefined;
  label: string;
  registration: UseFormRegisterReturn;
}

export function CheckoutField({
  error,
  label,
  registration,
  ...props
}: CheckoutFieldProps) {
  return (
    <label className="block text-sm font-semibold text-charcoal">
      {label}
      <input
        aria-invalid={Boolean(error)}
        className="mt-2 h-11 w-full rounded-md border border-maroon/15 bg-card px-4 text-sm"
        {...props}
        {...registration}
      />
      {error ? (
        <span className="mt-1 block text-xs font-medium text-destructive">
          {error}
        </span>
      ) : null}
    </label>
  );
}
