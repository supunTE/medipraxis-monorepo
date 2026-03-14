import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { apiClient } from "@/lib/api-client";

// Fetch task summary hook
export const useFetchTaskSummary = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["taskSummary", userId, date],
    queryFn: async () => {
      const response = await apiClient.api.tasks.summary.$get({
        query: {
          user_id: userId,
          date,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load task summary. Please try again.");
        return null;
      }

      const data = await response.json();
      return data;
    },
    enabled: !!userId && !!date,
  });
};
