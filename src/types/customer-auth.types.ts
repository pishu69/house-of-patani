import type {
  CustomerAddress,
  CustomerProfile,
} from "@/types/customer-account.types";

export type CustomerAuthStatus =
  | "authenticated"
  | "idle"
  | "loading"
  | "unauthenticated";

export interface CustomerAuthSession {
  customerId: string;
  isDemo: boolean;
  phone: string;
  profile: CustomerProfile;
  userId: string;
}

export interface CustomerAuthResolution {
  error: string | null;
  session: CustomerAuthSession | null;
  status: Exclude<CustomerAuthStatus, "idle" | "loading">;
}

export interface SendOtpInput {
  phone: string;
  resend?: boolean;
}

export interface SendOtpResult {
  cooldownSeconds: number;
  demoOtp?: string;
  phone: string;
}

export interface VerifyOtpInput {
  addresses: CustomerAddress[];
  email: string;
  name: string;
  otp: string;
  phone: string;
  wishlistProductIds: string[];
}
