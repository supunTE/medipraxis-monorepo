import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UseCancelSlotWindowOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useCancelSlotWindow = (options?: UseCancelSlotWindowOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slotWindowId: string) => {
      const res = await apiClient.api["slot-windows"][":id"].cancel.$post({
        param: { id: slotWindowId },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ??
            errorData?.message ??
            "Failed to cancel slot window"
        );
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();

      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["slot-windows"] }),
        queryClient.invalidateQueries({ queryKey: ["appointments"] }),
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
