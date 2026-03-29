import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type ReserveAppointmentPayload = {
  slot_window_id: string;
  client_id: string;
};

type UseReserveAppointmentOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

const RESERVE_INVALIDATION_DELAY_MS = 5000;

export const useReserveAppointment = (
  options?: UseReserveAppointmentOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ReserveAppointmentPayload) => {
      const res = await apiClient.api.tasks.appointments.reserve.$post({
        json: payload,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ??
            errorData?.message ??
            "Failed to reserve appointment"
        );
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();

      // The reservation takes ~5s to fully process on the backend,
      // so we delay invalidation to avoid fetching stale data.
      setTimeout(() => {
        void Promise.all([
          queryClient.invalidateQueries({ queryKey: ["appointments"] }),
          queryClient.invalidateQueries({ queryKey: ["slot-windows"] }),
          queryClient.invalidateQueries({ queryKey: ["taskSummary"] }),
          queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] }),
        ]);
      }, RESERVE_INVALIDATION_DELAY_MS);
    },

    onError: (error) => {
      options?.onError?.(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    },
  });
};
