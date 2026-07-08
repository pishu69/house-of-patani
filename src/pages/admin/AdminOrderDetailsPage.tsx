import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import {
  shiprocketService,
  type ShiprocketCourierOption,
} from "@/services/shiprocket.service";
import { OrderInvoice } from "@/components/admin/OrderInvoice";
import { useProducts, useWarehouses, warehouseQueryKeys } from "@/hooks";
import type { OrderStatus } from "@/constants/order-status";

type AnyRecord = Record<string, any>;

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function shiprocketMessage(value: unknown): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);

  if (Array.isArray(value)) {
    return value.map(shiprocketMessage).filter(Boolean).join(" ");
  }

  if (typeof value === "object") {
    const record = value as AnyRecord;
    const direct = shiprocketMessage(
      record.message ??
        record.error ??
        record.error_message ??
        record.status_message,
    );

    if (direct) return direct;

    return shiprocketMessage(
      record.errors ??
        record.shiprocketResponse ??
        record.data ??
        record.response,
    );
  }

  return "";
}

function compactResponse(value: unknown) {
  try {
    return JSON.stringify(value).slice(0, 800);
  } catch {
    return "";
  }
}

function includesSuccessText(value: unknown): boolean {
  const text = compactResponse(value).toLowerCase();
  return (
    text.includes("success") ||
    text.includes("created") ||
    text.includes("order created")
  );
}

