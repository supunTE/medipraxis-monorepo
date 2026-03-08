import { DayOfWeek } from "@repo/models";
import { useState } from "react";
import { Alert } from "react-native";
import { useCreateAppointmentSlot } from "@/services/slotWindows";
import { useCreateTask } from "./useCreateTask";

export const EVENT_TYPES = {
  TASK: "task",
  APPOINTMENT_SLOT_WINDOW: "slot_window",
  APPOINTMENT: "appointment",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

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

  // UI state
  repeatDays: number[];
  slotWindow: string;

  attachToSlot: boolean;
};

const DEFAULT_FORM_STATE: FormState = {
  eventType: EVENT_TYPES.TASK,
  taskTitle: "",
  client: "Jennifer",
  startDate: "2025-11-15T08:00",
  endDate: "2025-11-15T11:30",
  note: "",
  alarm: true,
  userId: "",
  repeatDays: [],
  totalSlots: 1,
  location: "",
  slotWindow: "",

  attachToSlot: false,
  isRecurring: false,
};

const DEFAULT_APPOINTMENT_SLOT_STATE: FormState = {
  eventType: EVENT_TYPES.APPOINTMENT_SLOT_WINDOW,
  startDate: "2025-11-15T08:00",
  endDate: "2025-11-15T11:30",
  note: "",
  location: "Care - Medical Centre",
  userId: "",
  totalSlots: 1,
  repeatDays: [],
  taskTitle: "",
  client: "",
  alarm: false,
  slotWindow: "",

  attachToSlot: false,
  isRecurring: false,
};

export const useTaskHandler = (onClose: () => void) => {
  const [formState, setFormState] = useState<FormState>(DEFAULT_FORM_STATE);

  const { mutate: createTask, isPending: isTaskPending } = useCreateTask({
    onSuccess: () => {
      Alert.alert("Success", "Task created successfully");
      setFormState(DEFAULT_FORM_STATE);
      onClose();
    },
    onError: (message) => {
      Alert.alert("Error", message);
      console.error(message);
    },
  });

  const { mutate: createAppointmentSlot, isPending: isAppointmentSlotPending } =
    useCreateAppointmentSlot({
      onSuccess: () => {
        Alert.alert("Success", "Appointment slot created successfully");
        setFormState(DEFAULT_APPOINTMENT_SLOT_STATE);
        onClose();
      },
      onError: (message) => {
        Alert.alert("Error", message);
        console.error(message);
      },
    });

  const setField = (key: string, value: any) => {
    setFormState(
      (prev) =>
        ({
          ...prev,
          [key]: value,
        }) as FormState
    );
  };

  const handleSave = () => {
    if (isTaskPending || isAppointmentSlotPending) return;

    if (formState.eventType === EVENT_TYPES.TASK) {
      createTask({
        task_title: formState.taskTitle,
        client: formState.client,
        start_date: formState.startDate,
        end_date: formState.endDate,
        note: formState.note,
        alarm: formState.alarm,
        user_id: formState.userId,
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

        createAppointmentSlot({
          is_recurring: true,
          user_id: formState.userId,
          location: formState.location,
          total_slots: formState.totalSlots,
          start_time: formState.startDate,
          end_time: formState.endDate,
          repeat_until: formState.endDate,
          day_of_week,
          note: formState.note,
        });
      } else {
        createAppointmentSlot({
          is_recurring: false,
          user_id: formState.userId,
          location: formState.location,
          total_slots: formState.totalSlots,
          date: formState.startDate,
          start_time: formState.startDate,
          end_time: formState.endDate,
          note: formState.note,
        });
      }
    }

    if (formState.eventType === EVENT_TYPES.APPOINTMENT) {
      console.log("Appointment");
      Alert.alert("Info", "Appointment not implemented yet");
    }
  };

  return {
    formState,
    setField,
    handleSave,
    isPending: isTaskPending || isAppointmentSlotPending,
  };
};
