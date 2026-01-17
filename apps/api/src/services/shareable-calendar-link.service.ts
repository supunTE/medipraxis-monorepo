import type {
  ShareableCalendarLinkWithSlotWindows,
  SlotWindowForClient,
} from "@repo/models";
import { TaskStatus, TaskType } from "@repo/models";
import type {
  ShareableCalendarLinkRepository,
  SlotWindowRepository,
  TaskRepository,
} from "../repositories";

export class ShareableCalendarLinkService {
  private shareableCalendarLinkRepository: ShareableCalendarLinkRepository;
  private slotWindowRepository: SlotWindowRepository;
  private taskRepository: TaskRepository;

  constructor(
    shareableCalendarLinkRepository: ShareableCalendarLinkRepository,
    slotWindowRepository: SlotWindowRepository,
    taskRepository: TaskRepository
  ) {
    this.shareableCalendarLinkRepository = shareableCalendarLinkRepository;
    this.slotWindowRepository = slotWindowRepository;
    this.taskRepository = taskRepository;
  }

  async getShareableCalendarLinkWithSlotWindows(
    linkId: string,
    clientId: string
  ): Promise<ShareableCalendarLinkWithSlotWindows> {
    const link =
      await this.shareableCalendarLinkRepository.findByIdWithUser(linkId);

    if (!link) {
      throw new Error("Shareable calendar link not found, expired, or deleted");
    }

    // Calculate date range based on visible_days_ahead
    const today = new Date();
    const startDate = today.toISOString();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + link.visible_days_ahead);
    const endDateStr = endDate.toISOString();

    // Fetch slot windows for this user in the date range
    const slotWindows =
      await this.slotWindowRepository.findSlotWindowsByDateRange(
        link.user_id,
        startDate,
        endDateStr
      );

    // Map to SlotWindowForClient by removing internal fields
    const slotWindowsForClient: SlotWindowForClient[] = slotWindows.map(
      (sw) => ({
        slot_window_id: sw.slot_window_id,
        template_id: sw.template_id,
        user_id: sw.user_id,
        start_date: sw.start_date,
        end_date: sw.end_date,
        total_slots: sw.total_slots,
        slots_filled: sw.slots_filled,
        task_status_id: sw.task_status_id,
        note: sw.note,
        location: sw.location,
      })
    );

    // Get slot windows where client has appointments
    let clientReservedSlotWindowIds: string[] = [];
    const slotWindowIds = slotWindows.map((sw) => sw.slot_window_id);

    if (slotWindowIds.length > 0) {
      // Get appointment type ID
      const appointmentTypeId = await this.taskRepository.getTaskTypeByName(
        TaskType.APPOINTMENT
      );

      if (appointmentTypeId) {
        // Get cancelled status ID to exclude
        const cancelledStatusId = await this.taskRepository.getTaskStatusByName(
          TaskStatus.CANCELLED
        );

        if (cancelledStatusId) {
          // Fetch client's appointments for these slot windows
          const appointments = await this.taskRepository.findByClientId(
            clientId,
            {
              userId: link.user_id,
              taskTypeId: appointmentTypeId,
              excludeStatusId: cancelledStatusId,
              slotWindowIds: slotWindowIds,
            }
          );

          // Extract unique slot window IDs from appointments
          clientReservedSlotWindowIds = [
            ...new Set(
              appointments
                .map((apt) => apt.slot_window_id)
                .filter((id): id is string => id !== null && id !== undefined)
            ),
          ];
        }
      }
    }

    return {
      ...link,
      slotWindows: slotWindowsForClient,
      clientReservedSlotWindowIds,
    };
  }
}
