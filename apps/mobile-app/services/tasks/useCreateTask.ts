import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type CreateTaskPayload = {
  task_title: string;
  client: string;
  start_date: string;
  end_date: string;
  note: string;
  alarm: boolean;
  user_id: string;
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
        const error = await res.json();
        throw new Error(error?.error ?? "Failed to create task");
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
