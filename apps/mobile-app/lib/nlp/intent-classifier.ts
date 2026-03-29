import type { AIActionType } from "@repo/models";
import nlp from "compromise";

const INTENT_KEYWORDS: Partial<Record<AIActionType, string[]>> = {
  appointment: [
    "book",
    "schedule",
    "appt",
    "appointment",
    "meeting",
    "cancel appointment",
    "reschedule",
    "visit",
    "set up",
    "add appointment",
    "new appointment",
    "see",
  ],
  reminder: [
    "remind",
    "reminder",
    "alert",
    "notify",
    "notification",
    "don't forget",
    "remember",
    "ping me",
  ],
  client_management: [
    "record",
    "records",
    "report",
    "history",
    "retrieve",
    "find patient",
    "find client",
    "get records",
    "show records",
    "lookup",
    "look up",
    "details",
    "information",
    "profile",
    "patient",
    "client",
    "summary",
    "notes",
    "fetch",
    "pull up",
  ],
  greeting: [
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
    "howdy",
  ],
};

// Verbs that strongly suggest booking intent
const APPOINTMENT_VERBS = new Set([
  "book",
  "schedule",
  "meet",
  "see",
  "visit",
  "fix",
  "cancel",
  "reschedule",
  "arrange",
  "set",
]);

export function classifyIntent(text: string): AIActionType {
  const lower = text.toLowerCase();

  for (const intent of [
    "appointment",
    "reminder",
    "client_management",
    "greeting",
  ] as AIActionType[]) {
    const keywords = INTENT_KEYWORDS[intent] ?? [];
    if (keywords.some((kw) => lower.includes(kw))) {
      return intent;
    }
  }

  const verbs: string[] = (
    nlp(text) as { verbs: () => { out: (fmt: string) => string[] } }
  )
    .verbs()
    .out("array");

  if (verbs.some((v) => APPOINTMENT_VERBS.has(v.toLowerCase()))) {
    return "appointment";
  }

  return "general";
}
