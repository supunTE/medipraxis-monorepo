import { DayOfWeek } from "@repo/models";
import { useState } from "react";
import { Alert } from "react-native";
import { useCreateAppointmentSlot } from "./useCreateAppointmentSlot";
import { useCreateTask } from "./useCreateTask";

export const EVENT_TYPES = {
  TASK: "task",
  APPOINTMENT_SLOT_WINDOW: "slot_window",
  APPOINTMENT: "appointment",
} as const;

export type EventType = (typeof EVENT_TYPES)[keyof typeof EVENT_TYPES];

type FormState = {
  eventType: EventType;
  user_id: string;

  // Task specific
  task_title: string;
  client: string;
  alarm: boolean;

  // Appointment Slot specific
  is_recurring: boolean;
  location: string;
  total_slots: number;

  // Common / Shared
  start_date: string;
  end_date: string;
  note: string;

  // UI state
  repeatDays: number[];
  slotWindow: string;
  slotNo: string | number;
  attachToSlot: boolean;
};

const DEFAULT_FORM_STATE: FormState = {
  eventType: EVENT_TYPES.TASK,
  task_title: "",
  client: "Jennifer",
  start_date: "2025-11-15T08:00",
  end_date: "2025-11-15T11:30",
  note: "",
  alarm: true,
  user_id: "",
  repeatDays: [],
  total_slots: 1,
  location: "",
  slotWindow: "",
  slotNo: "",
  attachToSlot: false,
  is_recurring: false,
};

const DEFAULT_APPOINTMENT_SLOT_STATE: FormState = {
  eventType: EVENT_TYPES.APPOINTMENT_SLOT_WINDOW,
  start_date: "2025-11-15T08:00",
  end_date: "2025-11-15T11:30",
  note: "",
  location: "Care - Medical Centre",
  user_id: "",
  total_slots: 1,
  repeatDays: [],
  task_title: "",
  client: "",
  alarm: false,
  slotWindow: "",
  slotNo: "",
  attachToSlot: false,
  is_recurring: false,
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
        task_title: formState.task_title || "",
        client: formState.client || "",
        start_date: formState.start_date,
        end_date: formState.end_date,
        note: formState.note || "",
        alarm: formState.alarm || false,
        user_id: formState.user_id,
      });
    }

    if (formState.eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW) {
      const is_recurring = (formState.repeatDays?.length ?? 0) > 0;

      if (is_recurring) {
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
        const day_of_week = (formState.repeatDays || []).map(
          (d) => DAYS[d] as unknown as DayOfWeek
        );

        createAppointmentSlot({
          is_recurring: true,
          user_id: formState.user_id,
          location: formState.location,
          total_slots: formState.total_slots || 1,
          start_time: formState.start_date,
          end_time: formState.end_date,
          repeat_until: formState.end_date,
          day_of_week,
          note: formState.note,
        });
      } else {
        createAppointmentSlot({
          is_recurring: false,
          user_id: formState.user_id,
          location: formState.location,
          total_slots: formState.total_slots || 1,
          date: formState.start_date,
          start_time: formState.start_date,
          end_time: formState.end_date,
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
