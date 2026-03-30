import { z } from "genkit";
import { apiClient } from "../../api-client";
import { getUserId, getTimezone } from "../../context";
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
      start_date: z.string().describe("Reminder start date-time in ISO format"),
      note: z.string().optional().describe("Optional reminder note"),
      set_alarm: z
        .boolean()
        .optional()
        .describe("Whether an alarm should be enabled"),
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
          task_title: input.task_title,
          end_date: input.end_date,
          start_date: input.start_date,
          note: input.note,
          set_alarm: input.set_alarm,
          user_id: userId,
          task_type_id: REMINDER_TASK_TYPE_ID,
          client_id: undefined,
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
      datetime: z
        .string()
        .describe(
          "Current date-time in ISO format with timezone offset (e.g. 2026-03-29T14:30:00+05:30)"
        ),
    }),
  },
  async () => {
    const timezone = getTimezone();
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";

    const date = `${get("year")}-${get("month")}-${get("day")}`;
    const time = `${get("hour")}:${get("minute")}`;
    const seconds = get("second");

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const dayOfWeek = days[new Date(`${date}T${time}:${seconds}`).getDay()]!;

    // Compute UTC offset string (e.g. +05:30) for the timezone
    const utcOffsetMinutes =
      (now.getTime() -
        new Date(
          new Date(
            now.toLocaleString("en-US", { timeZone: timezone })
          ).getTime()
        ).getTime()) /
      -60000;
    const sign = utcOffsetMinutes >= 0 ? "+" : "-";
    const absMinutes = Math.abs(Math.round(utcOffsetMinutes));
    const offsetHH = String(Math.floor(absMinutes / 60)).padStart(2, "0");
    const offsetMM = String(absMinutes % 60).padStart(2, "0");
    const offset = `${sign}${offsetHH}:${offsetMM}`;

    const datetime = `${date}T${time}:${seconds}${offset}`;

    return { date, time, dayOfWeek, datetime };
  }
);

export const reminderTools = [getAllReminders, createReminder, checkDateTime];
