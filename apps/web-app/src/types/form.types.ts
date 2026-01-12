export const FormFieldType = {
  TEXT: "text",
  TEXTAREA: "textarea",
  NUMBER: "number",
  SINGLE_SELECT: "single_select",
  MULTI_SELECT: "multi_select",
  FILE_UPLOAD: "file_upload",
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
