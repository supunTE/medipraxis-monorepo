import { apiClient } from "@/lib/api-client";
import { TaskType } from "@repo/models";
import { useQuery } from "@tanstack/react-query";

export const useGetAppointments = (userId: string, date?: string) => {
  return useQuery({
    queryKey: ["appointments", userId, date],
    queryFn: async () => {
      const res = await apiClient.api.tasks.$get({
        query: {
          user_id: userId,
          task_type: TaskType.APPOINTMENT,
          ...(date && { date }),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch appointments");
      }

      return res.json();
    },
    enabled: !!userId,
  });
};
