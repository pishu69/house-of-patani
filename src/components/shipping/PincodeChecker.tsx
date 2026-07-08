import { useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  shiprocketEstimateStorage,
  shiprocketService,
  type ShiprocketDeliveryEstimate,
} from "@/services/shiprocket.service";

interface PincodeCheckerProps {
  compact?: boolean;
  onEstimate?: (estimate: ShiprocketDeliveryEstimate) => void;
}

function formatDate(value: string | null) {
  if (!value) return "Confirmed after dispatch";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00`));
}

export function PincodeChecker({ compact = false, onEstimate }: PincodeCheckerProps) {
  const [pincode, setPincode] = useState(
    shiprocketEstimateStorage.get()?.pincode ?? "",
  );
  const [estimate, setEstimate] = useState<ShiprocketDeliveryEstimate | null>(
    shiprocketEstimateStorage.get(),
  );
  const [isChecking, setIsChecking] = useState(false);

  async function checkPincode() {
    try {
      setIsChecking(true);
      const nextEstimate = await shiprocketService.checkServiceability({
        cod: true,
        deliveryPincode: pincode,
      });
      setEstimate(nextEstimate);
      onEstimate?.(nextEstimate);
    } catch (error) {
      toast.error("Delivery estimate unavailable.", {
        description:
          error instanceof Error
            ? error.message
            : "Please try again after some time.",
      });
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <div className="rounded-lg border border-maroon/10 bg-linen/35 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-maroon">
          <MapPin aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="font-sans text-sm font-semibold text-charcoal">
            Check delivery by PIN
          </h3>
          <p className="text-xs text-muted-foreground">
            See courier availability before checkout.
          </p>
        </div>
      </div>

      <div className={compact ? "mt-3 grid gap-2" : "mt-4 flex flex-col gap-2 sm:flex-row"}>
        <input
          className="h-11 min-w-0 rounded-full border border-maroon/15 bg-card px-4 text-sm"
          inputMode="numeric"
          maxLength={6}
          onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
          placeholder="Enter pincode"
          value={pincode}
        />
        <Button
          disabled={isChecking || pincode.length !== 6}
          onClick={checkPincode}
          size="sm"
          type="button"
          variant="outline"
        >
          {isChecking ? "Checking..." : "Check"}
        </Button>
      </div>

      {estimate ? (
        <div className="mt-3 grid gap-2 text-xs leading-5 text-muted-foreground sm:grid-cols-2">
          <span className="flex items-center gap-2 text-charcoal">
            <Truck aria-hidden="true" size={15} />
            {estimate.serviceable ? "Delivery available" : "Not serviceable"}
          </span>
          <span>Estimated: {formatDate(estimate.estimatedDeliveryDate)}</span>
          <span>COD: {estimate.codAvailable ? "Available" : "Not available"}</span>
          <span>Courier: {estimate.courierName || "Not assigned"}</span>
        </div>
      ) : null}
    </div>
  );
}
