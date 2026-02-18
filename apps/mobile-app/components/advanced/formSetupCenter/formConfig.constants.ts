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
    disabledForForms: [],
  },
  {
    id: "multi-text",
    label: "Multi text field",
    icon: ArticleIcon,
    disabledForForms: [],
  },
  {
    id: "toggle",
    label: "Toggle",
    icon: ToggleLeftIcon,
    disabledForForms: [],
  },
  {
    id: "checkbox",
    label: "Checkbox",
    icon: CheckSquareIcon,
    disabledForForms: [],
  },
  {
    id: "numeric",
    label: "Numeric text box",
    icon: HashIcon,
    disabledForForms: [],
  },
  {
    id: "date",
    label: "Date field",
    icon: CalendarBlankIcon,
    disabledForForms: [],
  },
  {
    id: "upload-attachment",
    label: "Upload attachment",
    icon: UploadSimpleIcon,
    disabledForForms: [],
  },
];
