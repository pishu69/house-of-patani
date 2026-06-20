import { z } from "zod";

export const checkoutSchema = z.object({
  addressLine1: z
    .string()
    .trim()
    .min(5, "Enter a complete street address."),
  addressLine2: z.string().trim().max(120, "Address line is too long."),
  city: z.string().trim().min(2, "Enter your city."),
  country: z.string().trim().min(2, "Enter your country."),
  email: z.string().trim().email("Enter a valid email address."),
  firstName: z.string().trim().min(2, "Enter your first name."),
  landmark: z.string().trim().max(200, "Landmark or notes are too long."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  paymentMethod: z.enum(["cod", "razorpay"], {
    message: "Choose a payment method.",
  }),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
      "Enter a valid 10-digit Indian phone number.",
    ),
  pincode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian pincode."),
  shippingMethod: z.enum(["standard"], {
    message: "Choose a shipping method.",
  }),
  state: z.string().trim().min(2, "Enter your state."),
});

export type CheckoutFormValues = z.input<typeof checkoutSchema>;
