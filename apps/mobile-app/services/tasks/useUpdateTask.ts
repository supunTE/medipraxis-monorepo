import { apiClient } from "@/lib/api-client";
import type { UpdateTaskInput } from "@repo/models";
import { useMutation } from "@tanstack/react-query";

export type UpdateTaskPayload = {
  task_id: string;
  data: UpdateTaskInput;
};

type UseUpdateTaskOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export type UseUpdateTaskReturn = ReturnType<typeof useMutation> & {
  isLoading: boolean;
};

export const useUpdateTask = (options?: UseUpdateTaskOptions) => {
  const mutation = useMutation({
    mutationFn: async (payload: UpdateTaskPayload) => {
      const res = await apiClient.api.tasks[":id"].$put({
        param: {
          id: payload.task_id,
        },
        json: payload.data,
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(
          error instanceof Error ? error.message : "Failed to update task"
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
