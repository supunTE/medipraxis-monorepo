import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:8787/api";

interface PendingReport {
  request_report_id: string;
  created_date: string;
  client_id: string;
  client_name: string;
  user_id: string | null;
  user_name: string | null;
  requested_reports: any;
  form_id: string | null;
}

interface ContactDashboardProps {
  contactId: string;
}

export function ContactDashboard({ contactId }: ContactDashboardProps) {
  const [pendingReports, setPendingReports] = useState<PendingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingReports();
  }, [contactId]);

  const fetchPendingReports = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/client-reports/pending/${contactId}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch pending reports");
      }

      const data = await response.json();
      setPendingReports(data.pending_reports || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load pending reports"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUploadReport = (report: PendingReport) => {
    navigate({
      to: "/upload-report/$requestReportId",
      params: {
        requestReportId: report.request_report_id,
      },
    });
  };

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
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#333",
          }}
        >
          Dashboard
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#666",
            marginBottom: "32px",
          }}
        >
          Welcome back, your dashboard is ready with your latest appointments,
          and updates.
        </p>

        {/* Pending Actions Section */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "24px",
              fontWeight: "600",
              marginBottom: "24px",
              color: "#333",
            }}
          >
            Pending Actions
          </h2>

          {loading && (
            <p style={{ color: "#666", textAlign: "center", padding: "20px" }}>
              Loading pending reports...
            </p>
          )}

          {error && (
            <p
              style={{
                color: "#dc2626",
                textAlign: "center",
                padding: "20px",
              }}
            >
              {error}
            </p>
          )}

          {!loading && !error && pendingReports.length === 0 && (
            <p
              style={{
                color: "#666",
                textAlign: "center",
                padding: "20px",
              }}
            >
              No pending actions at this time.
            </p>
          )}

          {!loading && !error && pendingReports.length > 0 && (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {pendingReports.map((report) => (
                <div
                  key={report.request_report_id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p
                      style={{
                        fontSize: "16px",
                        color: "#333",
                        margin: 0,
                      }}
                    >
                      <strong>{report.user_name || "A user"}</strong> has
                      requested reports from{" "}
                      <strong>{report.client_name}</strong>
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        margin: "4px 0 0 0",
                      }}
                    >
                      Requested on{" "}
                      {new Date(report.created_date)
                        .toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                        .replace(/^(\d+)/, (match) => {
                          const day = parseInt(match);
                          const suffix =
                            day === 1 || day === 21 || day === 31
                              ? "st"
                              : day === 2 || day === 22
                                ? "nd"
                                : day === 3 || day === 23
                                  ? "rd"
                                  : "th";
                          return day + suffix;
                        })}{" "}
                      at{" "}
                      {new Date(report.created_date)
                        .toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toLowerCase()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUploadReport(report)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#90C67C",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      marginLeft: "16px",
                    }}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#7AB568")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "#90C67C")
                    }
                  >
                    Upload Reports
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
