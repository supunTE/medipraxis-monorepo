import type { AIActionTools } from "./actions";

export function buildActionTools(): AIActionTools {
  return {
    appointment: {
      name: "create_appointment",
      description: "Create or manage appointments for patients",
      parameters: {
        patientName: {
          type: "string",
          description: "Full name of the patient",
        },
        date: { type: "string", description: "Appointment date (YYYY-MM-DD)" },
        time: { type: "string", description: "Appointment time (HH:MM)" },
        userId: {
          type: "string",
          description: "ID of the practitioner creating the appointment",
        },
      },
      execute: async (params: Record<string, unknown>) => {
        console.log("[ACTION] create_appointment called with:", params);
        return { success: true, message: "Appointment action logged (stub)" };
      },
    },
    client_management: {
      name: "manage_client",
      description: "Look up or manage client/patient records",
      parameters: {
        searchTerm: {
          type: "string",
          description: "Patient name or identifier to search",
        },
        userId: {
          type: "string",
          description: "ID of the practitioner to filter clients",
        },
      },
      execute: async (params: Record<string, unknown>) => {
        console.log("[ACTION] manage_client called with:", params);
        return { success: true, message: "Client management action logged (stub)" };
      },
    },
  };
}
