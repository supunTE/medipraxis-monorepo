import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export const useShareableCalendarLink = (linkId: string, clientId: string) => {
  return useQuery({
    queryKey: ["shareable-calendar-link", linkId, clientId],
    queryFn: async () => {
      const res = await apiClient.api["shareable-calendar-links"][":id"].$get({
        param: {
          id: linkId,
        },
        query: {
          client_id: clientId,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch shareable calendar link");
      }

      return res.json();
    },
    enabled: !!linkId && !!clientId,
  });
};
