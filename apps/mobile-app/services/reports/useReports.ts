import { apiClient } from "@/lib/api-client";
import type { GroupedClientReport } from "@repo/models";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

/**
 * Fetch grouped reports by user ID
 * @param userId - The user ID to fetch reports for
 * @param completed - Filter by completion status (true for completed, false for pending)
 */
export const useFetchGroupedReports = (userId: string, completed?: boolean) => {
  return useQuery({
    queryKey: ["grouped-reports", userId, completed],
    queryFn: async () => {
      const response = await apiClient.api["client-reports"].grouped.$get({
        query: {
          user_id: userId,
          ...(completed !== undefined
            ? { completed: completed.toString() }
            : {}),
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load reports. Please try again.");
        return [];
      }

      const data = await response.json();
      return data.grouped_reports as GroupedClientReport[];
    },
  });
};
