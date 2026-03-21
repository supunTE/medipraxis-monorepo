import type {
  ShareableCalendarLink,
  ShareableCalendarLinkWithSlotWindows,
  SlotWindowForClient,
} from "@repo/models";
import { TaskStatus, TaskType } from "@repo/models";
import type {
  ClientRepository,
  ShareableCalendarLinkRepository,
  SlotWindowRepository,
  TaskRepository,
  UserRepository,
} from "../repositories";
import type { SmsService } from "./sms.service";

export class ShareableCalendarLinkService {
  private shareableCalendarLinkRepository: ShareableCalendarLinkRepository;
  private slotWindowRepository: SlotWindowRepository;
  private taskRepository: TaskRepository;
  private userRepository: UserRepository;
  private clientRepository: ClientRepository;
  private smsService: SmsService;
  private webAppUrl: string;

  constructor(
    shareableCalendarLinkRepository: ShareableCalendarLinkRepository,
    slotWindowRepository: SlotWindowRepository,
    taskRepository: TaskRepository,
    userRepository: UserRepository,
    clientRepository: ClientRepository,
    smsService: SmsService,
    webAppUrl: string
  ) {
    this.shareableCalendarLinkRepository = shareableCalendarLinkRepository;
    this.slotWindowRepository = slotWindowRepository;
    this.taskRepository = taskRepository;
    this.userRepository = userRepository;
    this.clientRepository = clientRepository;
    this.smsService = smsService;
    this.webAppUrl = webAppUrl;
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
    const clientReservedAppointments: Record<string, string> = {};
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

          // Extract unique slot window IDs and create mapping to task IDs
          appointments.forEach((apt) => {
            if (apt.slot_window_id) {
              clientReservedSlotWindowIds.push(apt.slot_window_id);
              clientReservedAppointments[apt.slot_window_id] = apt.task_id;
            }
          });

          // Remove duplicates from slot window IDs
          clientReservedSlotWindowIds = [
            ...new Set(clientReservedSlotWindowIds),
          ];
        }
      }
    }

    return {
      ...link,
      slotWindows: slotWindowsForClient,
      clientReservedSlotWindowIds,
      clientReservedAppointments,
    };
  }

  async getShareableCalendarLinkByUserId(
    userId: string
  ): Promise<ShareableCalendarLink | null> {
    const link =
      await this.shareableCalendarLinkRepository.findByUserId(userId);
    return link;
  }

  async createOrUpdateShareableCalendarLink(data: {
    user_id: string;
    client_id: string;
    visible_days_ahead: number;
    expiry_date?: string;
    notification_type: {
      whatsapp: boolean;
      text: boolean;
      email: boolean;
    };
  }): Promise<ShareableCalendarLink> {
    // Create or update the shareable calendar link
    const link = await this.shareableCalendarLinkRepository.createOrUpdate({
      user_id: data.user_id,
      visible_days_ahead: data.visible_days_ahead,
      expiry_date: data.expiry_date,
    });

    // Send notifications based on notification_type
    if (data.notification_type.text) {
      await this.sendSmsNotification(
        data.user_id,
        data.client_id,
        link.link_id
      );
    }

    return link;
  }

  async sendSmsNotification(
    user_id: string,
    client_id: string,
    link_id: string
  ) {
    try {
      const client = await this.clientRepository.findById(client_id);
      if (!client) {
        console.error("Client not found for SMS notification");
        return;
      }

      const contact = await this.clientRepository.findContactInfoById(
        client.contact_id
      );
      if (!contact) {
        console.error("Contact not found for SMS notification");
        return;
      }

      const user = await this.userRepository.findUserById(user_id);
      if (!user) {
        console.error("User not found for SMS notification");
        return;
      }

      const clientName = [client.first_name ?? "", client.last_name ?? ""]
        .filter(Boolean)
        .join(" ")
        .trim();

      const userName = [user.title, user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      const phoneNumber = `${contact.country_code}${contact.contact_number}`;
      const link = `${this.webAppUrl}/schedules/${link_id}`;

      const message = `${userName} shared their calendar with ${clientName}. \n\nTo view available appointment slots, visit the link below: \n${link}`;

      const result = await this.smsService.sendSms(phoneNumber, message);

      if (!result.success) {
        console.error("Failed to send SMS:", result.error);
      }
    } catch (error) {
      console.error("Error sending SMS notification:", error);
    }
  }
}
