import type {
  CreateSlotWindowInput,
  CreateSlotWindowTemplateInput,
  DayOfWeek,
  SlotWindow,
  SlotWindowTemplate,
  UpdateSlotWindowTemplateInput,
} from "@repo/models";
import { TaskStatus } from "@repo/models";
import type { SlotWindowRepository, TaskRepository } from "../repositories";

export class SlotWindowService {
  private slotWindowRepository: SlotWindowRepository;
  private taskRepository: TaskRepository;

  constructor(
    slotWindowRepository: SlotWindowRepository,
    taskRepository: TaskRepository
  ) {
    this.slotWindowRepository = slotWindowRepository;
    this.taskRepository = taskRepository;
  }

  // Helper: Calculate slot duration in seconds from time range and slot count
  private calculateSlotDuration(
    startTime: string,
    endTime: string,
    totalSlots: number
  ): number {
    // Parse times (format: "HH:MM:SS")
    const startParts = startTime.split(":").map(Number);
    const endParts = endTime.split(":").map(Number);

    if (
      startParts.length !== 3 ||
      endParts.length !== 3 ||
      startParts.some((v) => isNaN(v)) ||
      endParts.some((v) => isNaN(v))
    ) {
      throw new Error("Invalid time format. Expected HH:MM:SS");
    }

    const [startHours, startMinutes, startSeconds] = startParts;
    const [endHours, endMinutes, endSeconds] = endParts;

    // Convert to total seconds
    const startTotalSeconds =
      startHours! * 3600 + startMinutes! * 60 + startSeconds!;
    const endTotalSeconds = endHours! * 3600 + endMinutes! * 60 + endSeconds!;

    // Calculate total duration in seconds
    const totalDuration = endTotalSeconds - startTotalSeconds;

    if (totalDuration <= 0) {
      throw new Error("End time must be after start time");
    }

    // Calculate slot duration (divide total duration by number of slots)
    const slotDuration = Math.floor(totalDuration / totalSlots);

    if (slotDuration <= 0) {
      throw new Error(
        "Invalid slot duration. Check start time, end time, and total slots."
      );
    }

    return slotDuration;
  }

