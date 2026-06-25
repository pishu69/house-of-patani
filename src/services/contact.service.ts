import { mockResponse, supabaseResponse, type ServiceResponse } from "@/lib/errors";
import { supabase } from "@/lib/supabase";

export interface ContactMessageInput {
  email: string;
  message: string;
  name: string;
}

export const contactService = {
  async create(
    input: ContactMessageInput,
  ): Promise<ServiceResponse<boolean>> {
    if (!supabase) {
      return mockResponse(true);
    }

    const { error } = await (supabase as any).from("contact_messages").insert({
      email: input.email.trim(),
      message: input.message.trim(),
      name: input.name.trim(),
    });

    if (error) {
  console.error("Contact Form Error:", error);
  throw error;
}

    return supabaseResponse(true);
  },
};
