import {
  formatDuration,
  formatTimeFromMinutes,
  getSlotTimeFromMinutes,
  parseTimeToMinutes,
  timeToDecimalHour,
  timeToMinutes,
} from "../utils/timeUtils";

describe("timeToMinutes", () => {
  it("converts hours and minutes to total minutes from midnight", () => {
    expect(timeToMinutes(8, 30)).toBe(510);
    expect(timeToMinutes(0, 0)).toBe(0);
    expect(timeToMinutes(23, 59)).toBe(1439);
  });
});

describe("formatTimeFromMinutes", () => {
  it("formats morning time correctly", () => {
    expect(formatTimeFromMinutes(510)).toBe("8:30 am");
  });

  it("formats afternoon time correctly", () => {
    expect(formatTimeFromMinutes(870)).toBe("2:30 pm");
  });

  it("formats midnight (0 mins) as 12:00 am", () => {
    expect(formatTimeFromMinutes(0)).toBe("12:00 am");
  });

  it("formats noon (720 mins) as 12:00 pm", () => {
    expect(formatTimeFromMinutes(720)).toBe("12:00 pm");
  });
});

describe("parseTimeToMinutes", () => {
  it("parses 24-hour format", () => {
    expect(parseTimeToMinutes("9:30")).toBe(570);
    expect(parseTimeToMinutes("14:45")).toBe(885);
  });

  it("parses 12-hour am/pm format", () => {
    expect(parseTimeToMinutes("2:30 pm")).toBe(870);
    expect(parseTimeToMinutes("12:00 am")).toBe(0);
    expect(parseTimeToMinutes("12:00 pm")).toBe(720);
  });

  it("returns 0 for empty string", () => {
    expect(parseTimeToMinutes("")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("formats minutes-only durations", () => {
    expect(formatDuration(15)).toBe("15 mins");
    expect(formatDuration(1)).toBe("1 min");
  });

  it("formats hours-only durations", () => {
    expect(formatDuration(60)).toBe("1 hr");
    expect(formatDuration(120)).toBe("2 hrs");
  });

  it("formats mixed hours and minutes", () => {
    expect(formatDuration(90)).toBe("1 hr 30 mins");
    expect(formatDuration(65)).toBe("1 hr 5 mins");
  });
});

describe("timeToDecimalHour", () => {
  it("converts time string to decimal hour", () => {
    expect(timeToDecimalHour("8:30 am")).toBe(8.5);
    expect(timeToDecimalHour("4:48 pm")).toBe(16.8);
    expect(timeToDecimalHour("9:15")).toBe(9.3);
  });
});

describe("getSlotTimeFromMinutes", () => {
  it("calculates correct slot time based on index and duration", () => {
    expect(getSlotTimeFromMinutes(0, 480, 30)).toBe("8:00 am");
    expect(getSlotTimeFromMinutes(1, 480, 30)).toBe("8:30 am");
    expect(getSlotTimeFromMinutes(2, 480, 30)).toBe("9:00 am");
  });
});
