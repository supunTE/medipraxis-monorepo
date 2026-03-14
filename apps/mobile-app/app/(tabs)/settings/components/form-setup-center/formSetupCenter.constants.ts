import type { FormTile } from "./formSetupCenter.types";

export const FORM_TILES: FormTile[] = [
  {
    id: "1",
    title: "Client Details Form",
    description:
      "Securely store and manage essential information for your Clients (Patients), including current addresses, contact details, medical history, and specific conditions.",
    image: require("../../../../../assets/images/form-setup-center/client-details.png"),
  },
  {
    id: "2",
    title: "Client Record Form",
    description:
      "Keep precise track of every interaction. This form allows you to log clinical notes, issue prescriptions, and document diagnosis details on appointments.",
    image: require("../../../../../assets/images/form-setup-center/client-record.png"),
  },
  {
    id: "3",
    title: "Request Reports Form",
    description:
      "Create a digital request for specific report names. The cycle completes when your Clients (Patients) upload the results, making them immediately available for you to view.",
    image: require("../../../../../assets/images/form-setup-center/request-report.png"),
  },
];
