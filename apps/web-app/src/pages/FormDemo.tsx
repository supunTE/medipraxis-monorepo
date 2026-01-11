import React from "react";
import { DynamicForm } from "../components/forms/DynamicForm";
import type { FormResponse, FormValues } from "../types/form.types";
import { FormFieldType } from "../types/form.types";

const mockFormData: FormResponse = {
  title: "Request Report",
  description: "Please upload the required documents",
  questions: [
    {
      id: "q1",
      type: FormFieldType.FILE_UPLOAD,
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
      type: FormFieldType.FILE_UPLOAD,
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
      type: FormFieldType.FILE_UPLOAD,
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

export const FormDemo: React.FC = () => {
  const handleSubmit = (values: FormValues) => {
    console.log("Form submitted with values:", values);

    Object.entries(values).forEach(([key, file]) => {
      if (file instanceof File) {
        console.log(`${key}:`, {
          name: file.name,
          size: file.size,
          type: file.type,
        });
      }
    });

    alert("Form submitted successfully! Check console for details.");
  };

  return <DynamicForm formData={mockFormData} onSubmit={handleSubmit} />;
};
