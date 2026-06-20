import { useState } from "react";
import { Outlet } from "react-router-dom";

import {
  AdminBreadcrumbs,
  DemoAdminBanner,
  AdminMobileMenu,
  AdminSidebar,
  AdminTopbar,
} from "@/components/admin";
import { Seo } from "@/components/common/Seo";
import { useAuth } from "@/hooks/useAuth";

export function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { session } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Seo
        canonicalPath="/admin"
        description="Private House of Patani administration workspace."
        noIndex
        title="Administration"
      />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <AdminSidebar />
      </aside>
      <AdminMobileMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <div className="min-h-screen lg:pl-64">
        {session?.isDemo ? <DemoAdminBanner /> : null}
        <AdminTopbar onOpenMenu={() => setIsMenuOpen(true)} />
        <main id="admin-main-content" className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-[90rem]">
            <AdminBreadcrumbs />
            <div className="mt-5">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
