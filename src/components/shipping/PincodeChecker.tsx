import { useState } from "react";
import { CircleCheck, MapPin } from "lucide-react";
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
  originPincode?: string | null;
  warehouseId?: string | null;
}

function formatDate(value: string | null) {
  if (!value) return "Confirmed after dispatch";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
  }).format(new Date(`${value}T00:00:00`));
}

export function PincodeChecker({
  compact = false,
  onEstimate,
  originPincode,
  warehouseId,
}: PincodeCheckerProps) {
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
        originPincode: originPincode ?? null,
        warehouseId: warehouseId ?? null,
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
    <div className="rounded-lg border border-maroon/10 bg-linen/35 p-3.5 sm:p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-maroon">
          <MapPin aria-hidden="true" size={16} />
        </span>
        <div>
          <h3 className="font-sans text-sm font-semibold text-charcoal">
            Delivery Estimate
          </h3>
          <p className="text-xs text-muted-foreground">
            See courier availability before checkout.
          </p>
        </div>
      </div>

      <div className={compact ? "mt-3 grid gap-2" : "mt-3 flex flex-col gap-2 sm:flex-row"}>
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
        <div className="mt-3 border-t border-maroon/10 pt-3 text-xs text-muted-foreground">
          <p className="flex items-center gap-2 font-semibold text-charcoal">
            {estimate.serviceable ? (
              <CircleCheck aria-hidden="true" className="text-maroon" size={16} />
            ) : null}
            {estimate.serviceable
              ? "Delivery Available"
              : "Delivery Not Available"}
          </p>
          {estimate.serviceable ? (
            <div className="mt-2 space-y-1.5">
              <p>
                Arrives by{" "}
                <strong className="font-sans text-sm font-semibold text-maroon">
                  {formatDate(estimate.estimatedDeliveryDate)}
                </strong>
              </p>
              <p className="font-medium text-charcoal">
                Cash on Delivery{" "}
                {estimate.codAvailable ? "Available" : "Unavailable"}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
