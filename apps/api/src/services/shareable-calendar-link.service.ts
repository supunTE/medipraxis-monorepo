import type {
  ShareableCalendarLinkWithUser,
  ShareableCalendarLinkWithSlotWindows,
  SlotWindowForClient,
} from "@repo/models";
import type {
  ShareableCalendarLinkRepository,
  SlotWindowRepository,
} from "../repositories";

export class ShareableCalendarLinkService {
  private shareableCalendarLinkRepository: ShareableCalendarLinkRepository;
  private slotWindowRepository: SlotWindowRepository;

  constructor(
    shareableCalendarLinkRepository: ShareableCalendarLinkRepository,
    slotWindowRepository: SlotWindowRepository
  ) {
    this.shareableCalendarLinkRepository = shareableCalendarLinkRepository;
    this.slotWindowRepository = slotWindowRepository;
  }

  async getShareableCalendarLinkWithSlotWindows(
    linkId: string
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

    return {
      ...link,
      slotWindows: slotWindowsForClient,
    };
  }
}
