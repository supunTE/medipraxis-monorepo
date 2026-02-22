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
  id: string;
  fieldType: string;
  fieldName: string;
  icon: Icon;
  isRequired: boolean;
  isShareEnabled: boolean;
  sequence: number;
}

export interface AddFieldModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (fieldData: {
    fieldType: string;
    fieldName: string;
    isRequired: boolean;
    isShareEnabled: boolean;
  }) => void;
  onDelete?: () => void;
  editingField?: {
    fieldType: string;
    fieldName: string;
    isRequired: boolean;
    isShareEnabled: boolean;
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
