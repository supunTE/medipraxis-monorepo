import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { SlotWindowService } from "../services/slot_window.service";
import type { SlotWindowRepository } from "../repositories/slot_window.repository";
import type { TaskRepository } from "../repositories/task.repository";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ALL_DAYS = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
] as const;

/**
 * Jest 30: ResolveType<T> = ReturnType<T> extends PromiseLike<infer U> ? U : never
 * Untyped jest.fn() returns unknown → mockResolvedValue expects never.
 * Typing as () => Promise<unknown> makes mockResolvedValue accept any value.
 */
type AnyMock = jest.Mock<(...args: unknown[]) => Promise<unknown>>;
const mockFn = () => jest.fn<(...args: unknown[]) => Promise<unknown>>();

function makeTemplate(overrides: Record<string, unknown> = {}) {
  return {
    slot_window_template_id: "template-1",
    user_id: "user-1",
    day_of_week: ["MONDAY"],
    start_time: "09:00:00",
    end_time: "12:00:00",
    total_slots: 6,
    slot_duration: 1800,
    is_active: true,
    end_date: null,
    note: null,
    location: null,
    created_date: "2024-01-01T00:00:00Z",
    modified_date: "2024-01-01T00:00:00Z",
    deleted_date: null,
    ...overrides,
  };
}

function makeSlotWindow(overrides: Record<string, unknown> = {}) {
  return {
    slot_window_id: "window-1",
    template_id: "template-1",
    user_id: "user-1",
    start_date: "2024-01-15T09:00:00",
    end_date: "2024-01-15T12:00:00",
    total_slots: 6,
    slots_filled: 0,
    task_status_id: "status-not-started",
    is_override: false,
    note: null,
    location: null,
    created_date: "2024-01-15T00:00:00Z",
    modified_date: "2024-01-15T00:00:00Z",
    ...overrides,
  };
}

function makeMockSlotWindowRepo(
  overrides: Partial<Record<string, AnyMock>> = {}
): SlotWindowRepository {
  const base: Record<string, AnyMock> = {
    findActiveSlotWindowTemplatesByUserId: mockFn().mockResolvedValue([]),
    findSlotWindowTemplateById: mockFn().mockResolvedValue(null),
    findSlotWindowsByTemplateId: mockFn().mockResolvedValue([]),
    findSlotWindowTemplatesForGeneration: mockFn().mockResolvedValue([]),
    createSlotWindowTemplate: mockFn().mockResolvedValue(makeTemplate()),
    createSlotWindow: mockFn().mockResolvedValue(makeSlotWindow()),
    hasConflictingSlotWindow: mockFn().mockResolvedValue(false),
    findSlotWindowById: mockFn().mockResolvedValue(null),
    updateSlotWindowStatus: mockFn().mockResolvedValue(makeSlotWindow()),
    updateSlotWindowTemplate: mockFn().mockResolvedValue(makeTemplate()),
    deleteSlotWindowTemplate: mockFn().mockResolvedValue(makeTemplate()),
    deactivateSlotWindowTemplate: mockFn().mockResolvedValue(makeTemplate()),
    deleteByIds: mockFn().mockResolvedValue([]),
    reserveSlotFromSlotWindow: mockFn().mockResolvedValue(1),
    releaseSlotToSlotWindow: mockFn().mockResolvedValue(undefined),
    findAllSlotWindowsByUserId: mockFn().mockResolvedValue([]),
    findSlotWindowTemplatesByUserId: mockFn().mockResolvedValue([]),
    findSlotWindowsByUserId: mockFn().mockResolvedValue([]),
    findSlotWindowsByDateRange: mockFn().mockResolvedValue([]),
    hasAvailableSlots: mockFn().mockResolvedValue(true),
    getSlotsAvailability: mockFn().mockResolvedValue(null),
    updateSlotWindow: mockFn().mockResolvedValue(makeSlotWindow()),
  };
  return { ...base, ...overrides } as unknown as SlotWindowRepository;
}

