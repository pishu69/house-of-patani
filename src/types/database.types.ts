import type { OrderStatus } from "@/constants/order-status";
import type { PaymentStatus } from "@/constants/payment-status";

export type Json =
  | boolean
  | number
  | string
  | null
  | Json[]
  | { [key: string]: Json | undefined };

type Insertable<Row, RequiredKeys extends keyof Row> = Partial<Row> &
  Pick<Row, RequiredKeys>;

type TableDefinition<Row, RequiredKeys extends keyof Row> = {
  Insert: Insertable<Row, RequiredKeys> & Record<string, unknown>;
  Relationships: [];
  Row: Row & Record<string, unknown>;
  Update: Partial<Row> & Record<string, unknown>;
};

export interface CategoryRow {
  active: boolean;
  created_at: string;
  description: string | null;
  id: string;
  image_path: string | null;
  image_url: string | null;
  name: string;
  slug: string;
  updated_at: string;
}

export interface ProductRow {
  active: boolean;
  best_seller: boolean;
  category_id: string | null;
  created_at: string;
  description: string | null;
  long_description: string | null;
  details: string | null;
  care_instructions: string | null;
  shipping_returns: string | null;
  shipping_weight_kg: number;
  attributes: Json;
  delivery_cod_title: string | null;
  delivery_cod_description: string | null;
  delivery_payment_title: string | null;
  delivery_payment_description: string | null;
  delivery_shipping_title: string | null;
  delivery_shipping_description: string | null;
  delivery_returns_title: string | null;
  delivery_returns_description: string | null;
  delivery_care_title: string | null;
  delivery_care_description: string | null;
  delivery_packaging_title: string | null;
  delivery_packaging_description: string | null;
  featured: boolean;
  id: string;
  name: string;
  new_arrival: boolean;
  original_price: number;
  package_breadth_cm: number;
  package_height_cm: number;
  package_length_cm: number;
  price: number;
  rating: number;
  review_count: number;
  short_description: string | null;
  sku: string;
  slug: string;
  stock: number;
  tags: string[];
  updated_at: string;
  warehouse_id: string | null;
}

export interface ProductImageRow {
  alt_text: string | null;
  created_at: string;
  id: string;
  image_url: string;
  is_primary: boolean;
  position: number;
  product_id: string;
  storage_path: string | null;
}

export interface CustomerRow {
  active: boolean;
  auth_user_id: string | null;
  created_at: string;
  email: string;
  id: string;
  name: string;
  phone: string | null;
  updated_at: string;
}

export interface AddressRow {
  city: string;
  country: string;
  created_at: string;
  customer_id: string;
  id: string;
  is_default: boolean;
  label: string | null;
  line1: string;
  line2: string | null;
  postal_code: string;
  state: string;
  updated_at: string;
}

export interface OrderRow {
  confirmation_email_sent_at: string | null;
  created_at: string;
  awb_number: string | null;
  courier_name: string | null;
  courier_partner: string | null;
tracking_number: string | null;
tracking_url: string | null;
dispatched_at: string | null;
estimated_delivery_at: string | null;
  estimated_delivery_date: string | null;
delivered_at: string | null;
customer_email: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  discount: number;
  id: string;
  notes: string | null;
  order_number: string;
  order_status: OrderStatus;
  paid_at: string | null;
  payment_method: string;
  payment_status: PaymentStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  shipping: number;
  shipping_address: Json;
  shiprocket_order_id: string | null;
  shipment_id: string | null;
  shipment_status: string | null;
  subtotal: number;
  total: number;
  updated_at: string;
  warehouse_id: string | null;
}

export interface WarehouseRow {
  created_at: string;
  id: string;
  is_active: boolean;
  name: string;
  pickup_pincode: string | null;
  shiprocket_pickup_location: string | null;
  updated_at: string;
}

export interface PaymentIntentRow {
  amount: number;
  created_at: string;
  currency: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  id: string;
  items: Json;
  paid_at: string | null;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  razorpay_signature: string | null;
  shipping_address: Json;
  status: "cancelled" | "created" | "failed" | "paid";
  updated_at: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  price: number;
  product_id: string | null;
  product_image: string | null;
  product_name: string;
  quantity: number;
  total: number;
}

export interface OrderShipmentRow {
  awb_number: string | null;
  courier_name: string | null;
  created_at: string;
  estimated_delivery_date: string | null;
  id: string;
  order_id: string;
  shipment_id: string | null;
  shipment_status: string;
  shiprocket_order_id: string | null;
  tracking_url: string | null;
  updated_at: string;
  warehouse_id: string;
}

export interface CouponRow {
  active: boolean;
  code: string;
  created_at: string;
  expires_at: string | null;
  id: string;
  minimum_order_value: number;
  type: "fixed" | "percentage";
  usage_limit: number | null;
  used_count: number;
  value: number;
}

export interface ReviewRow {
  approved: boolean;
  comment: string | null;
  order_id: string | null;
verified_purchase: boolean;
  created_at: string;
  customer_id: string | null;
  customer_name: string;
  id: string;
  product_id: string;
  rating: number;
  title: string | null;
  updated_at: string;
}
export interface InventoryItemRow {
  allow_backorder: boolean;
  created_at: string;
  id: string;
  low_stock_threshold: number;
  product_id: string;
  reserved_quantity: number;
  sku: string;
  stock_quantity: number;
  track_inventory: boolean;
  updated_at: string;
}

export interface InventoryMovementRow {
  created_at: string;
  created_by: string | null;
  id: string;
  inventory_item_id: string;
  movement_type:
    | "purchase"
    | "manual_adjustment"
    | "order_reserved"
    | "order_released"
    | "order_fulfilled"
    | "return"
    | "damage"
    | "correction";
  new_quantity: number;
  previous_quantity: number;
  product_id: string;
  quantity: number;
  reason: string | null;
  reference_id: string | null;
  reference_type: string | null;
}

