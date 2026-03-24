import { apiClient } from "@/lib/api-client";
import type { ClientReport } from "@repo/models";
import { useMutation } from "@tanstack/react-query";

export const useFetchClientReports = () => {
  return useMutation({
    mutationFn: async (payload: { user_id: string; client_id: string }) => {
      const response = await (apiClient.api["client-reports"] as any).$get({
        json: {
          user_id: payload.user_id,
          client_id: payload.client_id,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch client reports");
      }

      return (await response.json()) as {
        reports: ClientReport[];
        count: number;
      };
    },
  });
};