function makeMockTaskRepo(
  overrides: Partial<Record<string, AnyMock>> = {}
): TaskRepository {
  const base: Record<string, AnyMock> = {
    getTaskStatusByName: mockFn().mockResolvedValue("status-not-started-id"),
    findBySlotWindowId: mockFn().mockResolvedValue([]),
    update: mockFn().mockResolvedValue({}),
  };
  return { ...base, ...overrides } as unknown as TaskRepository;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("SlotWindowService", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  describe("createAppointmentSlotWindowTemplate", () => {
    it("throws when new template time overlaps an existing template on the same day", async () => {
      const existing = makeTemplate({
        slot_window_template_id: "existing-1",
        day_of_week: ["MONDAY", "WEDNESDAY"],
        start_time: "09:00:00",
        end_time: "12:00:00",
      });

      const service = new SlotWindowService(
        makeMockSlotWindowRepo({
          findActiveSlotWindowTemplatesByUserId: mockFn().mockResolvedValue([
            existing,
          ]),
        }),
        makeMockTaskRepo()
      );

      await expect(
        service.createAppointmentSlotWindowTemplate({
          user_id: "user-1",
          day_of_week: ["MONDAY"],
          start_time: "10:00:00",
          end_time: "11:00:00",
          total_slots: 2,
        })
      ).rejects.toThrow("Template conflicts with existing template on MONDAY");
    });

    it("throws when end time is before start time", async () => {
      const service = new SlotWindowService(
        makeMockSlotWindowRepo(),
        makeMockTaskRepo()
      );

      await expect(
        service.createAppointmentSlotWindowTemplate({
          user_id: "user-1",
          day_of_week: ["MONDAY"],
          start_time: "12:00:00",
          end_time: "09:00:00",
          total_slots: 4,
        })
      ).rejects.toThrow("End time must be after start time");
    });
  });

  describe("createAppointmentSlotWindow (one-off)", () => {
    it("throws when the time overlaps an active template on the same day", async () => {
      // 2024-01-01 is a Monday
      const existing = makeTemplate({
        day_of_week: ["MONDAY"],
        start_time: "09:00:00",
        end_time: "12:00:00",
      });

      const service = new SlotWindowService(
        makeMockSlotWindowRepo({
          findActiveSlotWindowTemplatesByUserId: mockFn().mockResolvedValue([
            existing,
          ]),
        }),
        makeMockTaskRepo()
      );

      await expect(
        service.createAppointmentSlotWindow({
          user_id: "user-1",
          start_date: "2024-01-01T10:00:00",
          end_date: "2024-01-01T11:00:00",
          total_slots: 2,
        })
      ).rejects.toThrow(
        "Slot window conflicts with existing template on MONDAY"
      );
    });
  });

  describe("createAppointmentSlotWindowForSpecificTemplate", () => {
    it("returns error immediately when template is inactive", async () => {
      const service = new SlotWindowService(
        makeMockSlotWindowRepo({
          findSlotWindowTemplateById: mockFn().mockResolvedValue(
            makeTemplate({ is_active: false })
          ),
        }),
        makeMockTaskRepo()
      );

      const result =
        await service.createAppointmentSlotWindowForSpecificTemplate(
          "template-1"
        );

      expect(result.errors).toContain("Template is not active");
      expect(result.created).toBe(0);
    });

    it("skips already-generated windows and creates only missing ones", async () => {
      // Noon UTC — Jan 15 in all timezones from UTC-12 to UTC+11
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-15T12:00:00.000Z"));

      // Compute today's local date the same way getMatchingDates does internally
      const now = new Date();
      const todayDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, "0"),
        String(now.getDate()).padStart(2, "0"),
      ].join("-");

      // Template runs every day → 8 matching dates in the 7-day window
      const template = makeTemplate({
        day_of_week: [...ALL_DAYS],
        is_active: true,
      });
      const existingWindow = makeSlotWindow({
        start_date: `${todayDate}T09:00:00`,
      });

      const createSlotWindow = mockFn().mockResolvedValue(makeSlotWindow());

      const service = new SlotWindowService(
        makeMockSlotWindowRepo({
          findSlotWindowTemplateById: mockFn().mockResolvedValue(template),
          findSlotWindowsByTemplateId: mockFn().mockResolvedValue([
            existingWindow,
          ]),
          hasConflictingSlotWindow: mockFn().mockResolvedValue(false),
          createSlotWindow,
        }),
        makeMockTaskRepo()
      );

      const result =
        await service.createAppointmentSlotWindowForSpecificTemplate(
          "template-1"
        );

      // 1 duplicate skipped, remaining 7 days created
      expect(result.skipped).toBe(1);
      expect(result.created).toBe(7);
      expect(createSlotWindow).toHaveBeenCalledTimes(7);
    });
  });

  describe("cancelAppointmentSlotWindow", () => {
    it("cancels all associated tasks and updates the slot window status", async () => {
      const CANCELLED_STATUS_ID = "status-cancelled-id";
      const slotWindow = makeSlotWindow({ slot_window_id: "window-1" });
      const tasks = [
        { task_id: "task-1", slot_window_id: "window-1" },
        { task_id: "task-2", slot_window_id: "window-1" },
      ];

      const updateSlotWindowStatus = mockFn().mockResolvedValue({
        ...slotWindow,
        task_status_id: CANCELLED_STATUS_ID,
      });
      const updateTask = mockFn().mockResolvedValue({});

      const service = new SlotWindowService(
        makeMockSlotWindowRepo({
          findSlotWindowById: mockFn().mockResolvedValue(slotWindow),
          updateSlotWindowStatus,
        }),
        makeMockTaskRepo({
          getTaskStatusByName: mockFn().mockResolvedValue(CANCELLED_STATUS_ID),
          findBySlotWindowId: mockFn().mockResolvedValue(tasks),
          update: updateTask,
        })
      );

      const result = await service.cancelAppointmentSlotWindow("window-1");

      expect(result.cancelledTasks).toBe(2);
      expect(updateTask).toHaveBeenCalledTimes(2);
      expect(updateSlotWindowStatus).toHaveBeenCalledWith(
        "window-1",
        CANCELLED_STATUS_ID
      );
    });
  });
});
