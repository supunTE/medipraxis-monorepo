import * as chrono from "chrono-node";

export interface NameEntity {
  text: string;
  start: number;
  end: number;
}

export interface DateEntity {
  text: string;
  resolved: Date;
  displayText: string;
  start: number;
  end: number;
}

export interface TimeEntity {
  text: string;
  resolved: string;
  start: number;
  end: number;
}

export interface ExtractedEntities {
  people: NameEntity[];
  dates: DateEntity[];
  times: TimeEntity[];
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}

function buildDisplayText(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return `Today · ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow · ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function extractNames(text: string): NameEntity[] {
  const people: NameEntity[] = [];
  // Match sequences of Title-Case words as potential person names.
  const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  let match: RegExpExecArray | null;
  while ((match = namePattern.exec(text)) !== null) {
    if (match.index > 0) {
      people.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  return people;
}

export function extractEntities(text: string): ExtractedEntities {
  const referenceDate = new Date();

  const people = extractNames(text);

  const chronoResults = chrono.parse(text, referenceDate, {
    forwardDate: true,
  });

  const dates: DateEntity[] = [];
  const times: TimeEntity[] = [];

  for (const result of chronoResults) {
    const startComp = result.start;
    const hasDate =
      startComp.isCertain("day") ||
      startComp.isCertain("weekday") ||
      startComp.isCertain("month");
    const hasTime = startComp.isCertain("hour");

    if (hasDate) {
      const resolved = result.date();
      dates.push({
        text: result.text,
        resolved,
        displayText: buildDisplayText(resolved),
        start: result.index,
        end: result.index + result.text.length,
      });
    }

    if (hasTime) {
      let hour = startComp.get("hour") ?? 0;
      const minute = startComp.get("minute") ?? 0;

      if (!startComp.isCertain("meridiem") && hour > 0 && hour <= 11) {
        hour += 12;
      }
      times.push({
        text: result.text,
        resolved: `${pad(hour)}:${pad(minute)}`,
        start: result.index,
        end: result.index + result.text.length,
      });
    }
  }

  return { people, dates, times };
}
