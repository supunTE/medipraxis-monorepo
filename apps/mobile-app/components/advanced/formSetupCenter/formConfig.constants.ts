import {
  ArticleIcon,
  CalendarBlankIcon,
  CheckSquareIcon,
  HashIcon,
  TextTIcon,
  ToggleLeftIcon,
  UploadSimpleIcon,
} from "phosphor-react-native";
import type { FieldTypeOption } from "./formConfig.types";

export const FIELD_TYPES: FieldTypeOption[] = [
  {
    id: "single-text",
    label: "Single text field",
    icon: TextTIcon,
    disabledForForms: ["3"],
  },
  {
    id: "multi-text",
    label: "Multi text field",
    icon: ArticleIcon,
    disabledForForms: ["3"],
  },
  {
    id: "toggle",
    label: "Toggle",
    icon: ToggleLeftIcon,
    disabledForForms: ["3"],
  },
  {
    id: "checkbox",
    label: "Checkbox",
    icon: CheckSquareIcon,
    disabledForForms: ["3"],
  },
  {
    id: "numeric",
    label: "Numeric text box",
    icon: HashIcon,
    disabledForForms: ["3"],
  },
  {
    id: "date",
    label: "Date field",
    icon: CalendarBlankIcon,
    disabledForForms: ["3"],
  },
  {
    id: "upload-attachment",
    label: "Upload attachment",
    icon: UploadSimpleIcon,
    disabledForForms: [],
  },
];
