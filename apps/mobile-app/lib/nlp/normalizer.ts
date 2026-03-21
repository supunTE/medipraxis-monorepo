const ABBREVIATIONS: Record<string, string> = {
  // Time
  tmr: "tomorrow",
  tmrw: "tomorrow",
  // Appointment
  appt: "appointment",
  apptmt: "appointment",
  // Days
  mon: "monday",
  tue: "tuesday",
  tues: "tuesday",
  wed: "wednesday",
  thu: "thursday",
  thur: "thursday",
  thurs: "thursday",
  fri: "friday",
  sat: "saturday",
  sun: "sunday",
  // Relative time
  wk: "week",
  nxt: "next",
  // Medical / clinic
  pt: "patient",
  pts: "patients",
  rec: "records",
  recs: "records",
  dr: "doctor",
  doc: "doctor",
  // Misc
  info: "information",
  msg: "message",
  avail: "available",
};

export function normalize(text: string): string {
  if (!text.trim()) return text;

  let result = text;

  for (const [abbr, full] of Object.entries(ABBREVIATIONS)) {
    // Word-boundary replacement (case-insensitive)
    const pattern = new RegExp(`\\b${abbr}\\b`, "gi");
    result = result.replace(pattern, (match) => {
      // Preserve original casing style (all-caps → all-caps, else lowercase expansion)
      return match === match.toUpperCase() ? full.toUpperCase() : full;
    });
  }

  // Capitalize the first character of the whole string
  return result.charAt(0).toUpperCase() + result.slice(1);
}
