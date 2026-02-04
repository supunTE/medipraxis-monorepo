export enum AIChatRole {
  User = "user",
  Assistant = "assistant",
}

export interface UIChatMessage {
  id: string;
  role: AIChatRole;
  isError?: boolean;
  content: string;
  timestamp: Date;
}

export type AIActionType =
  | "greeting"
  | "appointment"
  | "client_management"
  | "general"
  | "unknown";

export interface RouterResponse {
  task: AIActionType;
  message?: string;
  isValid: boolean;
  guardRailViolation?: string;
  shouldCallWorkflow?: boolean;
}
