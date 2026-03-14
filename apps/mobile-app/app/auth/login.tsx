import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, Link } from "expo-router";
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
import {
  ButtonComponent,
  ButtonSize,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "../../components/basic";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "../../components/ui/checkbox";
import { useAuthHandler } from "../../services/auth";
import { Controller } from "react-hook-form";

export default function LoginScreen() {
  const params = useLocalSearchParams<{
    phoneNumber?: string;
    countryCode?: string;
  }>();

  const { login, isLoading } = useAuthHandler({
    phoneNumber: params.phoneNumber,
    countryCode: params.countryCode,
  });
  const {
    control,
    formState: { errors },
  } = login.form;

  const handleLogin = async () => {
    try {
      await login.submit();
    } catch (e: any) {
      console.error("Login Error:", e);
      Alert.alert("Login Failed", e.message);
    }
  };

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
            justifyContent: "flex-end", // Align container content to the bottom
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

          <View className="mb-4">
            <View className="items-center">
              <Image
                source={require("../../assets/images/auth/privacy-policy-rafiki.png")}
                style={{ width: 300, height: 300 }}
                resizeMode="contain"
                alt="Privacy Policy Illustration"
              />
            </View>

            {/* Floating Card Container */}
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
                className="mb-6"
              >
                Enter your details to log in
              </TextComponent>

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

              <View className="flex-row justify-between items-center mb-6">
                <Controller
                  control={control}
                  name="rememberMe"
                  render={({ field: { onChange, value } }) => (
                    <Checkbox
                      size="md"
                      value="remember"
                      isChecked={value}
                      onChange={onChange}
                      aria-label="Remember Me"
                    >
                      <CheckboxIndicator className="mr-2">
                        <CheckboxIcon as={Icons.Check} />
                      </CheckboxIndicator>
                      <CheckboxLabel>
                        <TextComponent
                          variant={TextVariant.Body}
                          size={TextSize.Small}
                          color={Color.Grey}
                        >
                          Remember Me
                        </TextComponent>
                      </CheckboxLabel>
                    </Checkbox>
                  )}
                />

                <TouchableOpacity>
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Green}
                  >
                    Forgot Password?
                  </TextComponent>
                </TouchableOpacity>
              </View>

              <ButtonComponent
                onPress={handleLogin}
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
                  {isLoading ? "Logging in..." : "Login"}
                </TextComponent>
              </ButtonComponent>

              <View className="flex-row justify-center mt-6">
                <TextComponent variant={TextVariant.Body} size={TextSize.Small}>
                  Don't have an account?{" "}
                </TextComponent>
                <Link href={"/auth/register" as any} asChild>
                  <TouchableOpacity>
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Small}
                      color={Color.Green}
                    >
                      REGISTER
                    </TextComponent>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
