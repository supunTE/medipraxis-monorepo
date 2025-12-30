import React, { useState } from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { View } from "@/components/Themed";
import {
  ButtonComponent,
  ButtonSize,
  DropdownComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import { z } from "zod";

export default function TabTwoScreen() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");

  // Country options
  const countryOptions = [
    { label: "United States", value: "us" },
    { label: "United Kingdom", value: "uk" },
    { label: "Canada", value: "ca" },
    { label: "Australia", value: "au" },
    { label: "Germany", value: "de" },
    { label: "France", value: "fr" },
    { label: "Japan", value: "jp" },
    { label: "India", value: "in" },
  ];

  // Validation Schemas
  const [otp, setOtp] = useState("");

  const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");
  const usernameSchema = z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    );
  const requiredSchema = z.string().min(1, "This field is required");
  const otpSchema = z
    .string()
    .length(1, "Must be a single digit")
    .regex(/^[0-9]$/, "Must be a number");

  return (
    <View style={styles.container}>
      <View>
        <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
          Welcome to Tab Two!
        </TextComponent>
      </View>
      <View style={styles.separator} />
      <View>
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your username",
          }}
          inputField={{
            value: username,
            onChangeText: setUsername,
            placeholder: "Enter username",
          }}
          label="Username"
          inputType={TextInputType.Text}
          validationSchema={usernameSchema}
          helperText="Username must be 3-20 characters"
          validateOnChange={true}
        />
        <View>
          <DropdownComponent
            value={country}
            onValueChange={setCountry}
            options={countryOptions}
            label="Country"
            placeholder="Select a country"
            validationSchema={requiredSchema}
            helperText="Please select your country"
            showValidation={true}
          />
        </View>
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your password",
          }}
          inputField={{
            value: password,
            onChangeText: setPassword,
            placeholder: "Enter password",
          }}
          label="Password"
          inputType={TextInputType.Password}
          validationSchema={passwordSchema}
          helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
          validateOnChange={true}
        />
        <TextInputComponent.OTPField
          inputWrapper={{
            accessibilityHint: "Enter OTP digit",
          }}
          inputField={{
            value: otp,
            onChangeText: setOtp,
          }}
          label="Enter OTP"
          size={60}
          validationSchema={otpSchema}
        />
      </View>

      <View style={styles.buttonContainer}>
        {/* Small button */}
        <View style={styles.centeredButton}>
          <ButtonComponent
            size={ButtonSize.Small}
            leftIcon={Icons.Heart}
            rightIcon={Icons.Star}
            buttonColor={Color.Green}
            textColor={Color.White}
            iconColor={Color.LightCream}
          >
            Favorite
          </ButtonComponent>
        </View>

        {/* Medium button */}
        <View style={styles.centeredButton}>
          <ButtonComponent
            size={ButtonSize.Medium}
            leftIcon={Icons.Plus}
            rightIcon={Icons.ArrowRight}
          >
            Add Item
          </ButtonComponent>
        </View>

        {/* Large button */}
        <ButtonComponent
          size={ButtonSize.Large}
          leftIcon={Icons.Check}
          rightIcon={Icons.ShoppingCart}
          buttonColor={Color.LightGreen}
          textColor={Color.DarkGreen}
          iconColor={Color.Green}
        >
          Complete Purchase
        </ButtonComponent>

        {/* Back button */}
        <View style={styles.centeredButton}>
          <ButtonComponent.BackButton size={ButtonSize.Medium}>
            Back
          </ButtonComponent.BackButton>
        </View>
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    paddingHorizontal: 16,
  },
  centeredButton: {
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
