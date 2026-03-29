import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type CancelAppointmentPayload = {
  task_id: string;
};

type UseCancelAppointmentOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useCancelAppointment = (options?: UseCancelAppointmentOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CancelAppointmentPayload) => {
      const res = await apiClient.api.tasks.appointments.cancel.$post({
        json: payload,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ??
            errorData?.message ??
            "Failed to cancel appointment"
        );
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
        queryClient.invalidateQueries({ queryKey: ["slot-windows"] }),
        queryClient.invalidateQueries({ queryKey: ["taskSummary"] }),
        queryClient.invalidateQueries({ queryKey: ["upcomingTasks"] }),
      ]);
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
