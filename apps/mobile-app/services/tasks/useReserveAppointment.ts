import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

export type ReserveAppointmentPayload = {
  slot_window_id: string;
  client_id: string;
};

type UseReserveAppointmentOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useReserveAppointment = (
  options?: UseReserveAppointmentOptions
) => {
  return useMutation({
    mutationFn: async (payload: ReserveAppointmentPayload) => {
      const res = await apiClient.api.tasks.appointments.reserve.$post({
        json: payload,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error?.error ?? "Failed to reserve appointment");
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();
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
