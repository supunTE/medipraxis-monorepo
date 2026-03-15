import { apiClient } from "@/lib/api-client";
import { FormType, type Form } from "@repo/models";
import { useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";

export interface FormField {
  active: boolean;
  required: boolean;
  sequence: number;
  help_text: string;
  shareable: boolean;
  field_type: string;
  description: string;
  display_label: string;
}

export const useFetchForms = (userId: string, formType?: FormType) => {
  return useQuery({
    queryKey: ["forms", userId, formType],
    queryFn: async () => {
      const response = await apiClient.api.forms.$get({
        query: {
          user_id: userId,
          ...(formType && { form_type: formType }),
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load forms. Please try again.");
        return [];
      }

      const data = await response.json();
      return data.forms as Form[];
    },
  });
};

export const useFetchRequestForm = (userId: string) => {
  return useQuery({
    queryKey: ["forms", userId, FormType.REQUEST_FORM],
    queryFn: async () => {
      const response = await apiClient.api.forms.$get({
        query: {
          user_id: userId,
          form_type: FormType.REQUEST_FORM,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load request form. Please try again.");
        return null;
      }

      const data = await response.json();
      const forms = data.forms as Form[];
      
      if (forms.length === 0) {
        return null;
      }

      const activeForm = forms.find((form) => form.is_active) || forms[0];
      return activeForm || null;
    },
  });
};
