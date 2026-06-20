import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import { OrderDetails } from "@/components/account/OrderDetails";
import { EmptyState } from "@/components/common/EmptyState";
import { Loading } from "@/components/common/Loading";
import { ROUTES } from "@/constants/routes";
import { useCustomerOrder, useSettings } from "@/hooks";

export function OrderDetailsPage() {
  const { orderNumber } = useParams();
  const orderQuery = useCustomerOrder(orderNumber);
  const settingsQuery = useSettings();
  const confirmation = orderQuery.data?.data;

  if (orderQuery.isLoading) return <Loading />;

  if (!confirmation) {
    return (
      <EmptyState
        action={
          <Link
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-maroon/25 px-4 text-sm font-semibold text-maroon"
            to={ROUTES.ACCOUNT.ORDERS_PATH}
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back to orders
          </Link>
        }
        description="This order does not match the contact details saved in your profile. Try secure guest order lookup instead."
        title="Order not available"
      />
    );
  }

  const supportNumber =
    settingsQuery.data?.data.whatsappNumber.replace(/\D/g, "") ?? "";
  const supportUrl = supportNumber
    ? `https://wa.me/${supportNumber}?text=${encodeURIComponent(
        `Hello House of Patani, I need help with order ${confirmation.order.order_number}.`,
      )}`
    : "#";

  return <OrderDetails confirmation={confirmation} supportUrl={supportUrl} />;
}
