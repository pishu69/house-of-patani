import { mockResponse, supabaseResponse, type ServiceResponse } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

export const newsletterService = {
  async subscribe(email: string): Promise<ServiceResponse<boolean>> {
    const cleanedEmail = email.trim().toLowerCase();

    if (!cleanedEmail.includes("@")) {
      throw new Error("Enter a valid email address.");
    }

    if (!supabase) {
      return mockResponse(true);
    }

    const { error } = await (supabase as any)
      .from("newsletter_subscribers")
      .insert({
        email: cleanedEmail,
        source: "homepage",
      });

    if (error) {
      if (error.code === "23505") {
        throw new Error("This email is already subscribed.");
      }

      throw error;
    }

    return supabaseResponse(true);
  },

  async list(): Promise<ServiceResponse<any[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    const { data, error } = await (supabase as any)
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return supabaseResponse(data ?? []);
  },
};
