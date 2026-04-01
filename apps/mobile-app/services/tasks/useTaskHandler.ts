import { useAuth } from "@/auth/AuthContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAppointmentSlot } from "@/services/slotWindows";
import { DayOfWeek } from "@repo/models";
import { useMemo } from "react";
import { Alert } from "react-native";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateTask } from "./useCreateTask";
import { useReserveAppointment } from "./useReserveAppointment";

export const EVENT_TYPES = {
  TASK: "task",
  APPOINTMENT_SLOT_WINDOW: "slot_window",
  APPOINTMENT: "appointment",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

// Database UUIDs for task_type
export const TASK_TYPE_IDS = {
  REMINDER: "24f21ec7-bf59-4c35-9c54-36cb24afafbb",
  APPOINTMENT: "2a431b4e-4089-422f-a343-a2fd8f3e2a2a",
  APPOINTMENT_SLOT_WINDOW: "0d035079-2fb0-4e5f-8efc-a927fd55d843",
} as const;

// Database UUIDs for task_status
export const TASK_STATUS_IDS = {
  IN_PROGRESS: "6fe35772-6214-468c-ae26-1b2f2f067740",
  CANCELLED: "8e5cebbe-28a9-4623-9e7c-e127eb39ed4f",
  NOT_STARTED: "c2c4fceb-1a22-4b66-bb25-b37faa712c3a",
  COMPLETED: "dbbdc7fa-aba7-43ab-8252-4766c1fbcfc1",
} as const;

/* ─────────────────────────── Zod schema ─────────────────────────── */

const taskFormSchema = z
  .object({
    eventType: z.enum(["task", "slot_window", "appointment"]),
    note: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    // Task + Appointment shared
    taskTitle: z.string().optional(),
    client: z.string(),
    alarm: z.boolean(),
    // Slot window
    location: z.string().optional(),
    totalSlots: z.number(),
    isRecurring: z.boolean(),
    slotDate: z.string(),
    repeatDays: z.array(z.number()),
    repeatUntil: z.string(),
    // Appointment
    attachToSlot: z.boolean(),
    slotWindow: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.eventType === "task") {
      if (!data.taskTitle)
        ctx.addIssue({
          code: "custom",
          path: ["taskTitle"],
          message: "Title is required",
        });
      if (!data.startDate)
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Start date is required",
        });
    }

    if (data.eventType === "slot_window") {
      if (!data.location)
        ctx.addIssue({
          code: "custom",
          path: ["location"],
          message: "Location is required",
        });
      if (!data.totalSlots || data.totalSlots < 1)
        ctx.addIssue({
          code: "custom",
          path: ["totalSlots"],
          message: "Must be at least 1 slot",
        });
      if (!data.startDate)
        ctx.addIssue({
          code: "custom",
          path: ["startDate"],
          message: "Start time is required",
        });
      if (!data.endDate)
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End time is required",
        });
      if (!data.isRecurring && !data.slotDate)
        ctx.addIssue({
          code: "custom",
          path: ["slotDate"],
          message: "Date is required",
        });
      if (data.isRecurring && data.repeatDays.length === 0)
        ctx.addIssue({
          code: "custom",
          path: ["repeatDays"],
          message: "Select at least one day",
        });
      if (data.isRecurring && !data.repeatUntil)
        ctx.addIssue({
          code: "custom",
          path: ["repeatUntil"],
          message: "Repeat until date is required",
        });
    }

    // Cross-field: end date must be after start date (when both present)
    if (data.startDate && data.endDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end <= start) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date & time must be after start date & time",
        });
      }
    }

    if (data.eventType === "appointment") {
      if (data.attachToSlot) {
        if (!data.slotWindow)
          ctx.addIssue({
            code: "custom",
            path: ["slotWindow"],
            message: "Select a slot window",
          });
        if (!data.client)
          ctx.addIssue({
            code: "custom",
            path: ["client"],
            message: "Select a client",
          });
      } else {
        if (!data.taskTitle)
          ctx.addIssue({
            code: "custom",
            path: ["taskTitle"],
            message: "Title is required",
          });
        if (!data.startDate)
          ctx.addIssue({
            code: "custom",
            path: ["startDate"],
            message: "Start date is required",
          });
        if (!data.endDate)
          ctx.addIssue({
            code: "custom",
            path: ["endDate"],
            message: "End date is required",
          });
      }
    }
  });

export type TaskFormData = z.infer<typeof taskFormSchema>;

/* ─────────────────────────── Default values ─────────────────────── */

