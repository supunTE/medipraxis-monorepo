import { z } from "genkit";
import { apiClient } from "../../api-client";
import { getClientIds, getUserId } from "../../context";
import { ai } from "../../models";

export const getAllAppointments = ai.defineTool(
  {
    name: "getAllAppointments",
    description:
      "Retrieve all appointments for a given date. Use this when the user wants to see, list, or check their appointments for a specific day.",
    inputSchema: z.object({
      date: z
        .string()
        .describe("The date to retrieve appointments for (YYYY-MM-DD)"),
    }),
    outputSchema: z.object({
      appointments: z.array(
        z.object({
          id: z.string(),
          clientName: z.string(),
          date: z.string(),
          startTime: z.string(),
          endTime: z.string(),
          status: z.string(),
          note: z.string().optional(),
          appointmentNumber: z.number().optional(),
        })
      ),
    }),
  },
  async (input) => {
    const userId = getUserId();

    const res = await apiClient.api.tasks.$get(
      {
        query: { user_id: userId, task_type: "APPOINTMENT" },
      },
      {
        headers: { "x-ai-engine-api-key": process.env.AI_ENGINE_API_KEY || "" },
      }
    );

    if (!res.ok) {
      console.error("[TOOL] Failed to fetch appointments:", res.status);
      return { appointments: [] };
    }

    const data = await res.json();
    const targetDate = input.date;

    const appointments = data.tasks
      .filter((task) => task.start_date.startsWith(targetDate))
      .map((task) => ({
        id: task.task_id,
        clientName:
          [task.client_first_name, task.client_last_name]
            .filter(Boolean)
            .join(" ") || "Unknown",
        date: task.start_date.split("T")[0]!,
        startTime: task.start_date.split("T")[1]?.slice(0, 5) ?? "",
        endTime: task.end_date.split("T")[1]?.slice(0, 5) ?? "",
        status: task.task_status_name,
        note: task.note ?? undefined,
        appointmentNumber: task.appointment_number ?? undefined,
      }));

    return { appointments };
  }
);

export const checkDateTime = ai.defineTool(
  {
    name: "checkDateTime",
    description:
      "Retrieve the current date and time. Use this when you need to know today's date or the current time to help answer the user's query.",
    inputSchema: z.object({}),
    outputSchema: z.object({
      date: z.string().describe("Current date in YYYY-MM-DD format"),
      time: z.string().describe("Current time in HH:MM format"),
      dayOfWeek: z.string().describe("Current day of the week"),
    }),
  },
  async () => {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    return await Promise.resolve({
      date: now.toISOString().split("T")[0]!,
      time: now.toTimeString().slice(0, 5),
      dayOfWeek: days[now.getDay()]!,
    });
  }
);

const APPOINTMENT_TASK_TYPE_ID = "2a431b4e-4089-422f-a343-a2fd8f3e2a2a";

export const createAppointment = ai.defineTool(
  {
    name: "createAppointment",
    description:
      "Search for a client by name and create an appointment for them. First searches for the client — if multiple matches are found, returns them so the practitioner can pick one. If exactly one match is found, proceeds to create the appointment. If no end time is provided, defaults to 30 minutes after the start time.",
    inputSchema: z.object({
      clientName: z
        .string()
        .describe(
          "The name (or partial name) of the client to search for and book"
        ),
      startDateTime: z
        .string()
        .describe(
          "The appointment start date and time in ISO 8601 format (e.g. 2026-03-21T09:00:00)"
        ),
      endDateTime: z
        .string()
        .optional()
        .describe(
          "The appointment end date and time in ISO 8601 format (e.g. 2026-03-21T09:30:00). Defaults to 30 minutes after startDateTime if not provided."
        ),
      title: z
        .string()
        .optional()
        .describe(
          "Optional title for the appointment. Defaults to 'Appointment' if not provided."
        ),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
      appointmentId: z.string().optional(),
      resolvedClientName: z.string().optional(),
      multipleClients: z
        .array(
          z.object({
            clientId: z.string(),
            title: z.string(),
            firstName: z.string(),
            lastName: z.string(),
            contactNumber: z.string().optional(),
          })
        )
        .optional(),
    }),
  },
  async (input) => {
    const userId = getUserId();
    const contextClientIds = getClientIds();

    let clientId: string;
    let resolvedClientName: string = input.clientName;

    if (contextClientIds?.length) {
      clientId = contextClientIds[0]!;
    } else {
      // Search for client by name
      const searchRes = await apiClient.api.clients.name.$get(
        { query: { name: input.clientName, user_id: userId } },
        {
          headers: {
            "x-ai-engine-api-key": process.env.AI_ENGINE_API_KEY || "",
          },
        }
      );

      if (!searchRes.ok) {
        const errorText = await searchRes.text();
        return { success: false, message: errorText };
      }

      const searchData = await searchRes.json();

      const clients = searchData.clients.map((client) => ({
        clientId: client.client_id,
        title: client.title,
        firstName: client.first_name,
        lastName: client.last_name,
        contactNumber: client.contact_number ?? undefined,
      }));

      if (clients.length === 0) {
        return {
          success: false,
          message: `No clients found matching "${input.clientName}".`,
        };
      }

      if (clients.length > 1) {
        return {
          success: false,
          message: `Multiple clients found matching "${input.clientName}". Please specify which client.`,
          multipleClients: clients,
        };
      }

      clientId = clients[0]!.clientId;
      resolvedClientName =
        `${clients[0]!.title} ${clients[0]!.firstName} ${clients[0]!.lastName}`.trim();
    }

    // Default endDateTime to 30 minutes after startDateTime if not provided
    const endDateTime: string =
      input.endDateTime ??
      (() => {
        const start = new Date(input.startDateTime);
        start.setMinutes(start.getMinutes() + 30);
        return start.toISOString().slice(0, 19);
      })();

    // Create the appointment
    const res = await apiClient.api.tasks.$post(
      {
        json: {
          task_title: input.title || "Appointment",
          user_id: userId,
          client_id: clientId,
          task_type_id: APPOINTMENT_TASK_TYPE_ID,
          start_date: input.startDateTime,
          end_date: endDateTime,
          created_by: "PRACTITIONER",
        },
      },
      {
        headers: { "x-ai-engine-api-key": process.env.AI_ENGINE_API_KEY || "" },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error(
        "[TOOL] Failed to create appointment:",
        res.status,
        errorText
      );
      return { success: false, message: errorText };
    }

    const data = await res.json();
    return {
      success: true,
      message: "Appointment created successfully.",
      appointmentId: data.task?.task_id,
      resolvedClientName,
    };
  }
);

export const appointmentTools = [
  getAllAppointments,
  checkDateTime,
  createAppointment,
];