  private getMatchingDates(
    startDate: Date,
    endDate: Date,
    daysOfWeek: DayOfWeek[],
    templateEndDate?: string | null
  ): string[] {
    const dates: string[] = [];
    const dayMapping: Record<DayOfWeek, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    const targetDays = daysOfWeek.map((d) => dayMapping[d]);
    const current = new Date(startDate);

    while (current <= endDate) {
      if (targetDays.includes(current.getDay())) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        const dateStr = `${year}-${month}-${day}`;

        if (templateEndDate && dateStr > templateEndDate) {
          break;
        }

        dates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  // Create a recurring appointment template with conflict checking
  async createAppointmentSlotWindowTemplate(
    input: CreateSlotWindowTemplateInput
  ): Promise<SlotWindowTemplate> {
    const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.NOT_STARTED
    );

    if (!notStartedStatusId) {
      throw new Error(
        'Default task status "NOT_STARTED" not found in database'
      );
    }

    // Calculate slot_duration from start_time, end_time, and total_slots
    const slotDuration = this.calculateSlotDuration(
      input.start_time,
      input.end_time,
      input.total_slots
    );

    const existingTemplates =
      await this.slotWindowRepository.findActiveSlotWindowTemplatesByUserId(
        input.user_id
      );

    for (const existing of existingTemplates) {
      const dayOverlap = input.day_of_week.some((day) =>
        existing.day_of_week.includes(day)
      );

      if (dayOverlap) {
        const timeConflict =
          input.start_time < existing.end_time &&
          input.end_time > existing.start_time;

        if (timeConflict) {
          const conflictDays = input.day_of_week.filter((day) =>
            existing.day_of_week.includes(day)
          );
          throw new Error(
            `Template conflicts with existing template on ${conflictDays.join(", ")} ` +
              `from ${existing.start_time} to ${existing.end_time}`
          );
        }
      }
    }

    return await this.slotWindowRepository.createSlotWindowTemplate({
      ...input,
      slot_duration: slotDuration,
    });
  }

  // Generate slot windows for the upcoming week from all active templates from all users (cron job)
  async createAppointmentSlotWindowForGlobalActiveTemplates(): Promise<{
    created: number;
    skipped: number;
    errors: string[];
  }> {
    const result = { created: 0, skipped: 0, errors: [] as string[] };

    const templates =
      await this.slotWindowRepository.findSlotWindowTemplatesForGeneration();

    console.log(
      `Found ${templates.length} active templates for slot window generation.`
    );

    if (templates.length === 0) {
      return result;
    }

    const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.NOT_STARTED
    );

    if (!notStartedStatusId) {
      result.errors.push('Default task status "NOT_STARTED" not found');
      return result;
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7); // Upcoming week only

    for (const template of templates) {
      try {
        const existingWindows =
          await this.slotWindowRepository.findSlotWindowsByTemplateId(
            template.slot_window_template_id
          );

        const matchingDates = this.getMatchingDates(
          today,
          endDate,
          template.day_of_week,
          template.end_date
        );

        for (const date of matchingDates) {
          const startDateTime = `${date}T${template.start_time}`;
          const endDateTime = `${date}T${template.end_time}`;

          const alreadyExists = existingWindows.some((w) => {
            const existingDate = w.start_date.split("T")[0];
            return existingDate === date;
          });

          if (alreadyExists) {
            result.skipped++;
            continue;
          }

          const hasConflict =
            await this.slotWindowRepository.hasConflictingSlotWindow(
              template.user_id,
              startDateTime,
              endDateTime
            );

          if (hasConflict) {
            result.skipped++;
            continue;
          }

          await this.slotWindowRepository.createSlotWindow({
            template_id: template.slot_window_template_id,
            user_id: template.user_id,
            start_date: startDateTime,
            end_date: endDateTime,
            total_slots: template.total_slots,
            slots_filled: 0,
            task_status_id: notStartedStatusId,
            note: template.note || undefined,
            location: template.location || undefined,
          });

          result.created++;
        }
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        result.errors.push(
          `Template ${template.slot_window_template_id}: ${msg}`
        );
      }
    }

    return result;
  }

  // Generate slot windows for the upcoming week from a specific template
  async createAppointmentSlotWindowForSpecificTemplate(
    templateId: string
  ): Promise<{
    created: number;
    skipped: number;
    errors: string[];
  }> {
    const result = { created: 0, skipped: 0, errors: [] as string[] };

    // Verify template exists and is active
    const template =
      await this.slotWindowRepository.findSlotWindowTemplateById(templateId);

    if (!template) {
      result.errors.push("Template not found");
      return result;
    }

    if (!template.is_active) {
      result.errors.push("Template is not active");
      return result;
    }

    const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.NOT_STARTED
    );

