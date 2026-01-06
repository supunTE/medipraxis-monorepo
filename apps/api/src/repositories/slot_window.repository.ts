import type {
  CreateSlotWindowInput,
  CreateSlotWindowTemplateInput,
  DayOfWeek,
  FindAvailableSlotWindowsQuery,
  SlotWindow,
  SlotWindowForClient,
  SlotWindowTemplate,
  UpdateSlotWindowInput,
  UpdateSlotWindowTemplateInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

// Day of week conversion utilities
const DAY_OF_WEEK_MAP: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const NUMBER_TO_DAY_MAP: Record<number, DayOfWeek> = {
  0: "SUNDAY",
  1: "MONDAY",
  2: "TUESDAY",
  3: "WEDNESDAY",
  4: "THURSDAY",
  5: "FRIDAY",
  6: "SATURDAY",
};

function convertDaysToNumbers(days: DayOfWeek[]): number[] {
  return days.map((day) => DAY_OF_WEEK_MAP[day]);
}

function convertNumbersToDays(numbers: (number | string)[]): DayOfWeek[] {
  return numbers.map((num) => {
    const numericValue = typeof num === "string" ? parseInt(num, 10) : num;
    return NUMBER_TO_DAY_MAP[numericValue] as DayOfWeek;
  });
}

export const SLOT_WINDOW_QUERIES = {
  // Table names
  SLOT_WINDOW_TEMPLATE_TABLE: "slot_window_template",
  SLOT_WINDOW_TABLE: "slot_window",
  TASK_STATUS_TABLE: "task_status",

  // Field names
  TASK_STATUS_ID: "task_status_id",

  // Template queries
  TEMPLATE_BASE: "*",
  TEMPLATE_WITH_USER: `
    *,
    user:user_id (user_id, first_name, last_name)
  `,

  // Slot window queries
  SLOT_WINDOW_BASE: `
    *,
    task_status:task_status_id (task_status_name)
  `,
  SLOT_WINDOW_FOR_CLIENT: `
    slot_window_id, template_id, user_id, start_date, end_date,
    total_slots, slots_filled, task_status_id, note, location,
    task_status:task_status_id (task_status_name)
  `,
} as const;

export const SLOT_WINDOW_RPCS = {
  INCREMENT_COUNTER: "increment_slot_window_counter",
  DECREMENT_COUNTER: "decrement_slot_window_counter",
  RESERVE_SLOT: "reserve_slot_from_slot_window",
  RELEASE_SLOT: "release_slot_to_slot_window",
} as const;

export class SlotWindowRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  // ===== SLOT WINDOW TEMPLATE METHODS =====

  async createSlotWindowTemplate(
    slotWindowTemplateData: CreateSlotWindowTemplateInput & {
      slot_duration: number;
    }
  ): Promise<SlotWindowTemplate> {
    const data = {
      user_id: slotWindowTemplateData.user_id,
      day_of_week: convertDaysToNumbers(slotWindowTemplateData.day_of_week),
      start_time: slotWindowTemplateData.start_time,
      end_time: slotWindowTemplateData.end_time,
      total_slots: slotWindowTemplateData.total_slots,
      slot_duration: slotWindowTemplateData.slot_duration,
      end_date: slotWindowTemplateData.end_date || null,
      note: slotWindowTemplateData.note || null,
      location: slotWindowTemplateData.location || null,
      // created_date and modified_date will automatically be set in supabase
    };

    const { data: slotWindowTemplate, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to create slot window template: ${error.message}`
      );
    }

    if (!slotWindowTemplate) {
      throw new Error(
        "Failed to create slot window template: no data returned"
      );
    }

    return {
      ...slotWindowTemplate,
      day_of_week: convertNumbersToDays(slotWindowTemplate.day_of_week),
    } as SlotWindowTemplate;
  }

  async updateSlotWindowTemplate(
    slotWindowTemplateId: string,
    slotWindowTemplateData: UpdateSlotWindowTemplateInput
  ): Promise<SlotWindowTemplate | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .update({
        ...slotWindowTemplateData,
        // modified_date will automatically be updated in supabase
        ...(slotWindowTemplateData.day_of_week && {
          day_of_week: convertDaysToNumbers(slotWindowTemplateData.day_of_week),
        }),
      })
      .eq("slot_window_template_id", slotWindowTemplateId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to update slot window template: ${error.message}`
      );
    }

    if (!data) {
      throw new Error("Slot window template not found");
    }

    return {
      ...data,
      day_of_week: convertNumbersToDays(data.day_of_week as number[]),
    };
  }

  async findSlotWindowTemplateById(
    slotWindowTemplateId: string
  ): Promise<SlotWindowTemplate | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .select(SLOT_WINDOW_QUERIES.TEMPLATE_BASE)
      .eq("slot_window_template_id", slotWindowTemplateId)
      .eq("is_deleted", false)
      .single();

    if (error) {
      throw new Error(`Failed to find slot window template: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window template not found");
    }

    return {
      ...data,
      day_of_week: convertNumbersToDays(data.day_of_week as number[]),
    } as SlotWindowTemplate;
  }

  async findActiveSlotWindowTemplatesByUserId(
    userId: string
  ): Promise<SlotWindowTemplate[]> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .select(SLOT_WINDOW_QUERIES.TEMPLATE_BASE)
      .eq("user_id", userId)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("created_date", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((slotWindowTemplate: any) => ({
      ...slotWindowTemplate,
      day_of_week: convertNumbersToDays(slotWindowTemplate.day_of_week),
    })) as SlotWindowTemplate[];
  }

  async findSlotWindowTemplatesForGeneration(): Promise<SlotWindowTemplate[]> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .select(SLOT_WINDOW_QUERIES.TEMPLATE_WITH_USER)
      .eq("is_active", true)
      .eq("is_deleted", false)
      .order("user_id", { ascending: true });

    if (error) {
      console.error("Error fetching templates for generation:", error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((slotWindowTemplate: any) => ({
      ...slotWindowTemplate,
      day_of_week: convertNumbersToDays(slotWindowTemplate.day_of_week),
    })) as SlotWindowTemplate[];
  }

  async deactivateSlotWindowTemplate(
    slotWindowTemplateId: string
  ): Promise<SlotWindowTemplate | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .update({
        is_active: false,
        // modified_date will automatically be set in supabase
      })
      .eq("slot_window_template_id", slotWindowTemplateId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to deactivate slot window template: ${error.message}`
      );
    }

    if (!data) {
      throw new Error("Slot window template not found");
    }

    return {
      ...data,
      day_of_week: convertNumbersToDays(data.day_of_week as number[]),
    } as SlotWindowTemplate;
  }

  async deleteSlotWindowTemplate(
    slotWindowTemplateId: string
  ): Promise<SlotWindowTemplate | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TEMPLATE_TABLE)
      .update({
        deleted_date: new Date().toISOString(),
        // modified_date will automatically be set in supabase
      })
      .eq("slot_window_template_id", slotWindowTemplateId)
      .eq("is_deleted", false)
      .select()
      .single();

    if (error) {
      throw new Error(
        `Failed to delete slot window template: ${error.message}`
      );
    }

    if (!data) {
      throw new Error("Slot window template not found");
    }

    return {
      ...data,
      day_of_week: convertNumbersToDays(data.day_of_week as number[]),
    } as SlotWindowTemplate;
  }

  // ===== SLOT WINDOW METHODS =====

  async createSlotWindow(
    windowData: CreateSlotWindowInput & { task_status_id: string }
  ): Promise<SlotWindow> {
    const data = {
      template_id: windowData.template_id || null, // slot windows that are non-recurring won't have a template_id
      user_id: windowData.user_id,
      start_date: windowData.start_date,
      end_date: windowData.end_date,
      total_slots: windowData.total_slots,
      slots_filled: windowData.slots_filled || 0,
      task_status_id: windowData.task_status_id,
      is_override: windowData.is_override || false,
      note: windowData.note || null,
      location: windowData.location || null,
      // created_date and modified_date will automatically be set in supabase
    };

    const { data: window, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create slot window: ${error.message}`);
    }

    if (!window) {
      throw new Error("Failed to create slot window: no data returned");
    }

    return window as SlotWindow;
  }

  async updateSlotWindow(
    slotWindowId: string,
    windowData: UpdateSlotWindowInput
  ): Promise<SlotWindow | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .update({
        ...windowData,
        // modified_date will automatically be updated in supabase
      })
      .eq("slot_window_id", slotWindowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update slot window: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window not found");
    }

    return data as SlotWindow;
  }

  // find all slot windows for clients
  async findSlotWindowsByUserId(
    query: FindAvailableSlotWindowsQuery
  ): Promise<SlotWindowForClient[]> {
    let dbQuery = this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select(SLOT_WINDOW_QUERIES.SLOT_WINDOW_FOR_CLIENT)
      .gte("start_date", query.start_date)
      .lte("start_date", query.end_date)
      .order("start_date", { ascending: true });

    if (query.user_id) {
      dbQuery = dbQuery.eq("user_id", query.user_id);
    }

    const { data, error } = await dbQuery;

    if (error || !data) {
      return [];
    }

    return data as SlotWindowForClient[];
  }

  async findSlotWindowById(slotWindowId: string): Promise<SlotWindow | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select(SLOT_WINDOW_QUERIES.SLOT_WINDOW_BASE)
      .eq("slot_window_id", slotWindowId)
      .single();

    if (error) {
      throw new Error(`Failed to find slot window: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window not found");
    }

    return data as SlotWindow;
  }

  async findSlotWindowsByTemplateId(templateId: string): Promise<SlotWindow[]> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select(SLOT_WINDOW_QUERIES.SLOT_WINDOW_BASE)
      .eq("template_id", templateId);

    if (error || !data) {
      return [];
    }

    return data as SlotWindow[];
  }

  async findSlotWindowsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<SlotWindow[]> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select(SLOT_WINDOW_QUERIES.SLOT_WINDOW_BASE)
      .eq("user_id", userId)
      .gte("start_date", startDate)
      .lte("end_date", endDate)
      .order("start_date", { ascending: true });

    if (error || !data) {
      return [];
    }

    return data as SlotWindow[];
  }

  async incrementSlotsFilledCounter(
    slotWindowId: string
  ): Promise<SlotWindow | null> {
    const { data, error } = await this.db.rpc(
      SLOT_WINDOW_RPCS.INCREMENT_COUNTER,
      {
        p_slot_window_id: slotWindowId,
      }
    );

    if (error) {
      throw new Error(`Failed to increment slots filled: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window not found");
    }

    return data as SlotWindow;
  }

  async decrementSlotsFilledCounter(
    slotWindowId: string
  ): Promise<SlotWindow | null> {
    const { data, error } = await this.db.rpc(
      SLOT_WINDOW_RPCS.DECREMENT_COUNTER,
      {
        p_slot_window_id: slotWindowId,
      }
    );

    if (error) {
      throw new Error(`Failed to decrement slots filled: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window not found");
    }

    return data as SlotWindow;
  }

  async reserveSlotFromSlotWindow(slotWindowId: string): Promise<number> {
    const { data, error } = await this.db.rpc(SLOT_WINDOW_RPCS.RESERVE_SLOT, {
      p_slot_id: slotWindowId,
    });

    if (error) {
      throw new Error(`Failed to reserve slot: ${error.message}`);
    }

    if (data === null || data === undefined) {
      throw new Error("No available positions in slot window");
    }

    return data as number;
  }

  async releaseSlotToSlotWindow(
    slotWindowId: string,
    position: number
  ): Promise<void> {
    const { error } = await this.db.rpc(SLOT_WINDOW_RPCS.RELEASE_SLOT, {
      p_slot_id: slotWindowId,
      p_position: position,
    });

    if (error) {
      throw new Error(`Failed to release slot: ${error.message}`);
    }
  }

  async updateSlotWindowStatus(
    slotWindowId: string,
    statusId: string
  ): Promise<SlotWindow | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .update({
        task_status_id: statusId,
        modified_date: new Date().toISOString(),
      })
      .eq("slot_window_id", slotWindowId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update slot window status: ${error.message}`);
    }

    if (!data) {
      throw new Error("Slot window not found");
    }

    return data as SlotWindow;
  }

  async hasAvailableSlots(slotWindowId: string): Promise<boolean> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select("slots_filled, total_slots")
      .eq("slot_window_id", slotWindowId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.slots_filled < data.total_slots;
  }

  async getSlotsAvailability(slotWindowId: string): Promise<{
    total: number;
    filled: number;
    available: number;
  } | null> {
    const { data, error } = await this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select("slots_filled, total_slots")
      .eq("slot_window_id", slotWindowId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      total: data.total_slots,
      filled: data.slots_filled,
      available: data.total_slots - data.slots_filled,
    };
  }

  async hasConflictingSlotWindow(
    userId: string,
    startDate: string,
    endDate: string,
    excludeSlotWindowId?: string
  ): Promise<boolean> {
    let query = this.db
      .from(SLOT_WINDOW_QUERIES.SLOT_WINDOW_TABLE)
      .select("slot_window_id", { count: "exact", head: true })
      .eq("user_id", userId)
      .lt("start_date", endDate)
      .gt("end_date", startDate);

    if (excludeSlotWindowId) {
      query = query.neq("slot_window_id", excludeSlotWindowId);
    }

    const { count, error } = await query;

    if (error) {
      return false;
    }

    return (count ?? 0) > 0;
  }
}