export interface InventoryPurchaseEntryRow {
  created_at: string;
  created_by: string | null;
  id: string;
  inventory_item_id: string;
  notes: string | null;
  product_id: string;
  purchase_date: string;
  quantity: number;
  supplier_name: string | null;
  total_cost: number | null;
  unit_cost: number | null;
}

export interface WishlistRow {
  created_at: string;
  customer_id: string;
  id: string;
  product_id: string;
}

export interface SettingRow {
  created_at: string;
  id: string;
  key: string;
  updated_at: string;
  value: Json;
}

export interface BannerRow {
  active: boolean;
  created_at: string;
  id: string;
  image_url: string;
  image_path: string | null;
  link_url: string | null;
  mobile_image_url: string | null;
  mobile_image_path: string | null;
  position: string;
  sort_order: number;
  subtitle: string | null;
  title: string;
  updated_at: string;
}

export interface AdminRow {
  active: boolean;
  created_at: string;
  email: string;
  id: string;
  name: string;
  role: "admin" | "super_admin";
  updated_at: string;
  user_id: string;
}

export interface Database {
  public: {
    CompositeTypes: Record<never, never>;
    Enums: Record<never, never>;
    Functions: {
      increment_coupon_usage: {
  Args: {
    p_code: string;
  };
  Returns: boolean;
};
      validate_coupon: {
  Args: {
    p_code: string;
  };
  Returns: CouponRow;
};
      deduct_inventory_for_order: {
  Args: {
    p_order_id: string;
  };
  Returns: boolean;
};
      update_verified_review: {
  Args: {
    p_comment: string;
    p_rating: number;
    p_review_id: string;
    p_title: string;
  };
  Returns: ReviewRow;
};
delete_verified_review: {
  Args: {
    p_review_id: string;
  };
  Returns: boolean;
};
      submit_verified_review: {
  Args: {
    p_comment: string;
    p_order_id: string;
    p_product_id: string;
    p_rating: number;
    p_title: string;
  };
  Returns: ReviewRow;
};
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_super_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      lookup_guest_order: {
        Args: {
          p_contact: string;
          p_order_number: string;
        };
        Returns: Json;
      };
      sync_customer_account: {
        Args: {
          p_addresses: Json;
          p_email: string;
          p_name: string;
          p_wishlist_product_ids: string[];
        };
        Returns: undefined;
      };
      create_guest_order: {
        Args: {
          p_address: Json;
          p_customer_email: string;
          p_customer_name: string;
          p_customer_phone: string;
          p_items: Json;
          p_payment_method: string;
        };
        Returns: Json;
      };
      complete_customer_otp_login: {
        Args: {
          p_addresses: Json;
          p_auth_user_id: string;
          p_email: string;
          p_name: string;
          p_phone: string;
          p_wishlist_product_ids: string[];
        };
        Returns: Json;
      };
      finalize_razorpay_order: {
        Args: {
          p_intent_id: string;
          p_razorpay_order_id: string;
          p_razorpay_payment_id: string;
          p_razorpay_signature: string;
        };
        Returns: Json;
      };
    };
    Tables: {
      addresses: TableDefinition<
        AddressRow,
        | "city"
        | "country"
        | "customer_id"
        | "line1"
        | "postal_code"
        | "state"
      >;
      admins: TableDefinition<
        AdminRow,
        "email" | "name" | "role" | "user_id"
      >;
      banners: TableDefinition<
        BannerRow,
        "image_url" | "position" | "title"
      >;
      categories: TableDefinition<CategoryRow, "name" | "slug">;
      coupons: TableDefinition<CouponRow, "code" | "type" | "value">;
      customers: TableDefinition<CustomerRow, "email" | "name">;
      inventory_items: TableDefinition<
  InventoryItemRow,
  "product_id" | "sku"
>;
inventory_movements: TableDefinition<
  InventoryMovementRow,
  | "inventory_item_id"
  | "movement_type"
  | "new_quantity"
  | "previous_quantity"
  | "product_id"
  | "quantity"
>;
inventory_purchase_entries: TableDefinition<
  InventoryPurchaseEntryRow,
  "inventory_item_id" | "product_id" | "quantity"
>;
      order_items: TableDefinition<
        OrderItemRow,
        "order_id" | "price" | "product_name" | "quantity" | "total"
      >;
      orders: TableDefinition<
        OrderRow,
        | "customer_email"
        | "customer_name"
        | "customer_phone"
        | "order_number"
        | "order_status"
        | "payment_method"
        | "payment_status"
        | "shipping_address"
        | "total"
      >;
      warehouses: TableDefinition<
        WarehouseRow,
        | "is_active"
        | "name"
        | "pickup_pincode"
        | "shiprocket_pickup_location"
      >;
      order_shipments: TableDefinition<
        OrderShipmentRow,
        "order_id" | "shipment_status" | "warehouse_id"
      >;
      payment_intents: TableDefinition<
        PaymentIntentRow,
        | "amount"
        | "currency"
        | "customer_email"
        | "customer_name"
        | "customer_phone"
        | "items"
        | "shipping_address"
      >;
      product_images: TableDefinition<
        ProductImageRow,
        "image_url" | "product_id"
      >;
      products: TableDefinition<
        ProductRow,
        "name" | "original_price" | "price" | "sku" | "slug"
      >;
      reviews: TableDefinition<
        ReviewRow,
        "customer_name" | "product_id" | "rating"
      >;
      settings: TableDefinition<SettingRow, "key" | "value">;
      wishlists: TableDefinition<
        WishlistRow,
        "customer_id" | "product_id"
      >;
    };
    Views: Record<never, never>;
  };
}





