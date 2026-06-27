import type { OrderConfirmation } from "@/types/order.types";

type Props = {
  confirmation: OrderConfirmation;
};

const money = (value: unknown) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export function OrderInvoice({ confirmation }: Props) {
  const { order, items } = confirmation;
  const shippingAddress = order.shipping_address as Record<string, any> | null;

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 12mm;
            }

            body * {
              visibility: hidden !important;
            }

            #order-invoice,
            #order-invoice * {
              visibility: visible !important;
            }

            #order-invoice {
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}
      </style>

      <div id="order-invoice" className="hidden bg-white text-black print:block">
        <div className="mx-auto max-w-3xl p-6 text-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold tracking-wide">
              HOUSE OF PATANI
            </h1>
            <p>Premium Heritage E-Commerce</p>
          </div>

          <div className="mb-5 grid grid-cols-2 gap-4">
            <div>
              <p><strong>Invoice No:</strong> INV-{order.order_number}</p>
              <p><strong>Order No:</strong> {order.order_number}</p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(order.created_at).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="text-right">
              <p><strong>Status:</strong> {order.order_status}</p>
              <p><strong>Payment:</strong> {order.payment_method}</p>
              <p><strong>Payment Status:</strong> {order.payment_status}</p>
            </div>
          </div>

          <div className="mb-5 border-y py-3">
            <h2 className="mb-2 font-semibold">Bill / Ship To</h2>
            <p>{order.customer_name}</p>
            <p>{order.customer_phone}</p>
            <p>{order.customer_email}</p>
            <p>
              {shippingAddress?.addressLine1 || shippingAddress?.address_line1}
            </p>
            <p>
              {shippingAddress?.addressLine2 || shippingAddress?.address_line2}
            </p>
            <p>
              {shippingAddress?.city}, {shippingAddress?.state} -{" "}
              {shippingAddress?.pincode}
            </p>
            <p>{shippingAddress?.country || "India"}</p>
          </div>

          <table className="mb-5 w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Product</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => {
                const price = Number(item.price || 0);
                const quantity = Number(item.quantity || 0);

                return (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.product_name}</td>
                    <td className="py-2 text-right">{quantity}</td>
                    <td className="py-2 text-right">{money(price)}</td>
                    <td className="py-2 text-right">
                      {money(price * quantity)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="ml-auto w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{money(order.subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{money(order.shipping)}</span>
            </div>

            <div className="flex justify-between">
              <span>Discount</span>
              <span>{money(order.discount)}</span>
            </div>

            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>Total</span>
              <span>{money(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p>Thank you for shopping with House of Patani.</p>
          </div>
        </div>
      </div>
    </>
  );
}