import { zodResolver } from "@hookform/resolvers/zod";
import { Color, TextSize, TextVariant } from "@repo/config";
import {
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
  type ForgotPasswordFormData,
  type ResetPasswordFormData,
} from "@repo/models";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ButtonComponent,
  ButtonSize,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "../../components/basic";
import { authService } from "../../services/auth";

const OTP_LENGTH = 5;
const OTP_RESEND_SECONDS = 60;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    phoneNumber?: string;
    countryCode?: string;
  }>();
  const [otpDigits, setOtpDigits] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [otpError, setOtpError] = useState<string | undefined>();
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const requestForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      phoneNumber: params.phoneNumber || "",
      countryCode: params.countryCode || "+94",
    },
  });

  const resetForm = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const updateOtpDigits = (index: number, value: string) => {
    const nextDigits = [...otpDigits];
    nextDigits[index] = value.slice(-1);
    setOtpDigits(nextDigits);
    setOtpError(undefined);
    resetForm.setValue("otp", nextDigits.join(""), {
      shouldValidate: false,
      shouldDirty: true,
    });
  };

  const sendOtp = async (data: ForgotPasswordFormData) => {
    try {
      setIsRequestingOtp(true);
      await authService.requestPasswordReset(
        data.phoneNumber,
        data.countryCode
      );
      setOtpSent(true);
      setCountdown(OTP_RESEND_SECONDS);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setOtpError(undefined);
      resetForm.reset({
        otp: "",
        newPassword: "",
        confirmPassword: "",
      });
      Alert.alert(
        "OTP Sent",
        "We sent a password reset OTP to your mobile number."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send OTP";
      Alert.alert("Unable to Send OTP", message);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleSendOtp = async () => {
    await requestForm.handleSubmit(sendOtp)();
  };

  const handleResetPassword = async () => {
    const otp = otpDigits.join("");

    if (otp.length !== OTP_LENGTH) {
      setOtpError("Please enter the 5-digit OTP");
      return;
    }

    resetForm.setValue("otp", otp, {
      shouldValidate: true,
      shouldDirty: true,
    });

    await resetForm.handleSubmit(async (data) => {
      try {
        setIsResettingPassword(true);
        const phoneNumber = requestForm.getValues("phoneNumber");
        const countryCode = requestForm.getValues("countryCode");

        await authService.resetPassword(
          phoneNumber,
          countryCode,
          otp,
          data.newPassword,
          data.confirmPassword
        );

        await authService.logout();

        Alert.alert(
          "Password Reset",
          "Your password was updated successfully.",
          [
            {
              text: "Back to Login",
              onPress: () =>
                router.replace({
                  pathname: "/auth/login",
                  params: { phoneNumber, countryCode },
                }),
            },
          ]
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to reset password";

        if (message.toLowerCase().includes("otp")) {
          setOtpError(message);
          return;
        }

        if (message.toLowerCase().includes("match")) {
          resetForm.setError("confirmPassword", { message });
          return;
        }

        if (message.toLowerCase().includes("password")) {
          resetForm.setError("newPassword", { message });
          return;
        }

        Alert.alert("Unable to Reset Password", message);
      } finally {
        setIsResettingPassword(false);
      }
    })();
  };

  const resendDisabled = countdown > 0 || isRequestingOtp;
  const {
    control: requestControl,
    formState: { errors: requestErrors },
  } = requestForm;
  const {
    control: resetControl,
    formState: { errors: resetErrors },
  } = resetForm;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Color.White }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-1"
          style={{
            padding: 20,
            justifyContent: "flex-end",
            position: "relative",
          }}
        >
          <LinearGradient
            colors={[Color.White, "#B6F6D2"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "55%",
            }}
          />

          <View className="mb-4">
            <View className="items-center">
              <Image
                source={require("../../assets/images/auth/privacy-policy-rafiki.png")}
                style={{ width: 260, height: 260 }}
                resizeMode="contain"
                alt="Reset Password Illustration"
              />
            </View>

            <View
              className="bg-white rounded-[24px] p-6 shadow-md"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <View className="items-center">
                <Image
                  source={require("../../assets/images/brand-logo-with-name.png")}
                  style={{ width: 100, height: 100 }}
                  resizeMode="contain"
                  alt="MediPraxis Logo"
                />
              </View>

              <TextComponent
                variant={TextVariant.Title}
                size={TextSize.Large}
                className="mb-1"
              >
                Reset Password
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.Grey}
                className="mb-6"
              >
                Enter your mobile number, verify the OTP, and choose a new
                password.
              </TextComponent>

              <View className="mb-4">
                <View className="flex-row items-center gap-2">
                  <View style={{ flex: 0.3 }}>
                    <Controller
                      control={requestControl}
                      name="countryCode"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          inputWrapper={{
                            isInvalid: !!(
                              requestErrors.phoneNumber ||
                              requestErrors.countryCode
                            ),
                          }}
                          inputField={{
                            placeholder: "Code",
                            value,
                            onChangeText: onChange,
                            editable: !otpSent,
                          }}
                        />
                      )}
                    />
                  </View>
                  <View style={{ flex: 0.7 }}>
                    <Controller
                      control={requestControl}
                      name="phoneNumber"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          inputType={TextInputType.Phone}
                          inputWrapper={{
                            isInvalid: !!(
                              requestErrors.phoneNumber ||
                              requestErrors.countryCode
                            ),
                          }}
                          inputField={{
                            placeholder: "Mobile Number",
                            value,
                            onChangeText: onChange,
                            editable: !otpSent,
                          }}
                        />
                      )}
                    />
                  </View>
                </View>
                {(requestErrors.phoneNumber || requestErrors.countryCode) && (
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Danger}
                    className="mt-1 ml-1"
                  >
                    {requestErrors.phoneNumber?.message ||
                      requestErrors.countryCode?.message}
                  </TextComponent>
                )}
              </View>

              {!otpSent ? (
                <ButtonComponent
                  onPress={handleSendOtp}
                  disabled={isRequestingOtp}
                  buttonColor={Color.Black}
                  textColor={Color.White}
                  size={ButtonSize.Large}
                >
                  <TextComponent
                    variant={TextVariant.Button}
                    size={TextSize.Medium}
                    color={Color.White}
                  >
                    {isRequestingOtp ? "Sending OTP..." : "Send OTP"}
                  </TextComponent>
                </ButtonComponent>
              ) : (
                <>
                  <View className="mb-4">
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Small}
                      color={Color.Grey}
                      className="mb-3"
                    >
                      Enter the 5-digit OTP sent to{" "}
                      {requestForm.getValues("countryCode")}
                      {requestForm.getValues("phoneNumber")}
                    </TextComponent>
                    <View className="flex-row justify-between">
                      {otpDigits.map((digit, index) => (
                        <TextInputComponent.OTPField
                          key={index}
                          inputWrapper={{ isInvalid: !!otpError }}
                          inputField={{
                            value: digit,
                            onChangeText: (value) =>
                              updateOtpDigits(index, value),
                          }}
                        />
                      ))}
                    </View>
                    {otpError && (
                      <TextComponent
                        variant={TextVariant.Body}
                        size={TextSize.Small}
                        color={Color.Danger}
                        className="mt-2"
                      >
                        {otpError}
                      </TextComponent>
                    )}
                  </View>

                  <View className="mb-4">
                    <Controller
                      control={resetControl}
                      name="newPassword"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          inputType={TextInputType.Password}
                          inputField={{
                            placeholder: "New Password",
                            value,
                            onChangeText: onChange,
                          }}
                          errorText={resetErrors.newPassword?.message}
                        />
                      )}
                    />
                  </View>

                  <View className="mb-4">
                    <Controller
                      control={resetControl}
                      name="confirmPassword"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          inputType={TextInputType.Password}
                          inputField={{
                            placeholder: "Confirm New Password",
                            value,
                            onChangeText: onChange,
                          }}
                          errorText={resetErrors.confirmPassword?.message}
                        />
                      )}
                    />
                  </View>

                  <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                      disabled={resendDisabled}
                      onPress={handleSendOtp}
                    >
                      <TextComponent
                        variant={TextVariant.Body}
                        size={TextSize.Small}
                        color={resendDisabled ? Color.Grey : Color.Green}
                      >
                        {resendDisabled
                          ? `Resend OTP in ${countdown}s`
                          : "Resend OTP"}
                      </TextComponent>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setOtpSent(false);
                        setCountdown(0);
                        setOtpDigits(Array(OTP_LENGTH).fill(""));
                        setOtpError(undefined);
                      }}
                    >
                      <TextComponent
                        variant={TextVariant.Body}
                        size={TextSize.Small}
                        color={Color.Green}
                      >
                        Change Number
                      </TextComponent>
                    </TouchableOpacity>
                  </View>

                  <ButtonComponent
                    onPress={handleResetPassword}
                    disabled={isResettingPassword}
                    buttonColor={Color.Black}
                    textColor={Color.White}
                    size={ButtonSize.Large}
                  >
                    <TextComponent
                      variant={TextVariant.Button}
                      size={TextSize.Medium}
                      color={Color.White}
                    >
                      {isResettingPassword
                        ? "Updating Password..."
                        : "Reset Password"}
                    </TextComponent>
                  </ButtonComponent>
                </>
              )}

              <View className="flex-row justify-center mt-6">
                <TextComponent variant={TextVariant.Body} size={TextSize.Small}>
                  Remembered your password?{" "}
                </TextComponent>
                <TouchableOpacity
                  onPress={() =>
                    router.replace({
                      pathname: "/auth/login",
                      params: {
                        phoneNumber: requestForm.getValues("phoneNumber"),
                        countryCode: requestForm.getValues("countryCode"),
                      },
                    })
                  }
                >
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Green}
                  >
                    BACK TO LOGIN
                  </TextComponent>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
