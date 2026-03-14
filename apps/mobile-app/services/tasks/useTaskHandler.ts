import { DayOfWeek } from "@repo/models";
import { useState } from "react";
import { Alert } from "react-native";
import { useCreateAppointmentSlot } from "./useCreateAppointmentSlot";
import { useCreateTask } from "./useCreateTask";
import { useReserveAppointment } from "./useReserveAppointment";

// Todo: React hook form integration
// Todo: Appointment slot window slot no options integration with backend, backend implementation

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

type FormState = {
  eventType: EventType;
  userId: string;

  // Task specific
  taskTitle: string;
  client: string;
  alarm: boolean;

  // Appointment Slot specific
  isRecurring: boolean;
  location: string;
  totalSlots: number;

  // Common / Shared
  startDate: string;
  endDate: string;
  note: string;

  // Slot window date/time (kept separate to avoid overwriting)
  slotDate: string;
  repeatUntil: string;

  // UI state
  repeatDays: number[];
  slotWindow: string;

  attachToSlot: boolean;
};

const DEFAULT_FORM_STATE: FormState = {
  eventType: EVENT_TYPES.TASK,
  taskTitle: "",
  client: "",
  startDate: "",
  endDate: "",
  note: "",
  alarm: true,
  userId: "2a3c19b8-d352-4b30-a2ac-1cdf993d310c",
  repeatDays: [],
  totalSlots: 1,
  location: "",
  slotWindow: "",
  slotDate: "",
  repeatUntil: "",
  attachToSlot: false,
  isRecurring: false,
};

const DEFAULT_APPOINTMENT_SLOT_STATE: FormState = {
  eventType: EVENT_TYPES.APPOINTMENT_SLOT_WINDOW,
  startDate: "",
  endDate: "",
  note: "",
  location: "",
  userId: "2a3c19b8-d352-4b30-a2ac-1cdf993d310c",
  totalSlots: 1,
  repeatDays: [],
  taskTitle: "",
  client: "",
  alarm: false,
  slotWindow: "",
  slotDate: "",
  repeatUntil: "",
  attachToSlot: false,
  isRecurring: false,
};

const DEFAULT_APPOINTMENT_STATE: FormState = {
  eventType: EVENT_TYPES.APPOINTMENT,
  taskTitle: "",
  client: "",
  startDate: "",
  endDate: "",
  note: "",
  location: "",
  userId: "2a3c19b8-d352-4b30-a2ac-1cdf993d310c",
  totalSlots: 1,
  repeatDays: [],
  alarm: false,
  slotWindow: "",
  slotDate: "",
  repeatUntil: "",
  attachToSlot: false,
  isRecurring: false,
};

/**
 * Merge the date portion from `dateSource` with the time portion from `timeSource`.
 * e.g. dateSource = "2025-11-15T00:00" + timeSource = "2025-01-01T08:30" → "2025-11-15T08:30"
 */
