import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

type SlotWindow = {
  slot_window_id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  total_slots: number;
  slots_filled: number;
  location: string | null;
  note: string | null;
};

type UseGetSlotWindowsOptions = {
  userId: string;
  enabled?: boolean;
};

export const useGetSlotWindows = ({
  userId,
  enabled = true,
}: UseGetSlotWindowsOptions) => {
  return useQuery({
    queryKey: ["slot-windows", userId],
    queryFn: async () => {
      const res = await apiClient.api["slot-windows"].$get({
        query: { user_id: userId },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch slot windows");
      }

      const data = await res.json();
      return data.slotWindows as SlotWindow[];
    },
    enabled: enabled && !!userId,
  });
};
