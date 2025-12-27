/**
 * Converts hours and minutes to total minutes from midnight
 * @param hours - Hour value (0-23)
 * @param minutes - Minute value (0-59)
 * @returns Total minutes from midnight (0-1439)
 */
export function timeToMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes;
}

/**
 * Converts total minutes from midnight to hours and minutes
 * @param totalMinutes - Total minutes from midnight (0-1439)
 * @returns Object containing hours and minutes
 */
export function minutesToTime(totalMinutes: number): {
  hours: number;
  minutes: number;
} {
  const totalMinutesRounded = Math.round(totalMinutes);
  const hours = Math.floor(totalMinutesRounded / 60);
  const minutes = totalMinutesRounded % 60;
  return { hours, minutes };
}

/**
 * Formats minutes from midnight to display time string
 * @param totalMinutes - Total minutes from midnight (0-1439)
 * @returns Formatted time string (e.g., "8:30 am", "2:15 pm")
 */
export function formatTimeFromMinutes(totalMinutes: number): string {
  const { hours, minutes } = minutesToTime(totalMinutes);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Calculates the time for a specific slot based on slot index and time-based configuration
 * @param slotIndex - The index of the slot (0-based)
 * @param startTimeMinutes - The starting time in minutes from midnight
 * @param slotDurationMinutes - Duration of each slot in minutes
 * @returns Formatted time string (e.g., "8:30 am")
 */
export function getSlotTimeFromMinutes(
  slotIndex: number,
  startTimeMinutes: number,
  slotDurationMinutes: number
): string {
  const slotStartMinutes = startTimeMinutes + slotIndex * slotDurationMinutes;
  return formatTimeFromMinutes(slotStartMinutes);
}

/**
 * Parses a time string to minutes from midnight
 * @param timeString - Time string in format "HH:MM" (24-hour) or "H:MM am/pm" (12-hour)
 * @returns Total minutes from midnight (0-1439)
 * @example
 * parseTimeToMinutes("9:30") // 570
 * parseTimeToMinutes("14:45") // 885
 * parseTimeToMinutes("2:30 pm") // 870
 */
export function parseTimeToMinutes(timeString: string): number {
  // Handle undefined/null/empty strings
  if (!timeString) {
    console.warn("parseTimeToMinutes: received empty or undefined time string");
    return 0;
  }

  const cleanTime = timeString.trim().toLowerCase();

  // Check if it's 12-hour format (has am/pm)
  const is12Hour = cleanTime.includes("am") || cleanTime.includes("pm");

  if (is12Hour) {
    // Parse 12-hour format
    const isPM = cleanTime.includes("pm");
    const timePart = cleanTime.replace(/am|pm/g, "").trim();
    const [hoursStr, minutesStr] = timePart.split(":");
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || "0", 10);

    // Convert to 24-hour
    if (isPM && hours !== 12) {
      hours += 12;
    } else if (!isPM && hours === 12) {
      hours = 0;
    }

    return timeToMinutes(hours, minutes);
  } else {
    // Parse 24-hour format
    const [hoursStr, minutesStr] = cleanTime.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr || "0", 10);
    return timeToMinutes(hours, minutes);
  }
}

/**
 * Converts a time string to decimal hour with 1 decimal place precision
 * @param timeString - Time string in format "HH:MM" (24-hour) or "H:MM am/pm" (12-hour)
 * @returns Decimal hour rounded to 1 decimal place (e.g., 8.5, 16.8, 4.2)
 * @example
 * timeToDecimalHour("8:30 am") // 8.5
 * timeToDecimalHour("4:48 pm") // 16.8
 * timeToDecimalHour("9:15") // 9.3
 */
export function timeToDecimalHour(timeString: string): number {
  const totalMinutes = parseTimeToMinutes(timeString);
  const decimalHour = totalMinutes / 60;
  // Round to 1 decimal place
  return Math.round(decimalHour * 10) / 10;
}

/**
 * Formats a duration in minutes to a human-readable string
 * @param durationMinutes - Duration in minutes
 * @returns Formatted duration string (e.g., "15 mins", "1 hr 30 mins", "2 hrs")
 * @example
 * formatDuration(15) // "15 mins"
 * formatDuration(90) // "1 hr 30 mins"
 * formatDuration(120) // "2 hrs"
 * formatDuration(65) // "1 hr 5 mins"
 */
export function formatDuration(durationMinutes: number): string {
  const roundedMinutes = Math.round(durationMinutes);
  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (hours === 0) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  } else if (minutes === 0) {
    return `${hours} hr${hours !== 1 ? "s" : ""}`;
  } else {
    return `${hours} hr${hours !== 1 ? "s" : ""} ${minutes} min${minutes !== 1 ? "s" : ""}`;
  }
}

/**
 * Groups reminders that are in close proximity or have overlapping times
 * @param reminders - Array of reminder data with startTime and optional endTime
 * @param proximityMinutes - Minutes threshold for grouping (default: 15)
 * @param defaultDurationMinutes - Default duration when no endTime (default: 30)
 * @returns Array of grouped reminders
 */
export function groupReminders<
  T extends { startTime: string; endTime?: string },
>(
  reminders: T[],
  proximityMinutes: number = 15,
  defaultDurationMinutes: number = 30
): Array<{
  startTime: string;
  endTime: string;
  reminders: T[];
  count: number;
}> {
  if (!reminders || reminders.length === 0) {
    return [];
  }

  // Sort reminders by start time
  const sorted = [...reminders].sort((a, b) => {
    const aMinutes = parseTimeToMinutes(a.startTime);
    const bMinutes = parseTimeToMinutes(b.startTime);
    return aMinutes - bMinutes;
  });

  const groups: Array<{
    startTime: string;
    endTime: string;
    reminders: T[];
    count: number;
  }> = [];

  let currentGroup: T[] = [sorted[0]];
  let groupStartMinutes = parseTimeToMinutes(sorted[0].startTime);
  let groupEndMinutes = sorted[0].endTime
    ? parseTimeToMinutes(sorted[0].endTime)
    : groupStartMinutes + defaultDurationMinutes;

  for (let i = 1; i < sorted.length; i++) {
    const reminder = sorted[i];
    const reminderStartMinutes = parseTimeToMinutes(reminder.startTime);
    const reminderEndMinutes = reminder.endTime
      ? parseTimeToMinutes(reminder.endTime)
      : reminderStartMinutes + defaultDurationMinutes;

    // Check if this reminder should be grouped with current group
    // Group if: overlapping OR within proximity threshold
    const isOverlapping = reminderStartMinutes < groupEndMinutes;
    const isCloseProximity =
      reminderStartMinutes - groupEndMinutes <= proximityMinutes;

    if (isOverlapping || isCloseProximity) {
      // Add to current group and extend end time if needed
      currentGroup.push(reminder);
      groupEndMinutes = Math.max(groupEndMinutes, reminderEndMinutes);
    } else {
      // Save current group and start new one
      groups.push({
        startTime: formatTimeFromMinutes(groupStartMinutes),
        endTime: formatTimeFromMinutes(groupEndMinutes),
        reminders: currentGroup,
        count: currentGroup.length,
      });

      currentGroup = [reminder];
      groupStartMinutes = reminderStartMinutes;
      groupEndMinutes = reminderEndMinutes;
    }
  }

  // Add the last group
  groups.push({
    startTime: formatTimeFromMinutes(groupStartMinutes),
    endTime: formatTimeFromMinutes(groupEndMinutes),
    reminders: currentGroup,
    count: currentGroup.length,
  });

  return groups;
}
