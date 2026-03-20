import { apiClient } from "@/lib/api-client";
import type { FormType } from "@repo/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Save form input type
export interface SaveFormInput {
  title: string;
  description: string;
  user_id: string;
  form_type: FormType;
  form_configuration: Array<{
    field_type: string;
    display_label: string;
    description: string;
    help_text: string;
    active: boolean;
    required: boolean;
    shareable: boolean;
    sequence: number;
  }>;
}

// Form response from API
export interface FormResponse {
  form: {
    form_id: string;
    title: string;
    description: string | null;
    version: number;
    is_active: boolean;
    created_date: string;
    updated_date: string;
    form_configuration: Array<{
      field_type: string;
      display_label: string;
      description: string;
      help_text: string;
      active: boolean;
      required: boolean;
      shareable: boolean;
      sequence: number;
    }>;
    user_id: string;
    form_type: string;
  };
}

// Fetch active form hook
export const useFetchActiveForm = (userId: string, formType: FormType) => {
  return useQuery({
    queryKey: ["activeForm", userId, formType],
    queryFn: async () => {
      const response = await apiClient.api.forms.active.$get({
        query: {
          user_id: userId,
          form_type: formType,
        },
      });

      if (!response.ok) {
        // If 404, no active form exists yet - return null
        if (response.status === 404) {
          return null;
        }
        throw new Error("Failed to fetch active form");
      }

      const data = (await response.json()) as FormResponse;
      return data.form;
    },
    enabled: !!userId && !!formType,
  });
};

// Save form hook
export const useSaveForm = (options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: SaveFormInput) => {
      const response = await apiClient.api.forms.$post({
        json: {
          title: formData.title,
          description: formData.description,
          user_id: formData.user_id,
          form_type: formData.form_type,
          form_configuration: formData.form_configuration,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to save form",
        }));
        const errorMessage =
          typeof errorData.error === "string"
            ? errorData.error
            : JSON.stringify(errorData.error) || "Failed to save form";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data.form;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["activeForm"] });
      await queryClient.invalidateQueries({ queryKey: ["forms"] });
      options?.onSuccess?.();
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });
};
