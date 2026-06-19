import { Outlet } from "react-router-dom";
import { ScrollManager } from "@/components/common/ScrollManager";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ScrollManager />
      <Navbar />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
