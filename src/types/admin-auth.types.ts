import type { AdminRow } from "@/types/database.types";

export type AdminAuthStatus =
  | "authenticated"
  | "denied"
  | "idle"
  | "loading"
  | "unauthenticated";

export interface AdminUser {
  email: string;
  id: string;
}

export interface AdminSession {
  accessToken: string | null;
  admin: AdminRow;
  expiresAt: number | null;
  isDemo: boolean;
  user: AdminUser;
}

export interface AdminAuthResolution {
  error: string | null;
  session: AdminSession | null;
  status: Exclude<AdminAuthStatus, "idle" | "loading">;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}
