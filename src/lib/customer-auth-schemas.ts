import { z } from "zod";

export const indianMobileSchema = z
  .string()
  .trim()
  .regex(
    /^(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
    "Enter a valid 10-digit Indian mobile number.",
  );

export const customerLoginSchema = z.object({
  phone: indianMobileSchema,
});

export const otpVerificationSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{4,9}$/, "Enter the OTP sent to your mobile."),
});

export type CustomerLoginFormValues = z.infer<typeof customerLoginSchema>;
export type OtpVerificationFormValues = z.infer<
  typeof otpVerificationSchema
>;
