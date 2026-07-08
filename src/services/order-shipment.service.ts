import { mockResponse, supabaseResponse } from "@/lib/errors";
import { supabase } from "@/lib/supabase";
import type { OrderShipmentRow } from "@/types/database.types";

type ShipmentUpdate = Partial<
  Pick<
    OrderShipmentRow,
    | "awb_number"
    | "courier_name"
    | "estimated_delivery_date"
    | "shipment_id"
    | "shipment_status"
    | "shiprocket_order_id"
    | "tracking_url"
  >
>;

export const orderShipmentService = {
  async list(orderId: string) {
    if (!supabase) return mockResponse<OrderShipmentRow[]>([]);

    const { data, error } = await supabase
      .from("order_shipments")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at");

    if (error) throw error;
    return supabaseResponse(data ?? []);
  },

  async ensure(orderId: string, warehouseId: string) {
    if (!supabase) {
      throw new Error("Supabase is required to create split shipments.");
    }

    const { data, error } = await supabase
      .from("order_shipments")
      .upsert(
        {
          order_id: orderId,
          shipment_status: "pending",
          warehouse_id: warehouseId,
        },
        { onConflict: "order_id,warehouse_id" },
      )
      .select("*")
      .single();

    if (error) throw error;
    return supabaseResponse(data);
  },

  async update(id: string, input: ShipmentUpdate) {
    if (!supabase) {
      throw new Error("Supabase is required to update split shipments.");
    }

    const { data, error } = await supabase
      .from("order_shipments")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return supabaseResponse(data);
  },
};
