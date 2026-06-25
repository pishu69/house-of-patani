import { mockResponse, supabaseResponse, type ServiceResponse } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

export interface ContactMessageInput {
  email: string;
  message: string;
  name: string;
}

export const contactService = {
  async create(input: ContactMessageInput): Promise<ServiceResponse<boolean>> {
    if (!supabase) return mockResponse(true);

    const { error } = await (supabase as any).from("contact_messages").insert({
      email: input.email.trim(),
      message: input.message.trim(),
      name: input.name.trim(),
    });

    if (error) throw error;

    return supabaseResponse(true);
  },

  async list(): Promise<ServiceResponse<any[]>> {
    if (!supabase) return mockResponse([]);

    const { data, error } = await (supabase as any)
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return supabaseResponse(data ?? []);
  },

  async markRead(id: string, read: boolean): Promise<ServiceResponse<boolean>> {
    if (!supabase) return mockResponse(true);

    const { error } = await (supabase as any)
      .from("contact_messages")
      .update({ is_read: read })
      .eq("id", id);

    if (error) throw error;

    return supabaseResponse(true);
  },

  async delete(id: string): Promise<ServiceResponse<boolean>> {
    if (!supabase) return mockResponse(true);

    const { error } = await (supabase as any)
      .from("contact_messages")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return supabaseResponse(true);
  },
};
