import { useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/images/logo.png";

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
  const [otp, setOtp] = useState(["", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (otpSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [otpSent, timer]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsSubmitting(true);
    setError("");

    try {
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
        throw new Error("Failed to resend OTP");
      }

      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", ""]);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate phone number
    if (!phoneNumber.trim()) {
      setError("Phone number is required");
      return;
    }

    if (phoneNumber.length !== 10 || !PHONE_REGEX.test(phoneNumber)) {
      setError("Invalid phone number");
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
          "Phone number is not registered. Please contact your healthcare provider."
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
      setTimer(60);
      setCanResend(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
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

    const otpValue = otp.join("");
    if (!otpValue.trim() || otpValue.length !== 5) {
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
          otp: otpValue,
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
        navigate({ to: "/dashboard" });
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
        {!otpSent && (
          <>
            <img
              src={logo}
              alt="MediPraxis Logo"
              className="h-12 mb-6 mx-auto"
            />
            <h1 className="text-2xl font-semibold mb-2 text-gray-800 font-[family-name:var(--font-secondary)] text-left">
              Welcome to MediPraxis
            </h1>
            <p className="text-gray-600 mb-8 text-sm text-left">
              Please enter your phone number to continue
            </p>
          </>
        )}

        {!otpSent ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="flex gap-3 mb-6">
              {/* Country Code Dropdown with Flag */}
              <div className="w-28 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none select-none bg-[#90C67C] text-white text-xs font-bold px-1.5 py-0.5 rounded">
                  {selectedCountry?.abbr}
                </div>
                <select
                  id="countryCode"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full h-12 pl-12 pr-2 border border-gray-300 rounded focus:border-[#90C67C] focus:outline-none bg-white cursor-pointer text-sm font-medium"
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
                  placeholder="07XXXXXXXX"
                  maxLength={10}
                  className={`w-full h-12 px-3 border rounded text-sm focus:outline-none transition-colors ${
                    error
                      ? "border-[#FF5757] focus:border-[#FF5757]"
                      : "border-gray-300 focus:border-[#90C67C]"
                  }`}
                />
                {error && (
                  <p className="text-[#FF5757] text-xs mt-1 text-left">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded text-white text-base font-semibold transition-all font-[family-name:var(--font-primary)] ${
                isSubmitting
                  ? "bg-[#D3D3D3] cursor-not-allowed"
                  : "bg-[#90C67C] hover:bg-[#7AB568] hover:-translate-y-0.5 hover:shadow-[0_4px_8px_rgba(144,198,124,0.3)] cursor-pointer"
              }`}
            >
              {isSubmitting ? "Sending OTP..." : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <img
              src={logo}
              alt="MediPraxis Logo"
              className="h-12 mb-6 mx-auto"
            />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 text-left">
              Enter 5 digit verification code
            </h2>
            <p className="text-sm text-gray-600 mb-6 text-left">
              We sent an OTP verification code to <br />
              <span className="text-black font-bold">
                {countryCode} {phoneNumber}
              </span>{" "}
              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp(["", "", "", "", ""]);
                  setError("");
                  setTimer(60);
                  setCanResend(false);
                }}
                className="text-[#90C67C] font-bold hover:text-[#7AB568] transition-colors"
                title="Edit phone number"
              >
                Change?
              </button>
            </p>

            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-12 h-14 text-center text-xl font-semibold border-2 rounded-lg focus:outline-none transition-colors ${
                    error
                      ? "border-[#FF5757] focus:border-[#FF5757]"
                      : "border-gray-300 focus:border-[#90C67C]"
                  }`}
                />
              ))}
            </div>

            {error && (
              <p className="text-[#FF5757] text-xs mb-4 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded text-white text-base font-semibold mb-4 transition-all font-[family-name:var(--font-primary)] ${
                isSubmitting
                  ? "bg-[#D3D3D3] cursor-not-allowed"
                  : "bg-[#90C67C] hover:bg-[#7AB568] cursor-pointer"
              }`}
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>

            <div className="text-sm text-gray-600 text-left">
              You didn't receive any code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={!canResend}
                className={`font-bold transition-colors ${
                  canResend
                    ? "text-[#90C67C] cursor-pointer hover:text-[#7AB568]"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {canResend ? "Resend code" : `Resend code (${timer}s)`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
