// hooks/useTaskForm.ts
import { useState } from "react";

type CreateTaskPayload = {
  task_title: string;
  eventType: string;
  client: string;
  start_date: string;
  end_date: string;
  note: string;
  alarm: boolean;
  location: string;
  attachToSlot: boolean;
  user_id: string;
  total_slots: number;
  repeatDays: number[];
  slotWindow: string;
  slotNo: number;
};

const DEFAULT_FORM_STATE: CreateTaskPayload = {
  task_title: "",
  eventType: "Appointment",
  client: "Jennifer",
  start_date: "2025-11-15T08:00",
  end_date: "2025-11-15T11:30",
  note: "",
  alarm: true,
  location: "Care - Medical Centre",
  attachToSlot: false,
  user_id: "",
  total_slots: 1,
  repeatDays: [],
  slotWindow: "",
  slotNo: 1,
};

export const useTaskHandler = () => {
  const [formState, setFormState] =
    useState<CreateTaskPayload>(DEFAULT_FORM_STATE);

  const setField = <K extends keyof CreateTaskPayload>(
    key: K,
    value: CreateTaskPayload[K]
  ) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = () => {
    console.log("formState: " + JSON.stringify(formState));
  };

  return {
    formState,
    setField,
    handleSave,
    isPending: false,
  };
};
