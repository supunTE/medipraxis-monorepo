import type { AIActionType } from "@repo/models";

export interface ActionTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export type AIActionTools = Partial<Record<AIActionType, ActionTool>>;
