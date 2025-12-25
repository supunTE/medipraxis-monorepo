/**
 * Calculates the time for a specific slot based on slot index and configuration
 * @param slotIndex - The index of the slot (0-based)
 * @param startHour - The starting hour of the time block
 * @param slotDurationMinutes - Duration of each slot in minutes
 * @returns Formatted time string (e.g., "8:30 am")
 */
export function getSlotTime(
  slotIndex: number,
  startHour: number,
  slotDurationMinutes: number
): string {
  const totalMinutesFromStart = slotIndex * slotDurationMinutes;
  const hours = startHour + Math.floor(totalMinutesFromStart / 60);
  const minutes = Math.floor(totalMinutesFromStart % 60);
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Calculates slot duration in minutes based on time block configuration
 * @param startHour - The starting hour of the time block
 * @param endHour - The ending hour of the time block
 * @param slots - Total number of slots in the time block
 * @returns Duration of each slot in minutes
 */
export function calculateSlotDuration(
  startHour: number,
  endHour: number,
  slots: number
): number {
  const totalDurationMinutes = (endHour - startHour) * 60;
  return totalDurationMinutes / slots;
}

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
 * Calculates the duration between two times in minutes
 * @param startTimeMinutes - Start time in minutes from midnight
 * @param endTimeMinutes - End time in minutes from midnight
 * @returns Duration in minutes
 */
export function calculateDuration(
  startTimeMinutes: number,
  endTimeMinutes: number
): number {
  return endTimeMinutes - startTimeMinutes;
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
