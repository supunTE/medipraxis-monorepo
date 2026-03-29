import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UseDeactivateSlotWindowTemplateOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useDeactivateSlotWindowTemplate = (
  options?: UseDeactivateSlotWindowTemplateOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiClient.api["slot-windows"].templates[":id"].deactivate.$post({
        param: { id: templateId },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ??
            errorData?.message ??
            "Failed to deactivate slot window template"
        );
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();
      void queryClient.invalidateQueries({ queryKey: ["slot-window-templates"] });
      void queryClient.invalidateQueries({ queryKey: ["slot-windows"] });
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
