import type { FormResponse } from "../types/form.types";

export const formService = {
  /**
   * Fetch dynamic form configuration by form ID
   */
  async getFormById(_formId: string): Promise<FormResponse> {
    try {
      // TODO: Replace with actual API endpoint when backend is ready

      // Mock response for now
      return {
        title: "Request Report",
        description: "Please upload the required documents",
        questions: [
          {
            id: "q1",
            type: "file_upload" as any,
            question: "Upload Medical Report",
            helpText: "PDF or image files only",
            compulsory: true,
            sequence: 1,
            notes: "Primary medical document",
            fileConfig: {
              allowedTypes: ["pdf", "jpg", "png"],
              maxSizeMB: 5,
            },
          },
          {
            id: "q2",
            type: "file_upload" as any,
            question: "Upload Lab Results",
            helpText: "Optional supporting documents",
            compulsory: false,
            sequence: 2,
            notes: null,
            fileConfig: {
              allowedTypes: ["pdf", "jpg", "png"],
              maxSizeMB: 5,
            },
          },
          {
            id: "q3",
            type: "file_upload" as any,
            question: "Upload Prescription",
            helpText: "If available",
            compulsory: false,
            sequence: 3,
            notes: null,
            fileConfig: {
              allowedTypes: ["pdf", "jpg", "png"],
              maxSizeMB: 5,
            },
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching form:", error);
      throw error;
    }
  },

  /**
   * Submit form data with files
   */
  async submitForm(formId: string, formData: FormData): Promise<any> {
    try {
      // TODO: Replace with actual API endpoint when backend is ready

      console.log("Submitting form:", formId, formData);

      // Mock success response
      return {
        success: true,
        message: "Form submitted successfully",
        id: `submission-${Date.now()}`,
      };
    } catch (error) {
      console.error("Error submitting form:", error);
      throw error;
    }
  },
};
