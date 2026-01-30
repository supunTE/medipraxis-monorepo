import { DynamicForm } from "@/components/forms";
import { colors } from "@/constants";
import { useRequestReport, useUploadReports } from "@/services";
import type { FormResponse, FormValues } from "@/types";
import { FormFieldType } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

interface ReportField {
  id: string;
  active: boolean;
  sequence: number;
  help_text: string;
  field_type: string;
  description: string;
  display_label: string;
}

interface UploadReportProps {
  requestReportId: string;
}

export function UploadReport({ requestReportId }: UploadReportProps) {
  const [formData, setFormData] = useState<FormResponse | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const navigate = useNavigate();

  // Fetch request report details
  const {
    data: requestReport,
    isLoading: loading,
    error: fetchError,
  } = useRequestReport(requestReportId);

  // Upload reports mutation
  const {
    mutate: uploadReports,
    isPending: uploading,
    error: uploadError,
  } = useUploadReports({
    onSuccess: () => {
      setShowSuccessPopup(true);
      setTimeout(() => {
        navigate({ to: "/dashboard" });
      }, 2000);
    },
  });

  const error =
    (fetchError as Error)?.message || (uploadError as Error)?.message || "";

  // Transform request report data into form data
  if (requestReport && !formData) {
    const activeFields = requestReport.requested_reports
      .filter((field: ReportField) => field.active)
      .sort((a: ReportField, b: ReportField) => a.sequence - b.sequence);

    const transformedFormData: FormResponse = {
      title: "Upload Reports",
      description: "Please upload the requested documents",
      questions: activeFields.map((field: ReportField) => ({
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
  }

  const handleSubmit = async (values: FormValues) => {
    if (!requestReport || uploading) return;

    // Calculate expiry date based on expiration_days from values
    const expirationDays = values.expiration_days || 7;
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(expirationDays));

    // Prepare files array
    const files: Array<{ file: File; title: string }> = [];
    Object.entries(values).forEach(([fieldId, file]) => {
      if (file instanceof File) {
        const field = requestReport.requested_reports.find(
          (f: ReportField) => f.id === fieldId
        );
        const title = field?.display_label || "Report";
        files.push({ file, title });
      }
    });

    uploadReports({
      client_id: requestReport.client_id || "",
      user_id: requestReport.user_id || "",
      request_report_id: requestReportId,
      expiry_date: expiryDate.toISOString(),
      files,
    });
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

      {/* Success Popup */}
      {showSuccessPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "32px",
              borderRadius: "12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              textAlign: "center",
              maxWidth: "400px",
              width: "90%",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                backgroundColor: "#90C67C",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 6L9 17L4 12"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Success!
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#6b7280",
                margin: 0,
              }}
            >
              Your reports have been uploaded successfully.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
