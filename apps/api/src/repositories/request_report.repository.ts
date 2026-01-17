import type { RequestReport } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const REQUEST_REPORT_QUERIES = {
  REQUEST_REPORT_TABLE: "request_report",
  REQUEST_REPORT_ID: "request_report_id",
  CREATED_DATE: "created_date",
  USER_ID: "user_id",
  CLIENT_ID: "client_id",
  FORM_ID: "form_id",
  REQUESTED_REPORTS: "requested_reports",
  EXPIRED: "expired",
  DELETED: "deleted",
} as const;

export class RequestReportRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findPendingByClientIds(clientIds: string[]): Promise<RequestReport[]> {
    const { data, error } = await this.db
      .from(REQUEST_REPORT_QUERIES.REQUEST_REPORT_TABLE)
      .select("*")
      .in(REQUEST_REPORT_QUERIES.CLIENT_ID, clientIds)
      .eq(REQUEST_REPORT_QUERIES.EXPIRED, false)
      .eq(REQUEST_REPORT_QUERIES.DELETED, false);

    if (error) {
      throw new Error(`Failed to fetch pending reports: ${error.message}`);
    }

    return (data || []) as RequestReport[];
  }

  async findById(requestReportId: string): Promise<RequestReport | null> {
    const { data, error } = await this.db
      .from(REQUEST_REPORT_QUERIES.REQUEST_REPORT_TABLE)
      .select("*")
      .eq(REQUEST_REPORT_QUERIES.REQUEST_REPORT_ID, requestReportId)
      .eq(REQUEST_REPORT_QUERIES.EXPIRED, false)
      .eq(REQUEST_REPORT_QUERIES.DELETED, false)
      .single();

    if (error) {
      throw new Error(`Failed to fetch request report: ${error.message}`);
    }

    return data as RequestReport;
  }
}
