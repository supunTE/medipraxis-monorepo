import { useMemo } from "react";

import { type AgendaTimeBlockGroupData } from "@/components/advanced";
import { apiClient } from "@/lib/api-client";
import { formatISOToTime } from "@/utils";
import { type SlotWindow } from "@repo/models";
import { type UseQueryResult, useQuery } from "@tanstack/react-query";

type GetSlotWindowsResponse = {
  slotWindows: SlotWindow[];
  count: number;
};

type UseGetSlotWindowsResult = UseQueryResult<GetSlotWindowsResponse, Error> & {
  timeBlockGroups: AgendaTimeBlockGroupData[];
};

export const useGetSlotWindows = (
  userId: string,
  date?: string
): UseGetSlotWindowsResult => {
  const query = useQuery<GetSlotWindowsResponse, Error>({
    queryKey: ["slot-windows", userId, date],
    queryFn: async () => {
      const res = await apiClient.api["slot-windows"].$get({
        query: {
          user_id: userId,
          ...(date && { date }),
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch slot windows");
      }

      return (await res.json()) as GetSlotWindowsResponse;
    },
    enabled: !!userId,
  });

  const timeBlockGroups: AgendaTimeBlockGroupData[] = useMemo(() => {
    if (!query.data?.slotWindows) return [];

    return [...query.data.slotWindows]
      .sort(
        (left, right) =>
          new Date(left.start_date).getTime() -
          new Date(right.start_date).getTime()
      )
      .map((slotWindow) => ({
        id: slotWindow.slot_window_id,
        startTime: formatISOToTime(slotWindow.start_date),
        endTime: formatISOToTime(slotWindow.end_date),
        slots: slotWindow.total_slots,
        contents: Array.from({ length: slotWindow.total_slots }, () => null),
      }));
  }, [query.data?.slotWindows]);

  return { ...query, timeBlockGroups };
};
