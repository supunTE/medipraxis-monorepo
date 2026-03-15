import { z } from "genkit";
import { apiClient } from "../../api-client";
import { getUserId } from "../../context";
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
    console.log("[TOOL] getAllAppointments called with:", {
      ...input,
      userId,
    });

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

    return {
      date: now.toISOString().split("T")[0]!,
      time: now.toTimeString().slice(0, 5),
      dayOfWeek: days[now.getDay()]!,
    };
  }
);

export const appointmentTools = [getAllAppointments, checkDateTime];
