import { apiClient } from "@/lib/api-client";
import type { CreateShareableCalendarLinkBody } from "@repo/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/**
 * Fetch shareable calendar link by user ID
 * @param userId - The user ID to fetch the shareable calendar link for
 */
export const useFetchShareableCalendarLinkByUserId = (userId: string) => {
  return useQuery({
    queryKey: ["shareable-calendar-link", userId],
    queryFn: async () => {
      const response = await apiClient.api["shareable-calendar-links"].user[
        ":userId"
      ].$get({
        param: {
          userId,
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!userId,
  });
};

/**
 * Create or update shareable calendar link
 */
export const useCreateOrUpdateShareableCalendarLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateShareableCalendarLinkBody) => {
      const response = await apiClient.api["shareable-calendar-links"].$put({
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
              "Failed to create/update shareable calendar link"
          );
        } catch {
          throw new Error("Failed to create/update shareable calendar link");
        }
      }

      const data = await response.json();
      return data;
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["shareable-calendar-link", variables.user_id],
      });
    },
  });
};
