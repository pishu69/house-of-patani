import { supabase } from "@/lib/supabase";

export const emailAuthService = {
  async sendMagicLink(email: string) {
    if (!supabase) throw new Error("Email login is not configured.");

    const redirectTo = import.meta.env.PROD
      ? "https://houseofpatani.com/account"
      : `${window.location.origin}/account`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) throw new Error("Could not send login link.");
  },

  async signInWithGoogle() {
    if (!supabase) throw new Error("Google login is not configured.");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://house-of-patani.netlify.app/account",
      },
    });

    if (error) throw new Error("Could not start Google login.");
  },
};

