export interface AgendaBlockContent {
  title: string;
  client?: string;
}

export interface AgendaTimeBlockData {
  content: AgendaBlockContent;
  startHour: number;
  endHour: number;
}

export interface AgendaTimeBlockGroupData {
  startHour: number;
  endHour: number;
  slots: number;
  contents: (AgendaBlockContent | null)[];
}

export interface AgendaData {
  timeBlocks?: AgendaTimeBlockData[];
  timeBlockGroups?: AgendaTimeBlockGroupData[];
}
