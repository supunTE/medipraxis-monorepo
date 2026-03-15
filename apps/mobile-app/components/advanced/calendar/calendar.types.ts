export interface AgendaBlockContent {
  id: string;
  title: string;
  client?: string;
}

export interface AgendaTimeBlockData {
  content: AgendaBlockContent;
  startTime: string;
  endTime: string;
}

export interface AgendaTimeBlockGroupData {
  id: string;
  startTime: string;
  endTime: string;
  slots: number;
  contents: (AgendaBlockContent | null)[];
}

export interface AgendaReminderContent {
  id: string;
  title: string;
}

export interface AgendaReminderData {
  content: AgendaReminderContent;
  startTime: string;
  endTime?: string;
  isCompleted: boolean;
}

export interface AgendaData {
  timeBlocks?: AgendaTimeBlockData[];
  timeBlockGroups?: AgendaTimeBlockGroupData[];
  reminders?: AgendaReminderData[];
}

export enum AgendaSelectionType {
  Appointment = "appointment",
  EmptySlot = "empty_slot",
  Reminder = "reminder",
}

export type AgendaSelection =
  | {
      type: AgendaSelectionType.Appointment;
      appointmentId: string;
      groupId: string | null;
    }
  | {
      type: AgendaSelectionType.Reminder;
      reminderId: string;
    }
  | {
      type: AgendaSelectionType.EmptySlot;
      groupId: string;
      slotNumber: number;
    };
