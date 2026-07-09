import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
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
  groupNumber,
  order,
  shipment,
  warehouse,
}: {
  groupItems: ShipmentItem[];
  groupNumber: number;
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
  const totalQuantity = groupItems.reduce(
    (total, item) => total + Number(item.quantity || 0),
    0,
  );
  const totalWeight = groupItems.reduce(
    (total, item) =>
      total +
      Number(item.shipping_weight_kg || 0) * Number(item.quantity || 0),
    0,
  );
  const shipmentCreated = Boolean(
    shipment?.shiprocket_order_id || shipment?.shipment_id,
  );
  const awbGenerated = Boolean(shipment?.awb_number);

  return (
    <section className="overflow-hidden rounded-md border border-maroon/10 bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-maroon/10 bg-muted/15 px-4 py-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            Shipment Group {groupNumber}
          </p>
          <h3 className="mt-1 font-semibold text-charcoal">{warehouse.name}</h3>
        </div>
        <StatusBadge
          label={(shipment?.shipment_status || "Not started").replace(
            /_/g,
            " ",
          )}
          tone={awbGenerated ? "positive" : shipmentCreated ? "warning" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-b border-maroon/10 px-4 py-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Items</p>
          <p className="mt-0.5 font-semibold">{groupItems.length}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total quantity</p>
          <p className="mt-0.5 font-semibold">{totalQuantity}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Package weight</p>
          <p className="mt-0.5 font-semibold">
            {totalWeight > 0 ? `${totalWeight.toFixed(2)} kg` : "Not available"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Pickup pincode</p>
          <p className="mt-0.5 font-semibold">
            {warehouse.pickup_pincode || "Not configured"}
          </p>
        </div>
      </div>

      <ul className="divide-y divide-maroon/10 px-4">
        {groupItems.map((item) => (
          <li
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-2.5 text-sm"
            key={item.id}
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-charcoal">
                {item.product_name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {item.shipping_weight_kg
                  ? `${item.shipping_weight_kg.toFixed(2)} kg each`
                  : "Weight unavailable"}
              </p>
            </div>
            <p className="font-semibold">Qty {item.quantity}</p>
          </li>
        ))}
      </ul>

      <div className="grid gap-2 border-t border-maroon/10 bg-muted/10 px-4 py-3 text-xs text-muted-foreground sm:grid-cols-2">
        <p>Shipment ID: {shipment?.shipment_id || "Not assigned"}</p>
        <p>AWB: {shipment?.awb_number || "Not assigned"}</p>
      </div>

      <div className="px-4 py-3">
      {shipmentCreated && !awbGenerated ? (
        <div>
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

      <div className={shipmentCreated && !awbGenerated ? "mt-3 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
        {!shipmentCreated ? (
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={
            createMutation.isPending ||
            !warehouse.pickup_pincode
          }
          onClick={() => createMutation.mutate()}
          type="button"
        >
          {createMutation.isPending
            ? "Creating..."
            : "Create Shipment"}
        </button>
        ) : null}
        {shipmentCreated && !awbGenerated ? (
        <button
          className="rounded-md border border-maroon/30 px-4 py-2 text-sm font-medium text-maroon disabled:opacity-50"
          disabled={
            awbMutation.isPending ||
            !shipment?.shipment_id ||
            !selectedCourierId
          }
          onClick={() => awbMutation.mutate()}
          type="button"
        >
          {awbMutation.isPending
              ? "Generating..."
              : "Generate AWB"}
        </button>
        ) : null}
        {awbGenerated ? (
          <span className="inline-flex min-h-10 items-center rounded-md border border-maroon/15 bg-muted/20 px-4 text-sm font-semibold text-charcoal">
            AWB Generated
          </span>
        ) : null}
        {shipment?.tracking_url ? (
          <a
            className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            href={shipment.tracking_url}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink aria-hidden="true" size={15} />
            Open Tracking
          </a>
        ) : null}
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-600">
          {error instanceof Error ? error.message : "Shipment action failed."}
        </p>
      ) : null}
      </div>
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
          <ShipmentGroup
            groupItems={group.items}
            groupNumber={index + 1}
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
