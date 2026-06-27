import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { OrderInvoice } from "@/components/admin/OrderInvoice";
import type { OrderStatus } from "@/constants/order-status";

type AnyRecord = Record<string, any>;

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
  const [localStatus, setLocalStatus] = useState<OrderStatus | null>(null);

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