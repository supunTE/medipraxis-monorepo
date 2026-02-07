import { apiClient } from "@/lib";
import { useQuery } from "@tanstack/react-query";

export const useRequestReport = (requestReportId: string) => {
  return useQuery({
    queryKey: ["request-report", requestReportId],
    queryFn: async () => {
      const res = await apiClient.api["request-reports"][":id"].$get({
        param: { id: requestReportId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch report details");
      }

      return res.json();
    },
    enabled: !!requestReportId,
  });
};
