import { apiClient } from "@/lib/api-client";
import type { ReportFileUrlResponse } from "@repo/models";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useFetchReportFile = (userId: string, reportId: string) => {
  return useQuery({
    queryKey: ["report-file", userId, reportId],
    queryFn: async () => {
      const response = await apiClient.api["client-reports"][":user_id"][":id"][
        "file"
      ].$get({
        param: { user_id: userId, id: reportId },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load report. Please try again.");
        throw new Error("Failed to fetch report file");
      }

      const data = await response.json();
      return data as ReportFileUrlResponse;
    },
    enabled: !!userId && !!reportId,
    staleTime: 0,
    gcTime: 0,
  });
};
