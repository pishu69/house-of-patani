import { Bell, Building2, ReceiptText } from "lucide-react";
import { toast } from "sonner";

import { DashboardCard, PageTitle } from "@/components/admin";
import { Button } from "@/components/ui/button";

const inputClassName =
  "mt-2 h-11 w-full rounded-md border border-maroon/15 bg-background px-3 text-sm text-charcoal";

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageTitle
        action={
          <Button
            onClick={() =>
              toast.info("Settings persistence will be enabled in Phase 7B.")
            }
          >
            Save settings
          </Button>
        }
        description="Store preferences are arranged here for later persistence."
        title="Settings"
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard
          description="Identity used across operational documents."
          title="Store profile"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-charcoal">
              Store name
              <input
                className={inputClassName}
                defaultValue="House of Patani"
                type="text"
              />
            </label>
            <label className="text-sm font-medium text-charcoal">
              Support email
              <input
                className={inputClassName}
                defaultValue="care@houseofpatani.com"
                type="email"
              />
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <Building2 aria-hidden="true" className="text-gold" size={18} />
            Business identity and contact details.
          </div>
        </DashboardCard>

        <DashboardCard
          description="Defaults for order calculation and fulfilment."
          title="Commerce"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-charcoal">
              Currency
              <select className={inputClassName} defaultValue="INR">
                <option value="INR">Indian Rupee (INR)</option>
              </select>
            </label>
            <label className="text-sm font-medium text-charcoal">
              Free shipping above
              <input
                className={inputClassName}
                defaultValue="5000"
                min="0"
                type="number"
              />
            </label>
          </div>
          <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
            <ReceiptText aria-hidden="true" className="text-gold" size={18} />
            Order totals and fulfilment defaults.
          </div>
        </DashboardCard>

        <DashboardCard
          className="xl:col-span-2"
          description="Choose which operational updates should be surfaced."
          title="Notifications"
        >
          <div className="flex items-start gap-3 rounded-md border border-maroon/10 bg-background p-4">
            <Bell aria-hidden="true" className="mt-0.5 text-gold" size={18} />
            <div>
              <p className="text-sm font-semibold text-charcoal">
                Order activity email
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Receive a summary when new orders enter the queue.
              </p>
            </div>
            <input
              aria-label="Order activity email"
              className="ml-auto h-4 w-4 accent-maroon"
              defaultChecked
              type="checkbox"
            />
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
