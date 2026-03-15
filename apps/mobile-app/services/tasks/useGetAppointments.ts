import { useMemo } from "react";

import { apiClient } from "@/lib/api-client";
import { TaskDetails, TaskType } from "@repo/models";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";

type GetAppointmentsResponse = {
  tasks: TaskDetails[];
  count: number;
};

type UseGetAppointmentsResult = UseQueryResult<
  GetAppointmentsResponse,
  Error
> & {
  appointments: TaskDetails[];
};

export const useGetAppointments = (
  userId: string,
  date?: string
): UseGetAppointmentsResult => {
  const query = useQuery<GetAppointmentsResponse, Error>({
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

      return (await res.json()) as GetAppointmentsResponse;
    },
    enabled: !!userId,
  });

  const appointments = useMemo(
    () =>
      (query.data?.tasks ?? []).filter(
        (task) => task.task_status_name !== "CANCELLED"
      ),
    [query.data?.tasks]
  );

  return { ...query, appointments };
};
