import { z } from "zod";

export const customerProfileSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(120, "Name must be 120 characters or fewer."),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
      "Enter a valid 10-digit Indian phone number.",
    ),
});

export const customerAddressSchema = z.object({
  city: z.string().trim().min(2, "Enter your city."),
  country: z.string().trim().min(2, "Enter your country."),
  isDefault: z.boolean(),
  label: z
    .string()
    .trim()
    .min(2, "Enter a label such as Home.")
    .max(40, "Label must be 40 characters or fewer."),
  line1: z.string().trim().min(5, "Enter a complete street address."),
  line2: z.string().trim().max(120, "Address line is too long."),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian pincode."),
  state: z.string().trim().min(2, "Enter your state."),
});

export const guestOrderLookupSchema = z.object({
  contact: z
    .string()
    .trim()
    .min(5, "Enter the email or phone number used for the order.")
    .max(254, "Contact detail is too long."),
  orderNumber: z
    .string()
    .trim()
    .min(5, "Enter your order number.")
    .max(40, "Order number is too long."),
});

export type CustomerProfileFormValues = z.infer<
  typeof customerProfileSchema
>;
export type CustomerAddressFormValues = z.infer<
  typeof customerAddressSchema
>;
export type GuestOrderLookupFormValues = z.infer<
  typeof guestOrderLookupSchema
>;