function addDays(days: number | null) {
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const money = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const nextStatusActions: Record<
  OrderStatus,
  { label: string; status: OrderStatus }[]
> = {
  pending: [
    { label: "Confirm Order", status: "confirmed" },
    { label: "Cancel Order", status: "cancelled" },
  ],
  confirmed: [{ label: "Mark as Packed", status: "packed" }],
  packed: [{ label: "Mark as Shipped", status: "shipped" }],
  shipped: [{ label: "Mark as Delivered", status: "delivered" }],
    delivered: [],
  cancelled: [],
  refunded: [],
};

export function AdminOrderDetailsPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const queryClient = useQueryClient();

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["admin-order-details", orderNumber],
    queryFn: () => orderService.getByOrderNumber(orderNumber || ""),
    enabled: Boolean(orderNumber),
  });

  const confirmation = response?.data as AnyRecord | null | undefined;
  const order = (confirmation?.order || confirmation) as AnyRecord | null;
  const items = (confirmation?.items || []) as AnyRecord[];
  const warehousesQuery = useWarehouses();
  const warehouses = warehousesQuery.data?.data ?? [];
  const productsQuery = useProducts();
  const products = productsQuery.data?.data ?? [];
  const [localStatus, setLocalStatus] = useState<OrderStatus | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(
    null,
  );
  const [selectedCourierId, setSelectedCourierId] = useState<string>("");
  const [shippingForm, setShippingForm] = useState({
  courier_partner: "",
  tracking_number: "",
  tracking_url: "",
  dispatched_at: "",
  estimated_delivery_at: "",
});

  const updateStatusMutation = useMutation({
    mutationFn: (nextStatus: OrderStatus) => {
      if (!order?.id) {
        throw new Error("Missing order id");
      }

      return orderService.update(order.id, { order_status: nextStatus });
    },

    onSuccess: (updateResponse) => {
      const updatedOrder = updateResponse.data as AnyRecord | null;
const updatedStatus = updatedOrder?.order_status as OrderStatus | undefined;

if (updatedStatus) {
  setLocalStatus(updatedStatus);
}

      if (updatedOrder) {
        queryClient.setQueryData(
          ["admin-order-details", orderNumber],
          (oldData: AnyRecord | undefined) => {
            if (!oldData?.data) return oldData;

            const oldConfirmation = oldData.data as AnyRecord;

            return {
              ...oldData,
              data: {
                ...oldConfirmation,
                order: {
                  ...(oldConfirmation.order || {}),
                  ...updatedOrder,
                },
              },
            };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-order-details", orderNumber],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });

      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });

  const updateShippingMutation = useMutation({
  mutationFn: () => {
    if (!order?.id) {
      throw new Error("Missing order id");
    }

    return orderService.update(order.id, {
      courier_partner: shippingForm.courier_partner || null,
      tracking_number: shippingForm.tracking_number || null,
      tracking_url: shippingForm.tracking_url || null,
      dispatched_at: shippingForm.dispatched_at
  ? new Date(`${shippingForm.dispatched_at}T00:00:00`).toISOString()
  : null,
estimated_delivery_at: shippingForm.estimated_delivery_at
  ? new Date(`${shippingForm.estimated_delivery_at}T00:00:00`).toISOString()
  : null,
    });
  },
  onSuccess: (updateResponse) => {
    const updatedOrder = updateResponse.data as AnyRecord | null;

    if (updatedOrder) {
      queryClient.setQueryData(
        ["admin-order-details", orderNumber],
        (oldData: AnyRecord | undefined) => {
          if (!oldData?.data) return oldData;

          const oldConfirmation = oldData.data as AnyRecord;

          return {
            ...oldData,
            data: {
              ...oldConfirmation,
              order: {
                ...(oldConfirmation.order || {}),
                ...updatedOrder,
              },
            },
          };
        },
      );
    }

    queryClient.invalidateQueries({
      queryKey: ["admin-order-details", orderNumber],
    });

    queryClient.invalidateQueries({
      queryKey: ["admin-orders"],
    });

    queryClient.invalidateQueries({
      queryKey: ["orders"],
    });
  },
});

  const updateWarehouseMutation = useMutation({
    mutationFn: () => {
      if (!order?.id) {
        throw new Error("Missing order id");
      }

      const warehouseId = selectedWarehouseId ?? order.warehouse_id ?? "";

      if (!warehouseId) {
        throw new Error("Warehouse is required.");
      }

      return orderService.update(order.id, { warehouse_id: warehouseId });
    },
    onSuccess: (updateResponse) => {
      const updatedOrder = updateResponse.data as AnyRecord | null;

      if (updatedOrder) {
        setSelectedWarehouseId(updatedOrder.warehouse_id ?? null);
        queryClient.setQueryData(
          ["admin-order-details", orderNumber],
          (oldData: AnyRecord | undefined) => {
            if (!oldData?.data) return oldData;

            const oldConfirmation = oldData.data as AnyRecord;

            return {
              ...oldData,
              data: {
                ...oldConfirmation,
                order: {
                  ...(oldConfirmation.order || {}),
                  ...updatedOrder,
                },
              },
            };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-order-details", orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: warehouseQueryKeys.all });
    },
  });

  const availableCouriersQuery = useQuery({
    queryKey: ["shiprocket-couriers", order?.shipment_id],
    queryFn: () => shiprocketService.listCouriers(String(order?.shipment_id)),
    enabled:
      Boolean(order?.shipment_id) &&
      !Boolean(order?.awb_number || order?.tracking_number),
  });

  const createShiprocketShipmentMutation = useMutation({
    mutationFn: async () => {
      if (!order?.id) throw new Error("Missing order id");

      const warehouseId = selectedWarehouseId ?? order.warehouse_id ?? "";
      const warehouse = warehouses.find((item) => item.id === warehouseId);

      if (!warehouse) {
        throw new Error("Assign a warehouse before creating a shipment.");
      }

      const shipmentItems = items.map((item) => {
        const product = products.find(
          (candidate) => candidate.id === item.product_id,
        );

        return {
          ...item,
          package_breadth_cm: product?.packageBreadthCm,
          package_height_cm: product?.packageHeightCm,
          package_length_cm: product?.packageLengthCm,
          shipping_weight_kg: product?.shippingWeightKg,
        };
      });

      const shipmentResponse = await shiprocketService.createShipment({
        items: shipmentItems as any,
        order: order as any,
        warehouse,
      });
      const shipmentId = firstString(
        shipmentResponse?.shipment_id,
        shipmentResponse?.data?.shipment_id,
        shipmentResponse?.order?.shipment_id,
        shipmentResponse?.response?.data?.shipment_id,
      );
      const shiprocketOrderId = firstString(
        shipmentResponse?.order_id,
        shipmentResponse?.data?.order_id,
        shipmentResponse?.order?.order_id,
        shipmentResponse?.response?.data?.order_id,
      );
      const channelOrderId = firstString(
        shipmentResponse?.channel_order_id,
        shipmentResponse?.data?.channel_order_id,
        shipmentResponse?.order?.channel_order_id,
        shipmentResponse?.response?.data?.channel_order_id,
      );

      const createdSuccessfully =
        Boolean(shipmentId || shiprocketOrderId || channelOrderId) ||
        includesSuccessText(shipmentResponse);

      if (!createdSuccessfully) {
        const message = shiprocketMessage(shipmentResponse);
        const responseDetails = compactResponse(shipmentResponse);

        throw new Error(
          message ||
            (responseDetails
              ? `Shiprocket did not return a shipment id. Response: ${responseDetails}`
              : "Shiprocket did not return a shipment id."),
        );
      }

      return orderService.update(order.id, {
        awb_number: order.awb_number || null,
        courier_name: order.courier_name || null,
        courier_partner: order.courier_partner || null,
        estimated_delivery_at: order.estimated_delivery_at || null,
        estimated_delivery_date: order.estimated_delivery_date || null,
        shiprocket_order_id:
          shiprocketOrderId || channelOrderId || order.shiprocket_order_id || null,
        shipment_id: shipmentId || order.shipment_id || null,
        shipment_status: order.shipment_status || "order_created",
        tracking_number: order.tracking_number || null,
        tracking_url: order.tracking_url || null,
      });
    },
    onSuccess: (updateResponse) => {
      const updatedOrder = updateResponse.data as AnyRecord | null;

      if (updatedOrder) {
        queryClient.setQueryData(
          ["admin-order-details", orderNumber],
          (oldData: AnyRecord | undefined) => {
            if (!oldData?.data) return oldData;

            const oldConfirmation = oldData.data as AnyRecord;

            return {
              ...oldData,
              data: {
                ...oldConfirmation,
                order: {
                  ...(oldConfirmation.order || {}),
                  ...updatedOrder,
                },
              },
            };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-order-details", orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  const generateAwbMutation = useMutation({
    mutationFn: async () => {
      if (!order?.id) throw new Error("Missing order id");
      if (!order.shipment_id) {
        throw new Error("Create a Shiprocket order before generating AWB.");
      }
      if (order.awb_number || order.tracking_number) {
        throw new Error("AWB already exists for this order.");
      }

      const courier = availableCouriersQuery.data?.couriers.find(
        (item: ShiprocketCourierOption) =>
          String(item.courierId) === selectedCourierId,
      );

      if (!courier) {
        throw new Error("Select a courier before generating AWB.");
      }

      const awbResponse = await shiprocketService.generateAwb(
        order.shipment_id,
        Number(courier.courierId),
      );
      const awbNumber = firstString(
        awbResponse?.awb_code,
        awbResponse?.assigned_awb_code,
        awbResponse?.response?.data?.awb_code,
        awbResponse?.response?.data?.assigned_awb_code,
        awbResponse?.data?.awb_code,
        awbResponse?.data?.assigned_awb_code,
      );

      if (!awbNumber) {
        const message = shiprocketMessage(awbResponse);
        const responseDetails = compactResponse(awbResponse);

        throw new Error(
          message ||
            (responseDetails
              ? `Shiprocket did not return an AWB. Response: ${responseDetails}`
              : "Shiprocket did not return an AWB."),
        );
      }

      const courierName = firstString(
        awbResponse?.courier_name,
        awbResponse?.response?.data?.courier_name,
        awbResponse?.data?.courier_name,
        courier.courierName,
      );
      const shipmentStatus = firstString(
        awbResponse?.shipment_status,
        awbResponse?.current_status,
        awbResponse?.response?.data?.shipment_status,
        awbResponse?.data?.shipment_status,
        "awb_generated",
      );
      const estimatedDeliveryDate =
        courier.estimatedDeliveryDate ||
        addDays(courier.estimatedDeliveryDays);

      return orderService.update(order.id, {
        awb_number: awbNumber,
        courier_name: courierName || null,
        courier_partner: courierName || order.courier_partner || null,
        estimated_delivery_at: estimatedDeliveryDate
          ? new Date(`${estimatedDeliveryDate}T00:00:00`).toISOString()
          : order.estimated_delivery_at || null,
        estimated_delivery_date:
          estimatedDeliveryDate || order.estimated_delivery_date || null,
        shipment_status: shipmentStatus,
        tracking_number: awbNumber,
        tracking_url: `https://shiprocket.co/tracking/${awbNumber}`,
      });
    },
    onSuccess: (updateResponse) => {
      const updatedOrder = updateResponse.data as AnyRecord | null;

      if (updatedOrder) {
        queryClient.setQueryData(
          ["admin-order-details", orderNumber],
          (oldData: AnyRecord | undefined) => {
            if (!oldData?.data) return oldData;

            const oldConfirmation = oldData.data as AnyRecord;

            return {
              ...oldData,
              data: {
                ...oldConfirmation,
                order: {
                  ...(oldConfirmation.order || {}),
                  ...updatedOrder,
                },
              },
            };
          },
        );
      }

      queryClient.invalidateQueries({
        queryKey: ["admin-order-details", orderNumber],
      });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
  if (isLoading) return <div className="p-6">Loading order details...</div>;

  if (isError || !order) {
    return (
      <div className="p-6">
        <Link to="/admin/orders" className="text-sm underline">
          ← Back to Orders
        </Link>
        <h1 className="mt-4 text-2xl font-semibold">Order not found</h1>
      </div>
    );
  }

  const shippingAddress = order.shipping_address || order.shippingAddress || {};
  const currentStatus =
  localStatus || order.order_status || order.status || "pending";
  const activeStatusesForWarehouse = ["pending", "confirmed", "packed"];
  const canAssignWarehouse = activeStatusesForWarehouse.includes(currentStatus);
  const currentWarehouseId =
    selectedWarehouseId ?? order.warehouse_id ?? "";
  const assignedWarehouse = warehouses.find(
    (warehouse) => warehouse.id === currentWarehouseId,
  );
  const warehouseOptions = warehouses.filter(
    (warehouse) => warehouse.active || warehouse.id === currentWarehouseId,
  );
  const availableCouriers = availableCouriersQuery.data?.couriers ?? [];
  const awbExists = Boolean(order.awb_number || order.tracking_number);
  const handlePrintInvoice = () => {
  window.print();
};

  return (
  <>
    {confirmation?.order && confirmation?.items && (
      <OrderInvoice confirmation={confirmation as any} />
    )}

    <div className="space-y-6 p-6 print:hidden">
      <div>
        <Link to="/admin/orders" className="text-sm underline">
          ← Back to Orders
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">
          Order #{order.order_number || order.orderNumber || orderNumber}
        </h1>

        <p className="text-sm text-muted-foreground">
          Status: {currentStatus} • Payment:{" "}
          {order.payment_status || order.paymentStatus || "Pending"}
        </p>
        <button
  type="button"
  onClick={handlePrintInvoice}
  className="mt-4 rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 print:hidden"
>
  Print Invoice
</button>
      </div>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Order Status</h2>

        <p className="mb-4 text-sm">
          Current Status:{" "}
          <strong className="capitalize">{currentStatus}</strong>
        </p>

        <div className="flex flex-wrap gap-2">
  {nextStatusActions[currentStatus as OrderStatus]?.length ? (
    nextStatusActions[currentStatus as OrderStatus].map((action) => (
      <button
        key={action.status}
        type="button"
        disabled={updateStatusMutation.isPending}
        onClick={() => updateStatusMutation.mutate(action.status)}
        className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {action.label}
      </button>
    ))
  ) : (
    <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      No further status actions available for this order.
    </div>
  )}
</div>

        {updateStatusMutation.isPending && (
          <p className="mt-3 text-sm text-muted-foreground">
            Updating order status...
          </p>
        )}

        {updateStatusMutation.isSuccess && (
          <p className="mt-3 text-sm text-green-600">
            Order status updated successfully.
          </p>
        )}

        {updateStatusMutation.isError && (
          <p className="mt-3 text-sm text-red-600">
            Could not update order status.
          </p>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Customer Info</h2>
          <p>
            <strong>Name:</strong>{" "}
            {order.customer_name || order.customerName || "Guest Customer"}
          </p>
          <p>
            <strong>Email:</strong>{" "}
            {order.customer_email || order.customerEmail || "Not provided"}
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            {order.customer_phone || order.customerPhone || "Not provided"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Shipping Address</h2>
          <p>
            {shippingAddress.full_name ||
              order.customer_name ||
              "Not provided"}
          </p>
          <p>
            {shippingAddress.addressLine1 ||
              shippingAddress.address_line1 ||
              ""}
          </p>
          <p>
            {shippingAddress.addressLine2 ||
              shippingAddress.address_line2 ||
              ""}
          </p>
          <p>
            {shippingAddress.city || ""} {shippingAddress.state || ""}{" "}
            {shippingAddress.pincode || ""}
          </p>
          <p>{shippingAddress.country || "India"}</p>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Warehouse Assignment</h2>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Warehouse</span>
            <select
              className="w-full rounded-md border px-3 py-2"
              disabled={!canAssignWarehouse || warehousesQuery.isLoading}
              onChange={(event) => setSelectedWarehouseId(event.target.value)}
              required
              value={currentWarehouseId}
            >
              <option value="">Select warehouse</option>
              {warehouseOptions.map((warehouse) => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} - {warehouse.city}, {warehouse.state}
                </option>
              ))}
            </select>
          </label>

          <button
            className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              !canAssignWarehouse ||
              !currentWarehouseId ||
              updateWarehouseMutation.isPending
            }
            onClick={() => updateWarehouseMutation.mutate()}
            type="button"
          >
            {updateWarehouseMutation.isPending
              ? "Saving..."
              : "Save Warehouse"}
          </button>
        </div>

        {!canAssignWarehouse ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Warehouse assignment is locked once the order moves beyond
            processing.
          </p>
        ) : null}

        {updateWarehouseMutation.isSuccess ? (
          <p className="mt-3 text-sm text-green-600">
            Warehouse assignment saved successfully.
          </p>
        ) : null}

        {updateWarehouseMutation.isError ? (
          <p className="mt-3 text-sm text-red-600">
            Could not save warehouse assignment.
          </p>
        ) : null}
      </section>

      <section className="rounded-lg border bg-card p-4">
  <h2 className="mb-4 text-lg font-semibold">Shipping & Tracking</h2>

  <div className="grid gap-4 md:grid-cols-2">
    <label className="space-y-1 text-sm">
      <span className="font-medium">Courier Partner</span>
      <input
        className="w-full rounded-md border px-3 py-2"
        placeholder="Delhivery, DTDC, Blue Dart..."
        value={
          shippingForm.courier_partner ||
          order.courier_name ||
          order.courier_partner ||
          ""
        }
        onChange={(event) =>
          setShippingForm((current) => ({
            ...current,
            courier_partner: event.target.value,
          }))
        }
      />
    </label>

    <label className="space-y-1 text-sm">
      <span className="font-medium">Tracking Number</span>
      <input
        className="w-full rounded-md border px-3 py-2"
        placeholder="AWB / Tracking number"
        value={
          shippingForm.tracking_number ||
          order.awb_number ||
          order.tracking_number ||
          ""
        }
        onChange={(event) =>
          setShippingForm((current) => ({
            ...current,
            tracking_number: event.target.value,
          }))
        }
      />
    </label>

    <label className="space-y-1 text-sm md:col-span-2">
      <span className="font-medium">Tracking URL</span>
      <input
        className="w-full rounded-md border px-3 py-2"
        placeholder="https://..."
        value={shippingForm.tracking_url || order.tracking_url || ""}
        onChange={(event) =>
          setShippingForm((current) => ({
            ...current,
            tracking_url: event.target.value,
          }))
        }
      />
    </label>

    <label className="space-y-1 text-sm">
      <span className="font-medium">Dispatch Date</span>
      <input
        className="w-full rounded-md border px-3 py-2"
        type="date"
        value={
  shippingForm.dispatched_at ||
  (order.dispatched_at ? order.dispatched_at.slice(0, 10) : "")
}
        onChange={(event) =>
          setShippingForm((current) => ({
            ...current,
            dispatched_at: event.target.value,
          }))
        }
      />
    </label>

    <label className="space-y-1 text-sm">
      <span className="font-medium">Estimated Delivery Date</span>
      <input
        className="w-full rounded-md border px-3 py-2"
        type="date"
        value={
  shippingForm.estimated_delivery_at ||
  (order.estimated_delivery_date
    ? order.estimated_delivery_date.slice(0, 10)
    : "") ||
  (order.estimated_delivery_at
    ? order.estimated_delivery_at.slice(0, 10)
    : "")
}
        onChange={(event) =>
          setShippingForm((current) => ({
            ...current,
            estimated_delivery_at: event.target.value,
          }))
        }
      />
    </label>
  </div>

  <div className="mt-4 grid gap-3 rounded-md border bg-muted/20 p-3 text-sm md:grid-cols-2">
    <div>
      <span className="font-medium">Shiprocket Order ID:</span>{" "}
      {order.shiprocket_order_id || "Not created"}
    </div>
    <div>
      <span className="font-medium">Shipment ID:</span>{" "}
      {order.shipment_id || "Not assigned"}
    </div>
    <div>
      <span className="font-medium">Shipment Status:</span>{" "}
      {order.shipment_status || "Not started"}
    </div>
    <div>
      <span className="font-medium">AWB:</span>{" "}
      {order.awb_number || order.tracking_number || "Not assigned"}
    </div>
    <div>
      <span className="font-medium">Tracking URL:</span>{" "}
      {order.tracking_url ? (
        <a
          className="underline"
          href={order.tracking_url}
          rel="noreferrer"
          target="_blank"
        >
          Open tracking
        </a>
      ) : (
        "Not available"
      )}
    </div>
  </div>

  {order.shipment_id && !awbExists ? (
    <div className="mt-4 rounded-md border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Available Couriers</h3>
        {availableCouriersQuery.isFetching ? (
          <span className="text-xs text-muted-foreground">
            Fetching couriers...
          </span>
        ) : null}
      </div>

      {availableCouriersQuery.isError ? (
        <p className="mt-3 text-sm text-red-600">
          Could not fetch Shiprocket couriers.
        </p>
      ) : null}

      {availableCouriers.length > 0 ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Select</th>
                <th className="py-2">Courier</th>
                <th className="py-2">Freight</th>
                <th className="py-2">ETA</th>
                <th className="py-2">COD</th>
              </tr>
            </thead>
            <tbody>
              {availableCouriers.map((courier) => (
                <tr key={String(courier.courierId)} className="border-b">
                  <td className="py-2">
                    <input
                      checked={selectedCourierId === String(courier.courierId)}
                      onChange={() =>
                        setSelectedCourierId(String(courier.courierId))
                      }
                      type="radio"
                    />
                  </td>
                  <td className="py-2">{courier.courierName}</td>
                  <td className="py-2">{money(courier.freightCharge)}</td>
                  <td className="py-2">
                    {courier.estimatedDeliveryDays
                      ? `${courier.estimatedDeliveryDays} days`
                      : "N/A"}
                  </td>
                  <td className="py-2">
                    {courier.codAvailable ? "Available" : "Not available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {!availableCouriersQuery.isFetching &&
      !availableCouriersQuery.isError &&
      availableCouriers.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          No couriers returned for this shipment yet.
        </p>
      ) : null}
    </div>
  ) : null}

  <div className="mt-4 flex flex-wrap gap-2">
    <button
      type="button"
      disabled={updateShippingMutation.isPending}
      onClick={() => updateShippingMutation.mutate()}
      className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {updateShippingMutation.isPending ? "Saving..." : "Save Shipping Details"}
    </button>

    <button
      type="button"
      disabled={
        createShiprocketShipmentMutation.isPending ||
        !currentWarehouseId ||
        !shiprocketService.isConfigured()
      }
      onClick={() => createShiprocketShipmentMutation.mutate()}
      className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {createShiprocketShipmentMutation.isPending
        ? "Creating Shipment..."
        : "Create Shiprocket Shipment"}
    </button>

    <button
      type="button"
      disabled={
        generateAwbMutation.isPending ||
        awbExists ||
        !order.shipment_id ||
        !selectedCourierId ||
        !shiprocketService.isConfigured()
      }
      onClick={() => generateAwbMutation.mutate()}
      className="rounded-md border bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {awbExists
        ? "Tracking Live"
        : generateAwbMutation.isPending
          ? "Generating AWB..."
          : "Generate AWB"}
    </button>
  </div>

  {!shiprocketService.isConfigured() ? (
    <p className="mt-3 text-sm text-muted-foreground">
      Configure Shiprocket credentials to create shipments.
    </p>
  ) : null}

  {updateShippingMutation.isSuccess && (
    <p className="mt-3 text-sm text-green-600">
      Shipping details saved successfully.
    </p>
  )}

  {updateShippingMutation.isError && (
    <p className="mt-3 text-sm text-red-600">
      Could not save shipping details.
    </p>
  )}

  {createShiprocketShipmentMutation.isSuccess && (
    <p className="mt-3 text-sm text-green-600">
      Shiprocket order created. Assign courier/AWB from Shiprocket or continue with next step.
    </p>
  )}

  {createShiprocketShipmentMutation.isError && (
    <p className="mt-3 text-sm text-red-600">
      {createShiprocketShipmentMutation.error instanceof Error
        ? createShiprocketShipmentMutation.error.message
        : "Could not create Shiprocket shipment."}
    </p>
  )}

  {generateAwbMutation.isSuccess && (
    <p className="mt-3 text-sm text-green-600">
      AWB generated and tracking details saved.
    </p>
  )}

  {generateAwbMutation.isError && (
    <p className="mt-3 text-sm text-red-600">
      {generateAwbMutation.error instanceof Error
        ? generateAwbMutation.error.message
        : "Could not generate Shiprocket AWB."}
    </p>
  )}
</section>
      <section className="rounded-lg border bg-card p-4">
        <h2 className="mb-4 text-lg font-semibold">Ordered Products</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2">Product</th>
                <th className="py-2">Variant</th>
                <th className="py-2">Qty</th>
                <th className="py-2">Price</th>
                <th className="py-2">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => {
                const price = Number(item.price || item.unit_price || 0);
                const quantity = Number(item.quantity || 0);

                return (
                  <tr key={item.id || index} className="border-b">
                    <td className="py-3">
                      {item.product_name || item.productName || "Product"}
                    </td>
                    <td className="py-3">
                      {item.variant_name || item.variantName || "-"}
                    </td>
                    <td className="py-3">{quantity}</td>
                    <td className="py-3">{money(price)}</td>
                    <td className="py-3">{money(price * quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Payment Details</h2>
          <p>
            <strong>Method:</strong>{" "}
            {order.payment_method || order.paymentMethod || "N/A"}
          </p>
          <p>
            <strong>Status:</strong>{" "}
            {order.payment_status || order.paymentStatus || "Pending"}
          </p>
          <p>
            <strong>Reference:</strong>{" "}
            {order.payment_reference || order.paymentReference || "N/A"}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h2 className="mb-3 text-lg font-semibold">Order Summary</h2>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span>Warehouse</span>
              <span className="text-right">
                {assignedWarehouse
                  ? `${assignedWarehouse.name}, ${assignedWarehouse.city}`
                  : "Not assigned"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{money(order.shipping || order.shipping_charge)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>{money(order.discount)}</span>
            </div>

            <div className="flex justify-between border-t pt-2 text-base font-semibold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>
        </div>
      </section>
        </div>
  </>
);
}
