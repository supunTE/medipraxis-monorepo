import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export const useShareableCalendarLink = (linkId: string) => {
  return useQuery({
    queryKey: ["shareable-calendar-link", linkId],
    queryFn: async () => {
      const res = await apiClient.api["shareable-calendar-links"][":id"].$get({
        param: {
          id: linkId,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch shareable calendar link");
      }

      return res.json();
    },
    enabled: !!linkId,
  });
};
