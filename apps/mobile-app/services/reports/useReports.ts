import { apiClient } from "@/lib/api-client";
import type {
  CreateRequestReportInput,
  GroupedClientReport,
} from "@repo/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

/**
 * Create a request report
 */
export const useCreateRequestReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateRequestReportInput) => {
      const response = await apiClient.api["request-reports"].$post({
        json: payload,
      });

      if (!response.ok) {
        try {
          const errorData = (await response.json()) as {
            error?: string;
            message?: string;
          };
          throw new Error(
            errorData.error ||
              errorData.message ||
              "Failed to create request report"
          );
        } catch {
          throw new Error("Failed to create request report");
        }
      }

      const data = await response.json();
      return data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["grouped-reports", variables.user_id],
      });
      Alert.alert("Success", "Report request sent successfully");
    },
    onError: (error: Error) => {
      Alert.alert(
        "Error",
        error.message || "Failed to send request report. Please try again."
      );
    },
  });
};
