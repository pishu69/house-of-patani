import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderShipmentService } from "@/services/order-shipment.service";
import {
  shiprocketService,
  type ShiprocketCourierOption,
} from "@/services/shiprocket.service";
import type {
  OrderItemRow,
  OrderRow,
  OrderShipmentRow,
  WarehouseRow,
} from "@/types/database.types";
import type { CatalogProduct } from "@/types/product.types";

type ShipmentItem = OrderItemRow & {
  package_breadth_cm?: number;
  package_height_cm?: number;
  package_length_cm?: number;
  shipping_weight_kg?: number;
};

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number") return String(value);
  }
  return "";
}

function addDays(days: number | null) {
  if (!days) return null;
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function ShipmentGroup({
  groupItems,
  order,
  shipment,
  warehouse,
}: {
  groupItems: ShipmentItem[];
  order: OrderRow;
  shipment: OrderShipmentRow | null;
  warehouse: WarehouseRow;
}) {
  const queryClient = useQueryClient();
  const [selectedCourierId, setSelectedCourierId] = useState("");
  const shipmentQueryKey = ["order-shipments", order.id];
  const couriersQuery = useQuery({
    enabled: Boolean(shipment?.shipment_id && !shipment.awb_number),
    queryFn: () =>
      shiprocketService.listCouriers(String(shipment?.shipment_id)),
    queryKey: ["shipment-group-couriers", shipment?.shipment_id],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const shipmentRow =
        shipment ??
        (
          await orderShipmentService.ensure(order.id, warehouse.id)
        ).data;
      const response = await shiprocketService.createShipment({
        items: groupItems,
        order,
        shipmentGroupId: shipmentRow.id,
        warehouse,
      });
      const shipmentId = firstString(
        response?.shipment_id,
        response?.data?.shipment_id,
        response?.order?.shipment_id,
        response?.response?.data?.shipment_id,
      );
      const shiprocketOrderId = firstString(
        response?.order_id,
        response?.data?.order_id,
        response?.order?.order_id,
        response?.response?.data?.order_id,
        response?.channel_order_id,
      );

      if (!shipmentId && !shiprocketOrderId) {
        throw new Error(
          firstString(response?.message, response?.error) ||
            "Shiprocket did not confirm shipment creation.",
        );
      }

      return orderShipmentService.update(shipmentRow.id, {
        shipment_id: shipmentId || null,
        shipment_status: "order_created",
        shiprocket_order_id: shiprocketOrderId || null,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shipmentQueryKey }),
  });

  const awbMutation = useMutation({
    mutationFn: async () => {
      if (!shipment?.shipment_id) {
        throw new Error("Create this shipment before generating its AWB.");
      }
      const courier = couriersQuery.data?.couriers.find(
        (item) => String(item.courierId) === selectedCourierId,
      );
      if (!courier) throw new Error("Select a courier.");

      const response = await shiprocketService.generateAwb(
        shipment.shipment_id,
        Number(courier.courierId),
      );
      const awbNumber = firstString(
        response?.awb_code,
        response?.assigned_awb_code,
        response?.response?.data?.awb_code,
        response?.data?.awb_code,
      );
      if (!awbNumber) {
        throw new Error(
          firstString(response?.message, response?.error) ||
            "Shiprocket did not return an AWB.",
        );
      }
      const estimatedDeliveryDate =
        courier.estimatedDeliveryDate ||
        addDays(courier.estimatedDeliveryDays);

      return orderShipmentService.update(shipment.id, {
        awb_number: awbNumber,
        courier_name: courier.courierName,
        estimated_delivery_date: estimatedDeliveryDate,
        shipment_status: "awb_generated",
        tracking_url: `https://shiprocket.co/tracking/${awbNumber}`,
      });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: shipmentQueryKey }),
  });

  const couriers = couriersQuery.data?.couriers ?? [];
  const error = createMutation.error || awbMutation.error;

  return (
    <section className="rounded-md border bg-muted/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{warehouse.name}</h3>
          <p className="text-xs text-muted-foreground">
            Pickup PIN: {warehouse.pickup_pincode || "Not configured"}
          </p>
        </div>
        <span className="text-xs font-medium uppercase text-muted-foreground">
          {shipment?.shipment_status || "Not started"}
        </span>
      </div>

      <ul className="mt-3 space-y-1 text-sm">
        {groupItems.map((item) => (
          <li className="flex justify-between gap-4" key={item.id}>
            <span>{item.product_name}</span>
            <span>x {item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <p>Shipment ID: {shipment?.shipment_id || "Not assigned"}</p>
        <p>AWB: {shipment?.awb_number || "Not assigned"}</p>
        <p>
          Tracking:{" "}
          {shipment?.tracking_url ? (
            <a
              className="text-maroon underline"
              href={shipment.tracking_url}
              rel="noreferrer"
              target="_blank"
            >
              Open tracking
            </a>
          ) : (
            "Not available"
          )}
        </p>
      </div>

      {shipment?.shipment_id && !shipment.awb_number ? (
        <div className="mt-4">
          <label className="text-sm font-medium">
            Courier
            <select
              className="mt-1 h-10 w-full rounded-md border bg-background px-3"
              onChange={(event) => setSelectedCourierId(event.target.value)}
              value={selectedCourierId}
            >
              <option value="">
                {couriersQuery.isFetching
                  ? "Loading couriers..."
                  : "Select courier"}
              </option>
              {couriers.map((courier: ShiprocketCourierOption) => (
                <option
                  key={String(courier.courierId)}
                  value={String(courier.courierId)}
                >
                  {courier.courierName}
                  {courier.freightCharge !== null
                    ? ` - INR ${courier.freightCharge}`
                    : ""}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={
            createMutation.isPending ||
            Boolean(shipment?.shiprocket_order_id || shipment?.shipment_id) ||
            !warehouse.pickup_pincode
          }
          onClick={() => createMutation.mutate()}
          type="button"
        >
          {createMutation.isPending
            ? "Creating..."
            : shipment?.shiprocket_order_id || shipment?.shipment_id
              ? "Shipment Created"
              : "Create Shiprocket Shipment"}
        </button>
        <button
          className="rounded-md border border-maroon/30 px-4 py-2 text-sm font-medium text-maroon disabled:opacity-50"
          disabled={
            awbMutation.isPending ||
            Boolean(shipment?.awb_number) ||
            !shipment?.shipment_id ||
            !selectedCourierId
          }
          onClick={() => awbMutation.mutate()}
          type="button"
        >
          {shipment?.awb_number
            ? "Tracking Live"
            : awbMutation.isPending
              ? "Generating..."
              : "Generate AWB"}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600">
          {error instanceof Error ? error.message : "Shipment action failed."}
        </p>
      ) : null}
    </section>
  );
}

export function OrderShipmentGroups({
  items,
  order,
  products,
  warehouses,
}: {
  items: OrderItemRow[];
  order: OrderRow;
  products: CatalogProduct[];
  warehouses: WarehouseRow[];
}) {
  const shipmentsQuery = useQuery({
    enabled: Boolean(order.id),
    queryFn: () => orderShipmentService.list(order.id),
    queryKey: ["order-shipments", order.id],
  });
  const fallbackWarehouse =
    warehouses.find((warehouse) => warehouse.pickup_pincode === "302001") ??
    null;
  const groups = useMemo(() => {
    const grouped = new Map<
      string,
      { items: ShipmentItem[]; warehouse: WarehouseRow }
    >();

    for (const item of items) {
      const product = products.find(
        (candidate) => candidate.id === item.product_id,
      );
      const warehouse =
        warehouses.find(
          (candidate) => candidate.id === product?.warehouseId,
        ) ?? fallbackWarehouse;
      if (!warehouse) continue;

      const current = grouped.get(warehouse.id) ?? {
        items: [],
        warehouse,
      };
      current.items.push({
        ...item,
        package_breadth_cm: product?.packageBreadthCm ?? 25,
        package_height_cm: product?.packageHeightCm ?? 5,
        package_length_cm: product?.packageLengthCm ?? 30,
        shipping_weight_kg: product?.shippingWeightKg ?? 0.7,
      });
      grouped.set(warehouse.id, current);
    }

    return [...grouped.values()];
  }, [fallbackWarehouse, items, products, warehouses]);

  if (shipmentsQuery.isError) {
    return (
      <p className="text-sm text-red-600">
        Could not load shipment groups. Apply the order_shipments migration.
      </p>
    );
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Assign products to warehouses or configure a Jaipur warehouse with
        pickup PIN 302001.
      </p>
    );
  }

  const shipments = shipmentsQuery.data?.data ?? [];

  return (
    <div className="space-y-4">
      {groups.map((group, index) => (
        <div key={group.warehouse.id}>
          <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
            Shipment Group {index + 1}
          </p>
          <ShipmentGroup
            groupItems={group.items}
            order={order}
            shipment={
              shipments.find(
                (shipment) =>
                  shipment.warehouse_id === group.warehouse.id,
              ) ?? null
            }
            warehouse={group.warehouse}
          />
        </div>
      ))}
    </div>
  );
}
