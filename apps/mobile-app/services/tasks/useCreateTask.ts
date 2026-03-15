import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";

export type CreateTaskPayload = {
  task_title: string;
  user_id: string;
  end_date: string;
  // Optional fields
  task_type_id?: string;
  task_status_id?: string;
  client_id?: string;
  start_date?: string;
  note?: string;
  set_alarm?: boolean;
  // Appointment-specific
  appointment_number?: number;
  slot_window_id?: string;
  created_by?: "PRACTITIONER" | "CLIENT";
};

type UseCreateTaskOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useCreateTask = (options?: UseCreateTaskOptions) => {
  return useMutation({
    mutationFn: async (payload: CreateTaskPayload) => {
      const res = await apiClient.api.tasks.$post({
        json: payload,
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ?? errorData?.message ?? "Failed to create task"
        );
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
