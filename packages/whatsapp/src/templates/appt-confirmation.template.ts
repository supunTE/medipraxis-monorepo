import { TemplateMessagePayload } from "../types";

type AppointmentConfirmationParams = {
  clientName: string;
  practitionerName: string;
  date: string;
  time: string;
  apptNumber: string;
  apptLink: string;
};

export function appointmentConfirmationTemplate(
  params: AppointmentConfirmationParams
): TemplateMessagePayload {
  return {
    name: "appointment_confirmation",
    language: { code: "en" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: params.clientName },
          { type: "text", text: params.practitionerName },
          { type: "text", text: params.date },
          { type: "text", text: params.time },
          { type: "text", text: params.apptNumber },
          { type: "text", text: params.apptLink },
        ],
      },
    ],
  };
}