const DEFAULT_FORM_VALUES: TaskFormData = {
  eventType: EVENT_TYPES.TASK,
  taskTitle: "",
  client: "",
  startDate: "",
  endDate: "",
  note: "",
  alarm: true,
  repeatDays: [],
  totalSlots: 1,
  location: "",
  slotWindow: "",
  slotDate: "",
  repeatUntil: "",
  attachToSlot: false,
  isRecurring: false,
};

/* ─────────────────────────── Date helpers ───────────────────────── */

// ─── Timezone convention ──────────────────────────────────────────────────────
// Datetimes are stored as "naive local time treated as UTC" in the database:
// the doctor's clock value (e.g. "04:00") is persisted verbatim without any
// timezone conversion so that the API's UTC-boundary date filter still finds
// the event on the correct local calendar day.
//
// IMPORTANT — Hermes (React Native's JS engine on Android) parses datetime
// strings that lack a timezone designator (e.g. "2026-03-29T04:00") as UTC,
// NOT as local time. This means new Date(pickerString).getHours() returns the
// LOCAL equivalent of the UTC hour — wrong on any non-UTC device. To avoid
// this we never call new Date() on picker-emitted strings; instead we extract
// the date/time digits directly from the string, which already contains the
// correct local clock values as emitted by the picker.
// ─────────────────────────────────────────────────────────────────────────────

const mergeDateAndTime = (dateSource: string, timeSource: string): string => {
  // Both picker strings are "YYYY-MM-DDTHH:MM".
  // Take the date portion from dateSource and the time portion from timeSource.
  const datePart = dateSource.split("T")[0] ?? ""; // "YYYY-MM-DD"
  const timePart = timeSource.split("T")[1] ?? ""; // "HH:MM"
  if (!datePart || !timePart) return "";
  // Append ":00" for seconds — result is "YYYY-MM-DDTHH:MM:00" (naive, no offset)
  return `${datePart}T${timePart}:00`;
};

const extractTime = (dateStr: string): string => {
  // dateStr is "YYYY-MM-DDTHH:MM" from the picker.
  // Return the time part as "HH:MM:00" for template storage.
  const timePart = dateStr.split("T")[1] ?? "00:00";
  const [h = "00", m = "00"] = timePart.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
};

const formatDateTime = (dateStr: string): string => {
  // dateStr is "YYYY-MM-DDTHH:MM" from the picker.
  if (!dateStr) return "";
  const [date, time] = dateStr.split("T");
  if (!date || !time) return dateStr;
  const [h = "00", m = "00"] = time.split(":");
  return `${date}T${h.padStart(2, "0")}:${m.padStart(2, "0")}:00`;
};

const formatDateOnly = (dateStr: string): string => {
  // dateStr is "YYYY-MM-DDTHH:MM" from the picker — just strip the time part.
  if (!dateStr) return "";
  return dateStr.split("T")[0] ?? dateStr;
};

/* ─────────────────────────── Hook ──────────────────────────────── */

