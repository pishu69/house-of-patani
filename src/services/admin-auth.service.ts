import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type {
  AdminAuthResolution,
  AdminLoginInput,
  AdminSession,
} from "@/types/admin-auth.types";
import type { AdminRow } from "@/types/database.types";

const DEMO_SESSION_KEY = "house-of-patani-demo-admin";

export const DEMO_ADMIN_CREDENTIALS = Object.freeze({
  email: "admin@houseofpatani.demo",
  password: "patani-demo",
});

function unauthenticated(error: string | null = null): AdminAuthResolution {
  return { error, session: null, status: "unauthenticated" };
}

function denied(error: string): AdminAuthResolution {
  return { error, session: null, status: "denied" };
}

function authenticated(session: AdminSession): AdminAuthResolution {
  return { error: null, session, status: "authenticated" };
}

function canUseDemoAdmin() {
  return import.meta.env.DEV && !isSupabaseConfigured;
}

function getDemoSession(): AdminSession {
  const now = new Date().toISOString();
  const admin: AdminRow = {
    active: true,
    created_at: now,
    email: DEMO_ADMIN_CREDENTIALS.email,
    id: "demo-admin",
    name: "Demo Store Manager",
    role: "super_admin",
    updated_at: now,
    user_id: "demo-admin-user",
  };

  return {
    accessToken: null,
    admin,
    expiresAt: null,
    isDemo: true,
    user: {
      email: admin.email,
      id: admin.user_id,
    },
  };
}

function hasDemoSession() {
  return (
    canUseDemoAdmin() &&
    typeof window !== "undefined" &&
    window.sessionStorage.getItem(DEMO_SESSION_KEY) === "active"
  );
}

async function getAdminForUser(userId: string) {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(
      "Your administrator access could not be verified. Please try again.",
    );
  }

  return data;
}

async function resolveSupabaseSession(
  session: Session | null,
): Promise<AdminAuthResolution> {
  if (!session) return unauthenticated();

  const admin = await getAdminForUser(session.user.id);
  if (!admin) {
    return denied(
      "This account is signed in but is not authorized to manage House of Patani.",
    );
  }

  return authenticated({
    accessToken: session.access_token,
    admin,
    expiresAt: session.expires_at ?? null,
    isDemo: false,
    user: {
      email: session.user.email ?? admin.email,
      id: session.user.id,
    },
  });
}

export async function isCurrentUserAdmin() {
  if (hasDemoSession()) return true;
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) return false;

    return Boolean(await getAdminForUser(data.session.user.id));
  } catch {
    return false;
  }
}

export const adminAuthService = {
  canUseDemoAdmin,
  isConfigured: () => isSupabaseConfigured,

  async getCurrentSession(): Promise<AdminAuthResolution> {
    if (hasDemoSession()) return authenticated(getDemoSession());

    if (!supabase) {
      return unauthenticated(
        import.meta.env.PROD
          ? "Administrator login is unavailable because Supabase is not configured."
          : null,
      );
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return unauthenticated(
        "Your administrator session could not be restored. Please sign in again.",
      );
    }

    return resolveSupabaseSession(data.session);
  },

  async login(input: AdminLoginInput): Promise<AdminAuthResolution> {
    if (!supabase) {
      if (!canUseDemoAdmin()) {
        return unauthenticated(
          "Administrator login is unavailable because Supabase is not configured.",
        );
      }

      if (
        input.email.trim().toLowerCase() !== DEMO_ADMIN_CREDENTIALS.email ||
        input.password !== DEMO_ADMIN_CREDENTIALS.password
      ) {
        return unauthenticated("Use the development demo credentials shown.");
      }

      window.sessionStorage.setItem(DEMO_SESSION_KEY, "active");
      return authenticated(getDemoSession());
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    });

    if (error || !data.session) {
      return unauthenticated(
        "The email or password is incorrect. Please check your details.",
      );
    }

    return resolveSupabaseSession(data.session);
  },

  async logout(): Promise<AdminAuthResolution> {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(DEMO_SESSION_KEY);
    }

    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error("You could not be signed out. Please try again.");
      }
    }

    return unauthenticated();
  },

  onAuthStateChange(
    callback: (resolution: AdminAuthResolution) => void,
  ) {
    if (!supabase) return () => undefined;

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => {
        void resolveSupabaseSession(session)
          .then(callback)
          .catch(() =>
            callback(
              unauthenticated(
                "Your administrator session could not be verified.",
              ),
            ),
          );
      }, 0);
    });

    return () => data.subscription.unsubscribe();
  },
};
