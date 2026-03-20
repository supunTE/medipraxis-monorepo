import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

type FetchedUser = {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
};

// Fetch user by ID hook
export const useFetchUser = (userId: string) => {
  return useQuery<FetchedUser | null>({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await apiClient.api.users[":id"].$get({
        param: {
          id: userId,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load user. Please try again.");
        return null;
      }

      const data = (await response.json()) as { user: FetchedUser };
      return data.user;
    },
    enabled: !!userId,
  });
};
