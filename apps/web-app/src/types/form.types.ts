export const FormFieldType = {
  TEXT: "single-text",
  TEXTAREA: "multi-text",
  NUMBER: "numeric",
  FILE_UPLOAD: "upload-attachment",
  DATE: "date",
} as const;

export type FormFieldType = (typeof FormFieldType)[keyof typeof FormFieldType];

export interface FileConfig {
  allowedTypes: string[];
  maxSizeMB: number;
}

export interface FormQuestion {
  id: string;
  type: FormFieldType;
  question: string;
  helpText?: string;
  compulsory: boolean;
  sequence: number;
  notes?: string | null;
  fileConfig?: FileConfig;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
}

export interface FormResponse {
  title: string;
  description: string;
  questions: FormQuestion[];
}

export interface FormValues {
  [questionId: string]: any;
}
