import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const PHONE_REGEX = /^[\d\s\+\-\(\)]+$/;
const API_BASE_URL = "http://localhost:8787/api";

const countryOptions = [
  { code: "+1", abbr: "US", name: "United States" },
  { code: "+44", abbr: "GB", name: "United Kingdom" },
  { code: "+91", abbr: "IN", name: "India" },
  { code: "+94", abbr: "LK", name: "Sri Lanka" },
  { code: "+61", abbr: "AU", name: "Australia" },
];

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

    if (phoneNumber.length !== 10) {
      setError("Phone number must be exactly 10 digits");
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

  const selectedCountry =
    countryOptions.find((c) => c.code === countryCode) ?? countryOptions[3];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-5">
      <div className="bg-white p-10 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-2 text-gray-800 font-[family-name:var(--font-secondary)]">
          Welcome to MediPraxis
        </h1>
        <p className="text-gray-600 mb-8 text-sm">
          {otpSent
            ? "Enter the OTP sent to your phone"
            : "Please enter your phone number to continue"}
        </p>

        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="flex gap-3 mb-6">
              {/* Country Code Dropdown with Flag */}
              <div className="w-28 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none select-none bg-[#44B619] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {selectedCountry?.abbr}
                </div>
                <select
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-12 pl-12 pr-2 border border-gray-300 rounded focus:border-[#44B619] focus:outline-none bg-white cursor-pointer text-sm font-medium"
                >
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phone Number Input */}
              <div className="flex-1">
                <input
                  type="tel"
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setPhoneNumber(value);
                    }
                  }}
                  placeholder="Enter phone number"
                  maxLength={10}
                  className={`w-full h-12 px-3 border rounded text-sm focus:outline-none transition-colors ${
                    error
                      ? "border-[#FF5757] focus:border-[#FF5757]"
                      : "border-gray-300 focus:border-[#44B619]"
                  }`}
                />
              </div>
            </div>

            {error && (
              <p className="text-[#FF5757] text-xs -mt-2 mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded text-white text-base font-semibold transition-all font-[family-name:var(--font-primary)] ${
                isSubmitting
                  ? "bg-[#D3D3D3] cursor-not-allowed"
                  : "bg-[#44B619] hover:bg-[#44B619] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(68,182,25,0.3)] cursor-pointer"
              }`}
            >
              {isSubmitting ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-6">
              <label
                htmlFor="otp"
                className="block mb-2 text-sm font-medium text-gray-800"
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
                className={`w-full p-3 border rounded text-center tracking-[0.5em] text-xl focus:outline-none transition-colors ${
                  error
                    ? "border-[#FF5757] focus:border-[#FF5757]"
                    : "border-gray-300 focus:border-[#44B619]"
                }`}
              />
              {error && <p className="text-[#FF5757] text-xs mt-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded text-white text-base font-medium mb-3 transition-colors font-[family-name:var(--font-primary)] ${
                isSubmitting
                  ? "bg-[#D3D3D3] cursor-not-allowed"
                  : "bg-[#44B619] hover:bg-[#3a9915] cursor-pointer"
              }`}
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
              className="w-full py-3 bg-transparent text-[#44B619] border border-[#44B619] rounded text-sm font-medium cursor-pointer hover:bg-[#44B619] hover:text-white transition-colors"
            >
              Back to Phone Entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
