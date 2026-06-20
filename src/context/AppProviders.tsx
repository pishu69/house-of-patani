import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";
import { CustomerAccountSync } from "@/components/account/CustomerAccountSync";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
        <CustomerAccountSync />
        {children}
        <Toaster
          closeButton
          position="top-right"
          richColors
          toastOptions={{
            className: "font-sans",
          }}
        />
      </MotionConfig>
    </QueryClientProvider>
  );
}