const mergeDateAndTime = (dateSource: string, timeSource: string): string => {
  const d = new Date(dateSource);
  const t = new Date(timeSource);
  d.setHours(t.getHours(), t.getMinutes(), 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/**
 * Extract time portion from a date string as HH:MM:SS.
 * e.g. "2025-01-01T08:30" → "08:30:00"
 */
const extractTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Ensures strict ISO-like format with a 'T' separator in local timezone,
 * fixing dates that might otherwise use space as separator (e.g., from DB).
 */
const formatDateTime = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

/**
 * Extracts only the YYYY-MM-DD date part.
 */
const formatDateOnly = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const useTaskHandler = (onClose: () => void) => {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);
  const [error, setError] = useState<string | null>(null);

  const { mutate: createTask, isPending: isTaskPending } = useCreateTask({
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully");
      setFormState(DEFAULT_FORM_STATE);
      setError(null);
      onClose();
    },
    onError: (message) => {
      setError(message);
    },
  });

  // Also used for Appointment creation (appointments are tasks with APPOINTMENT type)
  const { mutate: createAppointment, isPending: isAppointmentPending } =
    useCreateTask({
      onSuccess: () => {
      Alert.alert("Success", "Appointment created successfully");
      setFormState(DEFAULT_APPOINTMENT_STATE);
      setError(null);
      onClose();
    },
    onError: (message) => {
      setError(message);
    },
  });

  const { mutate: createAppointmentSlot, isPending: isAppointmentSlotPending } =
    useCreateAppointmentSlot({
      onSuccess: () => {
        Alert.alert("Success", "Appointment slot created successfully");
        setFormState(DEFAULT_APPOINTMENT_SLOT_STATE);
        setError(null);
        onClose();
      },
      onError: (message) => {
        setError(message);
      },
    });

  const { mutate: reserveAppointment, isPending: isReservePending } =
    useReserveAppointment({
      onSuccess: () => {
        Alert.alert("Success", "Appointment reserved successfully");
        setFormState(DEFAULT_APPOINTMENT_STATE);
        setError(null);
        onClose();
      },
      onError: (message) => {
        setError(message);
      },
    });

  const setField = (key: string, value: any) => {
    setError(null);
    setFormState(
      (prev) =>
        ({
          ...prev,
          [key]: value,
        }) as FormState
    );
  };

  const resetForm = () => {
    setError(null);
    setFormState(DEFAULT_FORM_STATE);
  };

  const switchEventType = (newType: EventType) => {
    setError(null);
    setFormState((prev) => {
      const base: FormState = {
        ...DEFAULT_FORM_STATE,
        userId: prev.userId,
        note: prev.note,
        eventType: newType,
      };

      // Carry over client/title between Appointment ↔ Task
      if (newType === EVENT_TYPES.APPOINTMENT || newType === EVENT_TYPES.TASK) {
        base.taskTitle = prev.taskTitle;
        base.client = prev.client;
      }

      // Carry over location between Appointment ↔ Slot Window
      if (
        newType === EVENT_TYPES.APPOINTMENT ||
        newType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW
      ) {
        base.location = prev.location;
      }

      return base;
    });
  };

  const toggleAttachToSlot = (attached: boolean) => {
    setFormState((prev) => {
      if (attached) {
        // Attaching → clear standalone fields
        return {
          ...prev,
          attachToSlot: true,
          taskTitle: "",
          location: "",
          startDate: "",
          endDate: "",
        };
      }
      // Detaching → clear slot fields
      return {
        ...prev,
        attachToSlot: false,
        slotWindow: "",
      };
    });
  };

  const toggleRecurring = (recurring: boolean) => {
    setFormState((prev) => {
      if (recurring) {
        // Turning on → clear non-recurring date
        return { ...prev, isRecurring: true, slotDate: "" };
      }
      // Turning off → clear recurring fields
      return {
        ...prev,
        isRecurring: false,
        repeatUntil: "",
        repeatDays: [],
      };
    });
  };

    const handleSave = () => {
    if (
      isTaskPending ||
      isAppointmentPending ||
      isAppointmentSlotPending ||
      isReservePending
    )
      return;

    setError(null);

    if (formState.eventType === EVENT_TYPES.TASK) {
      createTask({
        task_title: formState.taskTitle,
        user_id: formState.userId,
        end_date: formatDateTime(formState.endDate),
        start_date: formatDateTime(formState.startDate),
        client_id: formState.client || undefined,
        note: formState.note,
        set_alarm: formState.alarm,
        task_type_id: TASK_TYPE_IDS.REMINDER,
        task_status_id: TASK_STATUS_IDS.NOT_STARTED,
      });
    }

    if (formState.eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW) {
      const isRecurring = formState.repeatDays.length > 0;

      if (isRecurring) {
        // Map 0-6 to DayOfWeek
        const DAYS = [
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ];
        const day_of_week = formState.repeatDays.map(
          (d) => DAYS[d] as unknown as DayOfWeek
        );

        // Recurring: send time-only values (HH:MM:SS) for the template
        createAppointmentSlot({
          is_recurring: true,
          user_id: formState.userId,
          location: formState.location,
          total_slots: formState.totalSlots,
          start_time: extractTime(formState.startDate),
          end_time: extractTime(formState.endDate),
          repeat_until: formState.repeatUntil,
          day_of_week,
          note: formState.note,
        });
      } else {
        // Non-recurring: merge slotDate with start/end times
        createAppointmentSlot({
          is_recurring: false,
          user_id: formState.userId,
          location: formState.location,
          total_slots: formState.totalSlots,
          date: formState.slotDate,
          start_time: mergeDateAndTime(formState.slotDate, formState.startDate),
          end_time: mergeDateAndTime(formState.slotDate, formState.endDate),
          note: formState.note,
        });
      }
    }

    if (formState.eventType === EVENT_TYPES.APPOINTMENT) {
      if (formState.attachToSlot) {
        // Reserve a slot in an existing slot window
        if (!formState.slotWindow || !formState.client) {
          Alert.alert(
            "Missing Info",
            "Please select a slot window and a client."
          );
          return;
        }
        reserveAppointment({
          slot_window_id: formState.slotWindow,
          client_id: formState.client,
        });
      } else {
        // Standalone appointment
        createAppointment({
          task_title: formState.taskTitle,
          user_id: formState.userId,
          end_date: formatDateTime(formState.endDate),
          // Sending date-only for start_date to bypass a backend bug in getAppointmentCountForDate
          // (which blindly appends T00:00:00). WARNING: The appointment start time will be saved
          // as midnight local time in the database!
          start_date: formatDateOnly(formState.startDate),
          client_id: formState.client,
          note: formState.note,
          task_type_id: TASK_TYPE_IDS.APPOINTMENT,
          task_status_id: TASK_STATUS_IDS.NOT_STARTED,
          created_by: "PRACTITIONER",
        });
      }
    }
  };

  return {
    formState,
    setField,
    handleSave,
    resetForm,
    switchEventType,
    toggleAttachToSlot,
    toggleRecurring,
    error,
    isPending:
      isTaskPending ||
      isAppointmentPending ||
      isAppointmentSlotPending ||
      isReservePending,
  };
};
