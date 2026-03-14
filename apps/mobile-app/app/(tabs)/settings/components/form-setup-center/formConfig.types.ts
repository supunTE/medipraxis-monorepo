import type { Icon } from "phosphor-react-native";

export type FormConfigProps = {
  visible: boolean;
  onClose: () => void;
  formTitle: string;
  formType?: string;
};

export interface FieldTypeOption {
  id: string;
  label: string;
  icon: Icon;
  disabled?: boolean;
  disabledForForms?: string[]; // Form IDs where this field type is disabled
}

export interface FieldTypePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  options: FieldTypeOption[];
  placeholder?: string;
  label?: string;
  formType?: string; // Used to determine which fields should be disabled
}

export interface Field {
  field_type: string;
  display_label: string;
  description: string;
  help_text: string;
  active: boolean;
  required: boolean;
  shareable: boolean;
  sequence: number;
  icon: Icon;
}

export interface AddFieldModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (fieldData: {
    field_type: string;
    display_label: string;
    required: boolean;
    shareable: boolean;
  }) => void;
  onDelete?: () => void;
  editingField?: {
    field_type: string;
    display_label: string;
    required: boolean;
    shareable: boolean;
  } | null;
  formType?: string;
}

export interface FieldItemProps {
  field: Field;
  onPress: () => void;
  onDragStart?: () => void;
  onDragMove?: (y: number) => void;
  onDragEnd?: () => void;
  isDragging?: boolean;
}

export interface FormData {
  description: string;
  form_structure: Field[];
}
