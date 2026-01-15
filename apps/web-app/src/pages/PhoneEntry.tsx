import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;
const API_BASE_URL = "http://localhost:8787/api"; 

export function PhoneEntry() {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState("+94");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (!PHONE_REGEX.test(phoneNumber)) {
      setError("Invalid phone number format");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if client exists
      const checkResponse = await fetch(
        `${API_BASE_URL}/clients/check-phone?country_code=${encodeURIComponent(countryCode)}&contact_number=${encodeURIComponent(phoneNumber)}`
      );

      if (!checkResponse.ok) {
        throw new Error("Failed to check phone number");
      }

      const checkData = await checkResponse.json();

      if (!checkData.exists) {
        setError(
          "Phone number not registered. Please contact your healthcare provider."
        );
        return;
      }

      // Send OTP
      const otpResponse = await fetch(`${API_BASE_URL}/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country_code: countryCode,
          contact_number: phoneNumber,
        }),
      });

      if (!otpResponse.ok) {
        throw new Error("Failed to send OTP");
      }

      const otpData = await otpResponse.json();

      sessionStorage.setItem("client_phone_number", phoneNumber);
      sessionStorage.setItem("client_country_code", countryCode);
      sessionStorage.setItem("contact_id", otpData.contact_id);

      setOtpSent(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || otp.length !== 5) {
      setError("Please enter the 5-digit OTP");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          country_code: countryCode,
          contact_number: phoneNumber,
          otp: otp,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Invalid OTP");
      }

      const verifyData = await response.json();

      const contactId =
        verifyData.contact_id || sessionStorage.getItem("contact_id");
      if (contactId) {
        navigate({ to: `/${contactId}` });
      } else {
        throw new Error("Contact ID not found");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          maxWidth: "400px",
          width: "100%",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#333",
          }}
        >
          Welcome to MediPraxis
        </h1>
        <p
          style={{
            color: "#666",
            marginBottom: "32px",
            fontSize: "14px",
          }}
        >
          {otpSent
            ? "Enter the OTP sent to your phone"
            : "Please enter your phone number to continue"}
        </p>

        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                htmlFor="countryCode"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Country Code
              </label>
              <select
                id="countryCode"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <option value="+1">+1 (US/Canada)</option>
                <option value="+44">+44 (UK)</option>
                <option value="+91">+91 (India)</option>
                <option value="+94">+94 (Sri Lanka)</option>
                <option value="+61">+61 (Australia)</option>
              </select>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="phoneNumber"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                style={{
                  width: "100%",
                  padding: "12px",
                  border: error ? "1px solid #ef4444" : "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = error ? "#ef4444" : "#3b82f6";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "#ef4444" : "#ddd";
                }}
              />
              {error && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isSubmitting ? "#93c5fd" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {isSubmitting ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div style={{ marginBottom: "24px" }}>
              <label
                htmlFor="otp"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#333",
                }}
              >
                OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 5-digit OTP"
                maxLength={5}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: error ? "1px solid #ef4444" : "1px solid #ddd",
                  borderRadius: "4px",
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "8px",
                  fontSize: "20px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = error ? "#ef4444" : "#3b82f6";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error ? "#ef4444" : "#ddd";
                }}
              />
              {error && (
                <p
                  style={{
                    color: "#ef4444",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: isSubmitting ? "#93c5fd" : "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                marginBottom: "12px",
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#2563eb";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#3b82f6";
                }
              }}
            >
              {isSubmitting ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError("");
              }}
              style={{
                width: "100%",
                padding: "12px",
                backgroundColor: "transparent",
                color: "#3b82f6",
                border: "1px solid #3b82f6",
                borderRadius: "4px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Back to Phone Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
