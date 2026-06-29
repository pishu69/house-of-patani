import {
  mockResponse,
  supabaseResponse,
  type ServiceResponse,
} from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import { fallbackAfterError } from "@/services/service.utils";
import type { ReviewRow } from "@/types/database.types";

interface CreateVerifiedReviewInput {
  comment: string;
  customerId: string | null;
  customerName: string;
  orderId: string;
  productId: string;
  rating: number;
  title: string;
}

export const reviewService = {
  async listByProduct(
    productId: string,
  ): Promise<ServiceResponse<ReviewRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        [],
        error,
        "We could not load product reviews right now.",
      );
    }
  },

    async createVerifiedReview(
    input: CreateVerifiedReviewInput,
  ): Promise<ServiceResponse<ReviewRow | null>> {
    if (!supabase) {
      return mockResponse(null);
    }

    try {
      const { data, error } = await supabase.rpc("submit_verified_review", {
        p_comment: input.comment,
        p_order_id: input.orderId,
        p_product_id: input.productId,
        p_rating: input.rating,
        p_title: input.title,
      });

      if (error) {
        throw error;
      }

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        null,
        error,
        "Your review could not be submitted right now.",
      );
    }
  },

  async listAll(): Promise<ServiceResponse<ReviewRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        [],
        error,
        "We could not load reviews right now.",
      );
    }
  },

  async updateApproval(
    id: string,
    approved: boolean,
  ): Promise<ServiceResponse<ReviewRow | null>> {
    if (!supabase) {
      return mockResponse(null);
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .update({ approved })
        .eq("id", id)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        null,
        error,
        "The review could not be updated right now.",
      );
    }
  },

  async remove(id: string): Promise<ServiceResponse<boolean>> {
    if (!supabase) {
      return mockResponse(false);
    }

    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      return supabaseResponse(true);
    } catch (error) {
      return fallbackAfterError(
        false,
        error,
        "The review could not be deleted right now.",
      );
    }
  },
    async listByOrder(orderId: string): Promise<ServiceResponse<ReviewRow[]>> {
    if (!supabase) {
      return mockResponse([]);
    }

    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("order_id", orderId);

      if (error) {
        throw error;
      }

      return supabaseResponse(data ?? []);
    } catch (error) {
      return fallbackAfterError(
        [],
        error,
        "We could not load order reviews right now.",
      );
    }
  },

  async updateOwnReview(input: {
    comment: string;
    rating: number;
    reviewId: string;
    title: string;
  }): Promise<ServiceResponse<ReviewRow | null>> {
    if (!supabase) {
      return mockResponse(null);
    }

    try {
      const { data, error } = await supabase.rpc("update_verified_review", {
        p_comment: input.comment,
        p_rating: input.rating,
        p_review_id: input.reviewId,
        p_title: input.title,
      });

      if (error) {
        throw error;
      }

      return supabaseResponse(data);
    } catch (error) {
      return fallbackAfterError(
        null,
        error,
        "Your review could not be updated right now.",
      );
    }
  },

  async deleteOwnReview(
    reviewId: string,
  ): Promise<ServiceResponse<boolean>> {
    if (!supabase) {
      return mockResponse(false);
    }

    try {
      const { data, error } = await supabase.rpc("delete_verified_review", {
        p_review_id: reviewId,
      });

      if (error) {
        throw error;
      }

      return supabaseResponse(Boolean(data));
    } catch (error) {
      return fallbackAfterError(
        false,
        error,
        "Your review could not be deleted right now.",
      );
    }
  },
};