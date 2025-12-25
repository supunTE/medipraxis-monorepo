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

export interface AgendaData {
  timeBlocks?: AgendaTimeBlockData[];
  timeBlockGroups?: AgendaTimeBlockGroupData[];
}

export enum AgendaSelectionType {
  Appointment = "appointment",
  EmptySlot = "empty_slot",
}

export type AgendaSelection =
  | {
      type: AgendaSelectionType.Appointment;
      appointmentId: string;
      groupId: string | null;
    }
  | {
      type: AgendaSelectionType.EmptySlot;
      groupId: string;
      slotNumber: number;
    };
