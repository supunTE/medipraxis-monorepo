import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useFetchUpcomingTasks = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["upcomingTasks", userId, date],
    queryFn: async () => {
      const response = await apiClient.api.tasks.upcoming.$get({
        query: {
          user_id: userId,
          date,
        },
      });

      if (!response.ok) {
        Alert.alert(
          "Error",
          "Failed to load upcoming tasks. Please try again."
        );
        return null;
      }

      const data = await response.json();
      return data;
    },
    enabled: !!userId && !!date,
  });
};