import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type GetTaskByIdPayload = {
  task_id: string;
};

type UseGetTaskByIdOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useGetTaskById = (options?: UseGetTaskByIdOptions) => {
  const mutation = useMutation({
    mutationFn: async (payload: GetTaskByIdPayload) => {
      const res = await apiClient.api.tasks[":id"].$get({
        param: {
          id: payload.task_id,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error instanceof Error ? error.message : "Failed to get task"
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

  return {
    ...mutation,
    isLoading: mutation.isPending,
  };
};
