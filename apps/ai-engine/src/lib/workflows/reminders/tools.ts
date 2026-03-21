import { z } from "genkit";
import { apiClient } from "../../api-client";
import { getUserId } from "../../context";
import { ai } from "../../models";

const REMINDER_TASK_TYPE_ID = "24f21ec7-bf59-4c35-9c54-36cb24afafbb";

export const getAllReminders = ai.defineTool(
  {
    name: "getAllReminders",
    description:
      "Retrieve all reminders for a given date. Use this when the user wants to see, list, or check their reminders for a specific day.",
    inputSchema: z.object({
      date: z
        .string()
        .describe("The date to retrieve reminders for (YYYY-MM-DD)"),
    }),
    outputSchema: z.object({
      reminders: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string().optional(),
          date: z.string(),
          time: z.string(),
          status: z.string(),
          priority: z.string().optional(),
        })
      ),
    }),
  },
  async (input) => {
    const userId = getUserId();
    console.log("[TOOL] getAllReminders called with:", {
      ...input,
      userId,
    });

    const res = await apiClient.api.tasks.$get(
      {
        query: { user_id: userId, task_type: "REMINDER" },
      },
      {
        headers: { "x-ai-engine-api-key": process.env.AI_ENGINE_API_KEY || "" },
      }
    );

    if (!res.ok) {
      console.error("[TOOL] Failed to fetch reminders:", res.status);
      return { reminders: [] };
    }

    const data = await res.json();
    const targetDate = input.date;

    const reminders = data.tasks
      .filter((task) => task.start_date.startsWith(targetDate))
      .map((task) => ({
        id: task.task_id,
        title: task.task_title || "Untitled Reminder",
        description: task.note ?? undefined,
        date: task.start_date.split("T")[0]!,
        time: task.start_date.split("T")[1]?.slice(0, 5) ?? "",
        status: task.task_status_name,
      }));

    return { reminders };
  }
);

export const createReminder = ai.defineTool(
  {
    name: "createReminder",
    description:
      "Create a reminder task for the authenticated practitioner. Use this when the user asks to create, add, schedule, or set a reminder.",
    inputSchema: z.object({
      task_title: z.string().describe("Reminder title"),
      end_date: z
        .string()
        .describe(
          "Reminder due date-time in ISO format (e.g. 2026-03-22T14:30:00Z)"
        ),
      start_date: z
        .string()
        .optional()
        .describe("Reminder start date-time in ISO format"),
      note: z.string().optional().describe("Optional reminder note"),
      set_alarm: z
        .boolean()
        .optional()
        .describe("Whether an alarm should be enabled"),
      client_id: z
        .string()
        .optional()
        .describe("Optional client ID linked to the reminder"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      task_id: z.string().optional(),
      message: z.string(),
    }),
  },
  async (input) => {
    const userId = getUserId();

    const res = await apiClient.api.tasks.$post(
      {
        json: {
          ...input,
          user_id: userId,
          task_type_id: REMINDER_TASK_TYPE_ID,
        },
      },
      {
        headers: {
          "x-ai-engine-api-key": process.env.AI_ENGINE_API_KEY || "",
        },
      }
    );

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("[TOOL] createReminder failed:", res.status, errorBody);
      return {
        success: false,
        message: `Failed to create reminder (HTTP ${res.status}).`,
      };
    }

    const data = await res.json();

    return {
      success: true,
      task_id: data.task?.task_id,
      message: "Reminder created successfully.",
    };
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

export const reminderTools = [getAllReminders, createReminder, checkDateTime];
