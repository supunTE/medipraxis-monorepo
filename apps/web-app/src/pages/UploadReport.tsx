import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { DynamicForm } from "../components/forms/DynamicForm";
import type { FormResponse, FormValues } from "../types/form.types";
import { FormFieldType } from "../types/form.types";

const API_BASE_URL = "http://localhost:8787/api";

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
  user_id: string;
  client_id: string;
  form_id: string;
  requested_reports: ReportField[];
  expired: boolean;
  deleted: boolean;
}

interface UploadReportProps {
  contactId: string;
  requestReportId: string;
}

export function UploadReport({
  contactId,
  requestReportId,
}: UploadReportProps) {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportDetails();
  }, [requestReportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/request-reports/${requestReportId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch report details");
      }

      const data: RequestReportResponse = await response.json();

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

      const formData = new FormData();
      formData.append("request_report_id", requestReportId);

      // Add files to form data
      Object.entries(values).forEach(([fieldId, file]) => {
        if (file instanceof File) {
          formData.append(`files`, file);
          formData.append(`field_ids`, fieldId);
        }
      });

      const response = await fetch(`${API_BASE_URL}/client-reports`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload reports");
      }

      // Navigate back to dashboard after successful upload
      navigate({
        to: "/$contactId",
        params: { contactId },
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
                to: "/$contactId",
                params: { contactId },
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
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {error && (
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "#fee2e2",
              border: "1px solid #fecaca",
              borderRadius: "6px",
              marginBottom: "24px",
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
