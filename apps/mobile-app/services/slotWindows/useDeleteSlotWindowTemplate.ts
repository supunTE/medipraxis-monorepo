import { apiClient } from "@/lib/api-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type UseDeleteSlotWindowTemplateOptions = {
  onSuccess?: () => void;
  onError?: (message: string) => void;
};

export const useDeleteSlotWindowTemplate = (
  options?: UseDeleteSlotWindowTemplateOptions
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (templateId: string) => {
      const res = await apiClient.api["slot-windows"].templates[":id"].$delete({
        param: { id: templateId },
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => ({}))) as any;
        throw new Error(
          errorData?.error ??
            errorData?.message ??
            "Failed to delete slot window template"
        );
      }

      return res.json();
    },

    onSuccess: () => {
      options?.onSuccess?.();

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
