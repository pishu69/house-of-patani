import { Outlet, useLocation } from "react-router-dom";
import { CartDrawerRoot } from "@/components/cart/CartDrawerRoot";
import { AnalyticsRouteTracker } from "@/components/common/AnalyticsRouteTracker";
import { RouteSeo } from "@/components/common/RouteSeo";
import { ScrollManager } from "@/components/common/ScrollManager";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function MainLayout() {
  const location = useLocation();
  const isOrderConfirmation = location.pathname.startsWith("/order-confirmation/");
  return (
    <div className="min-h-screen bg-background">
      <AnalyticsRouteTracker />
      <RouteSeo />
      <ScrollManager />
      <Navbar />
      <CartDrawerRoot />
      <main id="main-content">
        <Outlet />
      </main>
      {isOrderConfirmation ? null : <Footer />}
    </div>
  );
}
