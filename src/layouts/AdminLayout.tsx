import { Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
