import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DynamicForm } from "../components/forms/DynamicForm";
import { colors } from "../constants/colors";
import { apiClient } from "../lib/api-client";
import type { FormResponse, FormValues } from "../types/form.types";
import { FormFieldType } from "../types/form.types";

interface ReportField {
  id: string;
  active: boolean;
  sequence: number;
  help_text: string;
  field_type: string;
  description: string;
  display_label: string;
}

interface RequestReportResponse {
  request_report_id: string;
  created_date: string;
  user_id: string | null;
  client_id: string | null;
  form_id: string | null;
  requested_reports: ReportField[];
  expired: boolean | null;
  deleted: boolean | null;
  user_name?: string;
  client_name?: string;
}

interface UploadReportProps {
  requestReportId: string;
}

export function UploadReport({ requestReportId }: UploadReportProps) {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [, setUploading] = useState(false);
  const [requestReport, setRequestReport] =
    useState<RequestReportResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportDetails();
  }, [requestReportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await apiClient.api["request-reports"][":id"].$get({
        param: { id: requestReportId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch report details");
      }

      const data: RequestReportResponse = await response.json();
      setRequestReport(data);

      // Filter active fields and sort by sequence
      const activeFields = data.requested_reports
        .filter((field) => field.active)
        .sort((a, b) => a.sequence - b.sequence);

      // Transform API response to FormResponse format
      const transformedFormData: FormResponse = {
        title: "Upload Reports",
        description: "Please upload the requested documents",
        questions: activeFields.map((field) => ({
          id: field.id,
          type: FormFieldType.FILE_UPLOAD,
          question: field.display_label,
          helpText: field.help_text,
          compulsory: true,
          sequence: field.sequence,
          notes: field.description,
          fileConfig: {
            allowedTypes: ["pdf", "jpg", "png"],
            maxSizeMB: 5,
          },
        })),
      };

      setFormData(transformedFormData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load report details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      setUploading(true);
      setError("");

      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append("client_id", requestReport?.client_id || "");
      formDataToSend.append("user_id", requestReport?.user_id || "");
      formDataToSend.append("request_report_id", requestReportId);

      // Calculate expiry date based on expiration_days from values
      const expirationDays = values.expiration_days || 7;
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + Number(expirationDays));
      formDataToSend.append("expiry_date", expiryDate.toISOString());

      // Add files and titles with indexed names (file0, title0, file1, title1, etc.)
      let fileIndex = 0;
      Object.entries(values).forEach(([fieldId, file]) => {
        if (file instanceof File) {
          const field = requestReport?.requested_reports.find(
            (f) => f.id === fieldId
          );
          const title = field?.display_label || "Report";

          formDataToSend.append(`file${fileIndex}`, file);
          formDataToSend.append(`title${fileIndex}`, title);
          fileIndex++;
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/client-reports`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          (errorData as { error?: string }).error || "Failed to upload reports"
        );
      }

      // Navigate back to dashboard after successful upload
      navigate({
        to: "/dashboard",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload reports");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p style={{ color: "#666", fontSize: "18px" }}>Loading...</p>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "40px 20px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{ color: "#dc2626", fontSize: "18px", marginBottom: "16px" }}
          >
            {error}
          </p>
          <button
            onClick={() =>
              navigate({
                to: "/dashboard",
              })
            }
            style={{
              padding: "10px 20px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!formData) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px 20px 40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Header Section */}
        <div style={{ marginBottom: "32px", padding: "0 1rem" }}>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "700",
              color: "#1f2937",
              margin: "0 0 16px 0",
            }}
          >
            Upload Reports
          </h1>

          {requestReport?.user_name && (
            <div style={{ marginBottom: "12px" }}>
              <span
                style={{
                  fontSize: "16px",
                  color: "#4b5563",
                  marginRight: "8px",
                }}
              >
                requested by
              </span>
              <span
                style={{
                  display: "inline-block",
                  backgroundColor: colors.mp.green,
                  color: colors.typography.black,
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {requestReport.user_name}
              </span>
            </div>
          )}

          {requestReport?.client_name && (
            <p style={{ fontSize: "16px", color: "#4b5563", margin: "0" }}>
              For:{" "}
              <span style={{ fontWeight: "600", color: "#1f2937" }}>
                {requestReport.client_name}
              </span>
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              marginBottom: "24px",
              margin: "0 1rem 24px 1rem",
            }}
          >
            <p style={{ color: "#dc2626", fontSize: "14px", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        <DynamicForm formData={formData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
