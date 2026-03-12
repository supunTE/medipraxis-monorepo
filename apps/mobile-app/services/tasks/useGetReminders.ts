import { useMemo } from "react";

import { type AgendaReminderData } from "@/components/advanced";
import { apiClient } from "@/lib/api-client";
import { formatISOToTime } from "@/utils";
import { TaskType } from "@repo/models";
import { useQuery } from "@tanstack/react-query";

export const useGetReminders = (userId: string, date: string) => {
  const query = useQuery({
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

  const reminders: AgendaReminderData[] = useMemo(() => {
    if (!query.data?.tasks) return [];
    return query.data.tasks.map((task) => ({
      content: { id: task.task_id, title: task.task_title },
      startTime: formatISOToTime(task.start_date),
      ...(task.end_date && { endTime: formatISOToTime(task.end_date) }),
    }));
  }, [query.data]);

  return { ...query, reminders };
};
