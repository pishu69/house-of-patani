import { useQuery } from "@tanstack/react-query";

import { settingService } from "@/services";

export const settingsQueryKeys = {
  all: ["settings"] as const,
};

export function useSettings() {
  return useQuery({
    queryKey: settingsQueryKeys.all,
    queryFn: () => settingService.get(),
    staleTime: 5 * 60 * 1000,
  });
}
