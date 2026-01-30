import type { RequestReport } from "@repo/models";
import type {
  ClientRepository,
  RequestReportRepository,
  ShareableUserLinkRepository,
  UserRepository,
} from "../repositories";
import type { SmsService } from "./sms.service";

export class RequestReportService {
  constructor(
    private requestReportRepository: RequestReportRepository,
    private userRepository: UserRepository,
    private clientRepository: ClientRepository,
    private shareableUserLinkRepository: ShareableUserLinkRepository,
    private smsService: SmsService,
    private webAppUrl: string
  ) {}

  async getRequestReportById(
    requestReportId: string
  ): Promise<
    (RequestReport & { user_name?: string; client_name?: string }) | null
  > {
    const requestReport =
      await this.requestReportRepository.findById(requestReportId);

    if (!requestReport) {
      return null;
    }

    let userName: string | undefined;
    let clientName: string | undefined;

    if (requestReport.user_id) {
      try {
        const user = await this.userRepository.findUserById(
          requestReport.user_id
        );
        if (user) {
          const title = user.title || "";
          const firstName = user.first_name || "";
          const lastName = user.last_name || "";
          userName =
            [title, firstName, lastName].filter(Boolean).join(" ").trim() ||
            undefined;
        }
      } catch (error) {
        console.error(`Failed to fetch user ${requestReport.user_id}:`, error);
      }
    }

    if (requestReport.client_id) {
      try {
        const client = await this.clientRepository.findById(
          requestReport.client_id
        );
        if (client) {
          const firstName = client.first_name || "";
          const lastName = client.last_name || "";
          clientName =
            [firstName, lastName].filter(Boolean).join(" ").trim() || undefined;
        }
      } catch (error) {
        console.error(
          `Failed to fetch client ${requestReport.client_id}:`,
          error
        );
      }
    }

    return {
      ...requestReport,
      user_name: userName,
      client_name: clientName,
    };
  }

  async createRequestReport(data: {
    user_id: string;
    client_id: string;
    form_id?: string;
    requested_reports?: any;
    note?: string;
    notification_type?: {
      whatsapp?: boolean;
      text?: boolean;
      email?: boolean;
    };
  }): Promise<RequestReport> {
    // Check if user has a shareable link
    let shareableLink = await this.shareableUserLinkRepository.findByUserId(
      data.user_id
    );

    // If not, create one
    if (!shareableLink) {
      shareableLink = await this.shareableUserLinkRepository.create(
        data.user_id
      );
    }

    // Filter out inactive reports from requested_reports
    let filteredRequestedReports = data.requested_reports;
    if (
      Array.isArray(data.requested_reports) &&
      data.requested_reports.length > 0
    ) {
      filteredRequestedReports = data.requested_reports.filter(
        (report: any) => report.active !== false
      );
    }

    // Create the request report
    const requestReport = await this.requestReportRepository.create({
      ...data,
      requested_reports: filteredRequestedReports,
    });

    // Send SMS notification if requested
    if (data.notification_type?.text) {
      await this.sendSmsNotification(
        data.user_id,
        data.client_id,
        shareableLink.shareable_user_link_id
      );
    }

    return requestReport;
  }

  async sendSmsNotification(
    user_id: string,
    client_id: string,
    shareable_user_link_id: string
  ) {
    try {
      const client = await this.clientRepository.findById(client_id);
      if (!client) {
        console.error("Client not found for SMS notification");
      }

      const contact = await this.clientRepository.findContactInfoById(
        client!.contact_id
      );
      if (!contact) {
        console.error("Contact not found for SMS notification");
      }

      const user = await this.userRepository.findUserById(user_id);
      if (!user) {
        console.error("User not found for SMS notification");
      }

      const clientName = [client!.first_name ?? "", client!.last_name ?? ""]
        .filter(Boolean)
        .join(" ")
        .trim();

      const userName = [user.title, user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

      const phoneNumber = `${contact!.country_code}${contact!.contact_number}`;
      const link = `${this.webAppUrl}/${shareable_user_link_id}`;

      const message = `${userName} requested reports from ${clientName}. \n\nTo complete the request, visit the link below: \n${link}`;

      const result = await this.smsService.sendSms(phoneNumber, message);

      if (!result.success) {
        console.error("Failed to send SMS:", result.error);
      }
    } catch (error) {
      console.error("Error sending SMS notification:", error);
    }
  }
}