    if (!notStartedStatusId) {
      result.errors.push('Default task status "NOT_STARTED" not found');
      return result;
    }

    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7); // Upcoming week only

    try {
      // Get existing slot windows for this template to avoid duplicates
      const existingWindows =
        await this.slotWindowRepository.findSlotWindowsByTemplateId(templateId);

      const matchingDates = this.getMatchingDates(
        today,
        endDate,
        template.day_of_week,
        template.end_date
      );

      for (const date of matchingDates) {
        const startDateTime = `${date}T${template.start_time}`;
        const endDateTime = `${date}T${template.end_time}`;

        // Check if window already exists for this date
        const alreadyExists = existingWindows.some((w) => {
          const existingDate = w.start_date.split("T")[0];
          return existingDate === date;
        });

        if (alreadyExists) {
          result.skipped++;
          continue;
        }

        // Check for conflicts with other slot windows
        const hasConflict =
          await this.slotWindowRepository.hasConflictingSlotWindow(
            template.user_id,
            startDateTime,
            endDateTime
          );

        if (hasConflict) {
          result.skipped++;
          continue;
        }

        // Create slot window
        await this.slotWindowRepository.createSlotWindow({
          template_id: templateId,
          user_id: template.user_id,
          start_date: startDateTime,
          end_date: endDateTime,
          total_slots: template.total_slots,
          slots_filled: 0,
          task_status_id: notStartedStatusId,
          note: template.note || undefined,
          location: template.location || undefined,
        });

        result.created++;
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      result.errors.push(`Failed to generate slot windows: ${msg}`);
    }

    return result;
  }

  // Create a one-off slot window (not recurring, no template)
  async createAppointmentSlotWindow(
    input: CreateSlotWindowInput
  ): Promise<SlotWindow> {
    if (input.template_id) {
      throw new Error(
        "Cannot specify template_id for one-off slot windows. " +
          "Use createAppointmentSlotWindowForSpecificTemplate for template-based windows."
      );
    }

    const notStartedStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.NOT_STARTED
    );

    if (!notStartedStatusId) {
      throw new Error(
        'Default task status "NOT_STARTED" not found in database'
      );
    }

    const existingTemplates =
      await this.slotWindowRepository.findActiveSlotWindowTemplatesByUserId(
        input.user_id
      );

    const startDate = new Date(input.start_date);
    const dayOfWeek = [
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ][startDate.getDay()] as DayOfWeek;

    const startTimeParts = input.start_date.split("T");
    const endTimeParts = input.end_date.split("T");

    if (
      startTimeParts.length < 2 ||
      endTimeParts.length < 2 ||
      !startTimeParts[1] ||
      !endTimeParts[1]
    ) {
      throw new Error(
        "Invalid datetime format. Expected ISO 8601 format (YYYY-MM-DDTHH:MM:SS)"
      );
    }

    const startTime = startTimeParts[1].substring(0, 8);
    const endTime = endTimeParts[1].substring(0, 8);

    for (const template of existingTemplates) {
      if (template.day_of_week.includes(dayOfWeek)) {
        const timeConflict =
          startTime < template.end_time && endTime > template.start_time;

        if (timeConflict) {
          throw new Error(
            `Slot window conflicts with existing template on ${dayOfWeek} ` +
              `from ${template.start_time} to ${template.end_time}`
          );
        }
      }
    }

    const hasSlotWindowConflict =
      await this.slotWindowRepository.hasConflictingSlotWindow(
        input.user_id,
        input.start_date,
        input.end_date
      );

    if (hasSlotWindowConflict) {
      throw new Error(
        "Slot window conflicts with existing slot window at this time"
      );
    }

    return await this.slotWindowRepository.createSlotWindow({
      ...input,
      template_id: undefined,
      task_status_id: notStartedStatusId,
    });
  }

  // Update a template (only affects the template, not existing slot windows)
  async updateAppointmentSlotWindowTemplate(
    templateId: string,
    input: UpdateSlotWindowTemplateInput
  ): Promise<SlotWindowTemplate> {
    const existing =
      await this.slotWindowRepository.findSlotWindowTemplateById(templateId);

    if (!existing) {
      throw new Error("Slot window template not found");
    }

    if (input.day_of_week || input.start_time || input.end_time) {
      const checkDays = input.day_of_week || existing.day_of_week;
      const checkStartTime = input.start_time || existing.start_time;
      const checkEndTime = input.end_time || existing.end_time;

      const allTemplates =
        await this.slotWindowRepository.findActiveSlotWindowTemplatesByUserId(
          existing.user_id
        );

      const otherTemplates = allTemplates.filter(
        (t) => t.slot_window_template_id !== templateId
      );

      for (const other of otherTemplates) {
        const dayOverlap = checkDays.some((day) =>
          other.day_of_week.includes(day)
        );

        if (dayOverlap) {
          const timeConflict =
            checkStartTime < other.end_time && checkEndTime > other.start_time;

          if (timeConflict) {
            const conflictDays = checkDays.filter((day) =>
              other.day_of_week.includes(day)
            );
            throw new Error(
              `Updated template would conflict with existing template on ` +
                `${conflictDays.join(", ")} from ${other.start_time} to ${other.end_time}`
            );
          }
        }
      }
    }

    const updated = await this.slotWindowRepository.updateSlotWindowTemplate(
      templateId,
      input
    );

    if (!updated) {
      throw new Error("Failed to update slot window template");
    }

    return updated;
  }

  // Cancel a slot window and all associated appointments
  async cancelAppointmentSlotWindow(slotWindowId: string): Promise<{
    slotWindow: SlotWindow;
    cancelledTasks: number;
  }> {
    const slotWindow =
      await this.slotWindowRepository.findSlotWindowById(slotWindowId);

    if (!slotWindow) {
      throw new Error("Slot window not found");
    }

    const cancelledStatusId = await this.taskRepository.getTaskStatusByName(
      TaskStatus.CANCELLED
    );

    if (!cancelledStatusId) {
      throw new Error('Task status "CANCELLED" not found in database');
    }

    const tasks = await this.taskRepository.findBySlotWindowId(slotWindowId);

    let cancelledCount = 0;
    const errors: string[] = [];

    for (const task of tasks) {
      try {
        await this.taskRepository.update(task.task_id, {
          task_status_id: cancelledStatusId,
        });
        cancelledCount++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : "Unknown error";
        errors.push(`Failed to cancel task ${task.task_id}: ${msg}`);
      }
    }

    if (errors.length > 0) {
      console.error("Errors during task cancellation:", errors);
    }

    const updatedWindow =
      await this.slotWindowRepository.updateSlotWindowStatus(
        slotWindowId,
        cancelledStatusId
      );

    if (!updatedWindow) {
      throw new Error("Failed to update slot window status");
    }

    return {
      slotWindow: updatedWindow,
      cancelledTasks: cancelledCount,
    };
  }

  // Soft delete a template (does not remove existing slot windows)
  async deleteAppointmentSlotWindowTemplate(
    templateId: string
  ): Promise<SlotWindowTemplate> {
    const deleted =
      await this.slotWindowRepository.deleteSlotWindowTemplate(templateId);

    if (!deleted) {
      throw new Error("Slot window template not found");
    }

    return deleted;
  }

  // Deactivate a template (does not remove existing slot windows)
  async deactivateAppointmentSlotWindowTemplate(
    templateId: string
  ): Promise<SlotWindowTemplate> {
    const deactivated =
      await this.slotWindowRepository.deactivateSlotWindowTemplate(templateId);

    if (!deactivated) {
      throw new Error("Slot window template not found");
    }

    return deactivated;
  }

  // Get slot window by ID
  async getSlotWindowById(slotWindowId: string): Promise<SlotWindow> {
    const slotWindow =
      await this.slotWindowRepository.findSlotWindowById(slotWindowId);

    if (!slotWindow) {
      throw new Error("Slot window not found");
    }

    return slotWindow;
  }

  async getAllSlotWindowsByUserId(userId: string): Promise<SlotWindow[]> {
    return await this.slotWindowRepository.findAllSlotWindowsByUserId(userId);
  }

  async getAllSlotWindowTemplatesByUserId(
    userId: string
  ): Promise<SlotWindowTemplate[]> {
    return await this.slotWindowRepository.findSlotWindowTemplatesByUserId(
      userId
    );
  }

  // Reserve a slot from a slot window (used when creating an appointment)
  async reserveSlotFromSlotWindow(slotWindowId: string): Promise<number> {
    const slotWindow =
      await this.slotWindowRepository.findSlotWindowById(slotWindowId);

    if (!slotWindow) {
      throw new Error("Slot window not found");
    }

    // Reserve the slot and get the position (RPC handles availability check)
    const position =
      await this.slotWindowRepository.reserveSlotFromSlotWindow(slotWindowId);

    return position;
  }

  // Release a slot back to a slot window (used when canceling an appointment)
  async releaseSlotToSlotWindow(
    slotWindowId: string,
    position: number
  ): Promise<void> {
    const slotWindow =
      await this.slotWindowRepository.findSlotWindowById(slotWindowId);

    if (!slotWindow) {
      throw new Error("Slot window not found");
    }

    await this.slotWindowRepository.releaseSlotToSlotWindow(
      slotWindowId,
      position
    );
  }
}
