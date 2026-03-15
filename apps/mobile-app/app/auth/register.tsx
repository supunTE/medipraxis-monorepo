import { Color, TextSize, TextVariant } from "@repo/config";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, Link } from "expo-router";
import React from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuthHandler } from "../../services/auth";
import { Controller } from "react-hook-form";
import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "../../components/basic";

export default function RegisterScreen() {
  const { register, isLoading } = useAuthHandler();
  const {
    control,
    formState: { errors },
  } = register.form;
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const success = await register.submit();
      if (success) {
        const { phoneNumber, countryCode } = register.form.getValues();
        Alert.alert(
          "Registration Successful",
          "Your account has been created. Please log in to continue.",
          [
            {
              text: "OK",
              onPress: () =>
                router.replace({
                  pathname: "/auth/login",
                  params: { phoneNumber, countryCode },
                }),
            },
          ]
        );
      }
    } catch (e: any) {
      console.error("Register Error:", e);
      Alert.alert("Registration Failed", e.message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ backgroundColor: Color.White, flex: 1 }}
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
              height: "50%", // Only cover bottom half
            }}
          />

          {/* Storyset Illustration */}
          <View className="items-center">
            <Image
              source={require("../../assets/images/auth/privacy-policy-rafiki.png")}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
              alt="Registration Illustration"
            />
          </View>

          {/* Floating Card Container */}
          <View
            className="bg-white rounded-[24px] p-6 shadow-md mb-6 mt-4"
            style={{
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 10,
              elevation: 5,
            }}
          >
            {/* Logo */}
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
              Welcome
            </TextComponent>
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Grey}
              className="mb-4"
            >
              Enter your details to create an account
            </TextComponent>

            <View className="mb-4">
              <Controller
                control={control}
                name="username"
                render={({ field: { onChange, value } }) => (
                  <TextInputComponent
                    inputField={{
                      placeholder: "Username",
                      value: value,
                      onChangeText: onChange,
                    }}
                    errorText={errors.username?.message}
                  />
                )}
              />
            </View>

            <View className="flex-row items-center mb-4 gap-2">
              <View style={{ flex: 0.3 }}>
                <Controller
                  control={control}
                  name="countryCode"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      inputField={{
                        placeholder: "Code",
                        value: value,
                        onChangeText: onChange,
                      }}
                      errorText={errors.countryCode?.message}
                    />
                  )}
                />
              </View>
              <View style={{ flex: 0.7 }}>
                <Controller
                  control={control}
                  name="phoneNumber"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      inputType={TextInputType.Phone}
                      inputField={{
                        placeholder: "Mobile Number",
                        value: value,
                        onChangeText: onChange,
                      }}
                      errorText={errors.phoneNumber?.message}
                    />
                  )}
                />
              </View>
            </View>

            <View className="mb-4">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, value } }) => (
                  <TextInputComponent
                    inputType={TextInputType.Password}
                    inputField={{
                      placeholder: "Password",
                      value: value,
                      onChangeText: onChange,
                    }}
                    errorText={errors.password?.message}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, value } }) => (
                  <TextInputComponent
                    inputType={TextInputType.Password}
                    inputField={{
                      placeholder: "Confirm Password",
                      value: value,
                      onChangeText: onChange,
                    }}
                    errorText={errors.confirmPassword?.message}
                  />
                )}
              />
            </View>

            <View className="flex-row items-start mb-6 pr-6">
              <Controller
                control={control}
                name="agreed"
                render={({ field: { onChange, value } }) => (
                  <CheckboxComponent
                    value="agree"
                    isChecked={value}
                    onChange={onChange}
                    label="I agree with MediPraxis Public Agreement, Terms & Policy"
                    labelSize={TextSize.Small}
                    labelColor={Color.Grey}
                    className="flex-1"
                    isInvalid={!!errors.agreed}
                  />
                )}
              />
            </View>

            <View className="mb-4">
              <ButtonComponent
                onPress={handleRegister}
                disabled={isLoading}
                buttonColor={Color.Black}
                textColor={Color.White}
                size={ButtonSize.Large}
              >
                <TextComponent
                  variant={TextVariant.Button}
                  size={TextSize.Medium}
                  color={Color.White}
                >
                  {isLoading ? "Wait..." : "Register"}
                </TextComponent>
              </ButtonComponent>
            </View>

            <View className="flex-row justify-start items-center">
              <TextComponent variant={TextVariant.Body} size={TextSize.Small}>
                Already have an account?{" "}
              </TextComponent>
              <Link href={"/auth/login" as any} asChild>
                <TouchableOpacity>
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Green}
                  >
                    LOGIN
                  </TextComponent>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
