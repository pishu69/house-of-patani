import { QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { queryClient } from "@/lib/query-client";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MotionConfig reducedMotion="user">
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
