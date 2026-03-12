import { z } from "genkit";
import { apiClient } from "../../api-client";
import { getUserId } from "../../context";
import { ai } from "../../models";

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

    const res = await apiClient.api.tasks.$get({
      query: { user_id: userId, task_type: "REMINDER" },
    });

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

export const reminderTools = [getAllReminders, checkDateTime];
