import type { FormTile } from "./formSetupCenter.types";

export const FORM_TILES: FormTile[] = [
  {
    id: "1",
    title: "Client Details Form",
    description:
      "Manage patient information, addresses, contacts, and medical history.",
    image: require("../../../../../assets/images/form-setup-center/client-details.png"),
  },
  {
    id: "2",
    title: "Client Record Form",
    description: "Log clinical notes, prescriptions, and diagnosis details.",
    image: require("../../../../../assets/images/form-setup-center/client-record.png"),
  },
  {
    id: "3",
    title: "Request Reports Form",
    description:
      "Create digital requests for reports and view uploaded results.",
    image: require("../../../../../assets/images/form-setup-center/request-report.png"),
  },
];