export const useTaskHandler = (onClose: () => void) => {
  const { user } = useAuth();
  const userId = user?.user_id ?? "";

  const {
    control,
    watch,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  const watchedStartDate = watch("startDate");
  const watchedEndDate = watch("endDate");
  const watchedTotalSlots = watch("totalSlots");

  const averageMinutesPerSlot = useMemo(() => {
    if (
      !watchedStartDate ||
      !watchedEndDate ||
      !watchedTotalSlots ||
      watchedTotalSlots <= 0
    )
      return null;
    const start = new Date(watchedStartDate);
    const end = new Date(watchedEndDate);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs <= 0) return null;
    return Math.round(diffMs / (1000 * 60) / watchedTotalSlots);
  }, [watchedStartDate, watchedEndDate, watchedTotalSlots]);

  /* ── Mutations ── */

  const { mutate: createTask, isPending: isTaskPending } = useCreateTask({
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully");
      reset(DEFAULT_FORM_VALUES);
      onClose();
    },
    onError: (message) => Alert.alert("Error", message),
  });

  const { mutate: createAppointment, isPending: isAppointmentPending } =
    useCreateTask({
      onSuccess: () => {
        Alert.alert("Success", "Appointment created successfully");
        reset(DEFAULT_FORM_VALUES);
        onClose();
      },
      onError: (message) => Alert.alert("Error", message),
    });

  const { mutate: createAppointmentSlot, isPending: isAppointmentSlotPending } =
    useCreateAppointmentSlot({
      onSuccess: () => {
        Alert.alert("Success", "Appointment slot created successfully");
        reset(DEFAULT_FORM_VALUES);
        onClose();
      },
      onError: (message) => Alert.alert("Error", message),
    });

  const { mutate: reserveAppointment, isPending: isReservePending } =
    useReserveAppointment({
      onSuccess: () => {
        Alert.alert("Success", "Appointment reserved successfully");
        reset(DEFAULT_FORM_VALUES);
        onClose();
      },
      onError: (message) => Alert.alert("Error", message),
    });

  /* ── Submit handler ── */

  const onSubmit = (data: TaskFormData) => {
    if (data.eventType === EVENT_TYPES.TASK) {
      createTask({
        task_title: data.taskTitle!,
        user_id: userId,
        end_date: formatDateTime(data.endDate),
        start_date: formatDateTime(data.startDate),
        client_id: data.client || undefined,
        note: data.note,
        set_alarm: data.alarm,
        task_type_id: TASK_TYPE_IDS.REMINDER,
        task_status_id: TASK_STATUS_IDS.NOT_STARTED,
      });
    }

    if (data.eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW) {
      const isRecurring = data.repeatDays.length > 0;
      if (isRecurring) {
        const DAYS = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ];
        const day_of_week = data.repeatDays.map(
          (d) => DAYS[d] as unknown as DayOfWeek
        );
        createAppointmentSlot({
          is_recurring: true,
          user_id: userId,
          location: data.location!,
          total_slots: data.totalSlots,
          start_time: extractTime(data.startDate),
          end_time: extractTime(data.endDate),
          repeat_until: data.repeatUntil,
          day_of_week,
          note: data.note,
        });
      } else {
        createAppointmentSlot({
          is_recurring: false,
          user_id: userId,
          location: data.location!,
          total_slots: data.totalSlots,
          date: data.slotDate,
          start_time: mergeDateAndTime(data.slotDate, data.startDate),
          end_time: mergeDateAndTime(data.slotDate, data.endDate),
          note: data.note,
        });
      }
    }

    if (data.eventType === EVENT_TYPES.APPOINTMENT) {
      if (data.attachToSlot) {
        reserveAppointment({
          slot_window_id: data.slotWindow,
          client_id: data.client,
        });
      } else {
        createAppointment({
          task_title: data.taskTitle!,
          user_id: userId,
          end_date: formatDateTime(data.endDate),
          // Sending date-only for start_date to bypass a backend bug in getAppointmentCountForDate
          // (which blindly appends T00:00:00). WARNING: The appointment start time will be saved
          // as midnight local time in the database!
          start_date: formatDateOnly(data.startDate),
          client_id: data.client,
          note: data.note,
          task_type_id: TASK_TYPE_IDS.APPOINTMENT,
          task_status_id: TASK_STATUS_IDS.NOT_STARTED,
          created_by: "PRACTITIONER",
        });
      }
    }
  };

  /* ── Helpers exposed to TaskForm ── */

  const switchEventType = (newType: EventType) => {
    const current = {
      note: watch("note"),
      taskTitle: watch("taskTitle"),
      client: watch("client"),
      location: watch("location"),
    };

    const base: TaskFormData = {
      ...DEFAULT_FORM_VALUES,
      eventType: newType,
      note: current.note,
    };

    if (newType === EVENT_TYPES.APPOINTMENT || newType === EVENT_TYPES.TASK) {
      base.taskTitle = current.taskTitle;
      base.client = current.client;
    }
    if (
      newType === EVENT_TYPES.APPOINTMENT ||
      newType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW
    ) {
      base.location = current.location;
    }

    reset(base);
  };

  const toggleAttachToSlot = (attached: boolean) => {
    setValue("attachToSlot", attached);
    if (attached) {
      setValue("taskTitle", "");
      setValue("location", "");
      setValue("startDate", "");
      setValue("endDate", "");
    } else {
      setValue("slotWindow", "");
    }
  };

  const toggleRecurring = (recurring: boolean) => {
    setValue("isRecurring", recurring);
    if (recurring) {
      setValue("slotDate", "");
    } else {
      setValue("repeatUntil", "");
      setValue("repeatDays", []);
    }
  };

  const resetForm = () => reset(DEFAULT_FORM_VALUES);

  return {
    control,
    watch,
    setValue,
    errors,
    handleSave: handleSubmit(onSubmit),
    resetForm,
    switchEventType,
    toggleAttachToSlot,
    toggleRecurring,
    averageMinutesPerSlot,
    userId,
    isPending:
      isTaskPending ||
      isAppointmentPending ||
      isAppointmentSlotPending ||
      isReservePending,
  };
};
