import type { ClientDisplay } from "@/services/clients/useClients";
import type { AIActionType } from "@repo/models";
import {
  extractEntities,
  type DateEntity,
  type NameEntity,
  type TimeEntity,
} from "./entity-extractor";
import { fuzzyMatch } from "./fuzzy-match";
import { classifyIntent } from "./intent-classifier";
import { normalize } from "./normalizer";

export interface ParsedPerson extends NameEntity {
  suggestedClient?: {
    id: string;
    name: string;
    score: number;
  };
}

export interface ParsedInput {
  normalizedText: string;
  /** Maps to the same AIActionType enum the server uses */
  intent: AIActionType;
  entities: {
    people: ParsedPerson[];
    dates: DateEntity[];
    times: TimeEntity[];
  };
  hasEntities: boolean;
}

export type { DateEntity, NameEntity, TimeEntity };

export function parse(
  rawText: string,
  clients: ClientDisplay[] = []
): ParsedInput {
  const normalizedText = normalize(rawText);
  const intent = classifyIntent(normalizedText);
  const { people: rawPeople, dates, times } = extractEntities(normalizedText);

  // Augment each detected person with the closest matching patient
  const people: ParsedPerson[] = rawPeople.map((person) => {
    const match = fuzzyMatch(person.text, clients);
    return {
      ...person,
      ...(match
        ? {
            suggestedClient: {
              id: match.client.id,
              name: match.client.name,
              score: match.score,
            },
          }
        : {}),
    };
  });

  const hasEntities = people.length > 0 || dates.length > 0 || times.length > 0;

  return {
    normalizedText,
    intent,
    entities: { people, dates, times },
    hasEntities,
  };
}
