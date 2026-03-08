import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const useGetSlotWindows = (userId: string, date?: string) => {
  return useQuery({
    queryKey: ["slot-windows", userId, date],
    queryFn: async () => {
      const res = await apiClient.api["slot-windows"].$get({
        query: {
          user_id: userId,
          ...(date && { date }),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch slot windows");
      }

      return res.json();
    },
    enabled: !!userId,
  });
};
