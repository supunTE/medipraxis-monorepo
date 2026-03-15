import type { ClientReport } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";
import { REQUEST_REPORT_QUERIES } from "./request_report.repository";

export const CLIENT_REPORT_QUERIES = {
  // Table name
  CLIENT_REPORT_TABLE: "client_report",

  // Storage bucket
  STORAGE_BUCKET: "reports",

  // Field names
  REPORT_ID: "report_id",
  REPORT_TITLE: "report_title",
  FILE_PATH: "file_path",
  FILE_TYPE: "file_type",
  CLIENT_ID: "client_id",
  USER_ID: "user_id",
  CREATED_DATE: "created_date",
  REQUEST_REPORT_ID: "request_report_id",

  // Select queries
  FIND_ALL: "*",
  FIND_BY_ID: "*",
} as const;

export class ClientReportRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  /**
   * Upload file to Supabase storage
   */
  async uploadFile(
    file: File,
    userId: string,
    clientId: string
  ): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${userId}/${clientId}/${fileName}`;

    const { error } = await this.db.storage
      .from(CLIENT_REPORT_QUERIES.STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return filePath;
  }

  /**
   * Create a new client report record
   */
  async create(
    input: {
      report_title: string;
      client_id: string;
      user_id: string;
      request_report_id?: string;
      expiry_date?: string;
    },
    filePath: string
  ): Promise<ClientReport> {
    const insertData: any = {
      [CLIENT_REPORT_QUERIES.REPORT_TITLE]: input.report_title,
      [CLIENT_REPORT_QUERIES.FILE_PATH]: filePath,
      [CLIENT_REPORT_QUERIES.CLIENT_ID]: input.client_id,
      [CLIENT_REPORT_QUERIES.USER_ID]: input.user_id,
      [CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID]: input.request_report_id,
    };

    if (input.expiry_date) {
      insertData["expiry_date"] = input.expiry_date;
    }

    const { data, error } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .insert(insertData)
      .select(CLIENT_REPORT_QUERIES.FIND_BY_ID)
      .single();

    if (error) {
      throw new Error(`Failed to create client report: ${error.message}`);
    }

    return data as ClientReport;
  }

  /**
   * Find all client reports (optionally filter by user_id or client_id)
   */
  async findAll(userId?: string, clientId?: string): Promise<ClientReport[]> {
    let query = this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .select(CLIENT_REPORT_QUERIES.FIND_ALL);

    if (userId) {
      query = query.eq(CLIENT_REPORT_QUERIES.USER_ID, userId);
    }

    if (clientId) {
      query = query.eq(CLIENT_REPORT_QUERIES.CLIENT_ID, clientId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch client reports: ${error.message}`);
    }

    return (data as ClientReport[]) || [];
  }

  /**
   * Find a single client report by ID
   */
  async findById(reportId: string): Promise<ClientReport | null> {
    const { data, error } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .select(CLIENT_REPORT_QUERIES.FIND_BY_ID)
      .eq(CLIENT_REPORT_QUERIES.REPORT_ID, reportId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ClientReport;
  }

  /**
   * Find client reports by client ID
   */
  async findByClientId(clientId: string): Promise<ClientReport[]> {
    const { data, error } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .select(CLIENT_REPORT_QUERIES.FIND_ALL)
      .eq(CLIENT_REPORT_QUERIES.CLIENT_ID, clientId);

    if (error) {
      throw new Error(`Failed to fetch client reports: ${error.message}`);
    }

    return (data as ClientReport[]) || [];
  }

  /**
   * Delete a client report (also removes file from storage)
   */
  async delete(reportId: string): Promise<boolean> {
    // Get the file path
    const report = await this.findById(reportId);

    if (!report) {
      return false;
    }

    // Delete from database
    const { error: dbError } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .delete()
      .eq(CLIENT_REPORT_QUERIES.REPORT_ID, reportId);

    if (dbError) {
      throw new Error(`Failed to delete client report: ${dbError.message}`);
    }

    // Delete from storage if file exists
    if (report.file_path) {
      const { error: storageError } = await this.db.storage
        .from(CLIENT_REPORT_QUERIES.STORAGE_BUCKET)
        .remove([report.file_path]);

      if (storageError) {
        console.error(
          `Failed to delete file from storage: ${storageError.message}`
        );
      }
    }

    return true;
  }

  /**
   * Get signed URL for file download
   */
  async getFileUrl(filePath: string, expiresIn: number = 300): Promise<string> {
    const { data, error } = await this.db.storage
      .from(CLIENT_REPORT_QUERIES.STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data) {
      throw new Error(`Failed to generate file URL: ${error?.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Check if reports exist for given request_report_ids
   */
  async findByRequestReportIds(
    requestReportIds: string[]
  ): Promise<Set<string>> {
    const { data, error } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .select(CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID)
      .in(CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID, requestReportIds)
      .eq("deleted", false);

    if (error) {
      throw new Error(`Failed to check uploaded reports: ${error.message}`);
    }

    // Return a Set of request_report_ids that have been uploaded
    return new Set(
      (data || [])
        .map((row) => row.request_report_id)
        .filter((id): id is string => id !== null)
    );
  }

  /**
   * Find completed reports by user ID, grouped by client ID and date
   * Filters out expired reports (expiry_date <= today)
   */
  async findCompletedReportsGroupedByUserIdAndDate(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await this.db
      .from(CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE)
      .select(
        `
        ${CLIENT_REPORT_QUERIES.REPORT_ID},
        ${CLIENT_REPORT_QUERIES.REPORT_TITLE},
        ${CLIENT_REPORT_QUERIES.FILE_PATH},
        ${CLIENT_REPORT_QUERIES.FILE_TYPE},
        ${CLIENT_REPORT_QUERIES.CLIENT_ID},
        ${CLIENT_REPORT_QUERIES.CREATED_DATE},
        ${CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID},
        client:client_id!inner (
          client_id,
          first_name,
          last_name
        )
      `
      )
      .eq(CLIENT_REPORT_QUERIES.USER_ID, userId)
      .gt("expiry_date", today)
      .order(CLIENT_REPORT_QUERIES.CREATED_DATE, { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch grouped reports: ${error.message}`);
    }

    return data || [];
  }

  async findPendingReportsByUserId(userId: string) {
    const { data, error } = await this.db
      .from(REQUEST_REPORT_QUERIES.REQUEST_REPORT_TABLE)
      .select(
        `
        ${REQUEST_REPORT_QUERIES.REQUEST_REPORT_ID},
        ${REQUEST_REPORT_QUERIES.CREATED_DATE},
        ${REQUEST_REPORT_QUERIES.CLIENT_ID},
        ${REQUEST_REPORT_QUERIES.REQUESTED_REPORTS},
        client:${REQUEST_REPORT_QUERIES.CLIENT_ID}!inner (
          client_id,
          first_name,
          last_name
        ),
        ${CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE}!left (
          ${CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID}
        )
      `
      )
      .eq(REQUEST_REPORT_QUERIES.USER_ID, userId)
      .eq(REQUEST_REPORT_QUERIES.DELETED, false)
      .eq(REQUEST_REPORT_QUERIES.EXPIRED, false)
      .is(
        `${CLIENT_REPORT_QUERIES.CLIENT_REPORT_TABLE}.${CLIENT_REPORT_QUERIES.REQUEST_REPORT_ID}`,
        null
      )
      .order(REQUEST_REPORT_QUERIES.CREATED_DATE, { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch pending reports: ${error.message}`);
    }

    return data || [];
  }
}
