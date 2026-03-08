import { apiClient } from "@/lib/api-client";
import { TaskType } from "@repo/models";
import { useQuery } from "@tanstack/react-query";

export const useGetReminders = (userId: string, date: string) => {
  return useQuery({
    queryKey: ["reminders", userId, date],
    queryFn: async () => {
      const res = await apiClient.api.tasks.$get({
        query: {
          user_id: userId,
          task_type: TaskType.REMINDER,
          date,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch reminders");
      }

      return res.json();
    },
    enabled: !!userId && !!date,
  });
};
