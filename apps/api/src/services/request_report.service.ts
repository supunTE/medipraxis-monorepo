import type { RequestReport } from "@repo/models";
import type { RequestReportRepository } from "../repositories";
import type { ClientRepository } from "../repositories/client.repository";
import type { UserRepository } from "../repositories/user.repository";

export class RequestReportService {
  constructor(
    private requestReportRepository: RequestReportRepository,
    private userRepository: UserRepository,
    private clientRepository: ClientRepository
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
}
