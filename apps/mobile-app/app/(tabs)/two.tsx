import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { View } from "@/components/Themed";
import {
  ButtonComponent,
  ButtonSize,
  ChipComponent,
  ChipVariant,
  DropdownComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
  ToggleButton,
  ToggleSize,
} from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";

export default function TabTwoScreen() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  const [otp, setOtp] = useState("");

  // Error states
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    country?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
  }>({});

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

  // Validation functions
  const validateUsername = (value: string): string | undefined => {
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username must not exceed 20 characters";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return "Username can only contain letters, numbers, and underscores";
    }
    return undefined;
  };

  const validatePassword = (value: string): string | undefined => {
    if (value.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(value)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(value)) {
      return "Password must contain at least one number";
    }
    return undefined;
  };

  const validatePhoneNumber = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Phone number is required";
    }
    const cleaned = value.replace(/[\s-]/g, "");
    const phonePattern = /^\+[1-9]\d{1,14}$/;
    if (!phonePattern.test(cleaned)) {
      return "Invalid phone number format. Use international format starting with + (e.g., +94701234567)";
    }
    return undefined;
  };

  const validateDateOfBirth = (value: string): string | undefined => {
    if (!value.trim()) {
      return "Date of birth is required";
    }

    // Check format DD/MM/YYYY
    const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!datePattern.test(value)) {
      return "Invalid date format (DD/MM/YYYY)";
    }

    const parts = value.split("/").map(Number);
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    if (!day || !month || !year) {
      return "Invalid date";
    }

    const dateObj = new Date(year, month - 1, day);

    // Check if date is valid (handles leap years automatically)
    if (
      dateObj.getDate() !== day ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getFullYear() !== year
    ) {
      return "Invalid date";
    }

    // Check if date is not in the future
    if (dateObj > new Date()) {
      return "Date of birth cannot be in the future";
    }

    return undefined;
  };

  // Handle username change with validation
  const handleUsernameChange = (text: string) => {
    setUsername(text);
    const error = validateUsername(text);
    setErrors({ ...errors, username: error });
  };

  // Handle password change with validation
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    const error = validatePassword(text);
    setErrors({ ...errors, password: error });
  };

  // Handle phone number change with validation
  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    const error = validatePhoneNumber(text);
    setErrors({ ...errors, phoneNumber: error });
  };

  // Handle date of birth change with validation
  const handleDateOfBirthChange = (text: string) => {
    setDateOfBirth(text);
    const error = validateDateOfBirth(text);
    setErrors({ ...errors, dateOfBirth: error });
  };

  // Handle country change with validation
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const error = !value ? "Please select a country" : undefined;
    setErrors({ ...errors, country: error });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
          Component Validation Demo
        </TextComponent>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          This demo shows all components with proper validation implementation.
        </TextComponent>
      </View>

      <View style={styles.separator} />

      <View style={styles.formContainer}>
        <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
          Text Input Validation
        </TextComponent>

        {/* Username with validation */}
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your username",
          }}
          inputField={{
            value: username,
            onChangeText: handleUsernameChange,
            placeholder: "Enter username",
          }}
          label="Username *"
          inputType={TextInputType.Text}
          helperText="Username must be 3-20 characters"
          errorText={errors.username}
        />

        {/* Password with validation */}
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your password",
          }}
          inputField={{
            value: password,
            onChangeText: handlePasswordChange,
            placeholder: "Enter password",
          }}
          label="Password *"
          inputType={TextInputType.Password}
          helperText="Password must be at least 8 characters with uppercase, lowercase, and number"
          errorText={errors.password}
        />

        {/* Phone number with validation */}
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your phone number",
          }}
          inputField={{
            value: phoneNumber,
            onChangeText: handlePhoneNumberChange,
            placeholder: "+94 70 123 4567",
          }}
          label="Phone Number *"
          inputType={TextInputType.Phone}
          helperText="Use international format"
          errorText={errors.phoneNumber}
        />

        {/* Date of birth with validation */}
        <TextInputComponent
          inputWrapper={{
            accessibilityHint: "Enter your date of birth",
          }}
          inputField={{
            value: dateOfBirth,
            onChangeText: handleDateOfBirthChange,
            placeholder: "29/12/1998",
          }}
          label="Date of Birth *"
          helperText="Format: DD/MM/YYYY"
          errorText={errors.dateOfBirth}
        />

        {/* OTP Field */}
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
        />
      </View>

      <View style={styles.separator} />

      <View style={styles.formContainer}>
        <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
          Dropdown Validation
        </TextComponent>

        <DropdownComponent
          value={country}
          onValueChange={handleCountryChange}
          options={countryOptions}
          label="Country *"
          placeholder="Select a country"
          helperText="Choose your country of residence"
          errorText={errors.country}
        />
      </View>

      <View style={styles.separator} />

      <View style={styles.formContainer}>
        <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
          Chip Component
        </TextComponent>

        <View style={styles.chipContainer}>
          <ChipComponent
            text="Penicillin allergy"
            variant={ChipVariant.Danger}
            iconName="Heart"
            iconPosition="left"
          />
          <ChipComponent
            text="Warning"
            variant={ChipVariant.Warning}
            iconName="Check"
            iconPosition="right"
          />
          <ChipComponent
            text="Success"
            variant={ChipVariant.Success}
            iconName="Star"
            iconPosition="left"
          />
          <ChipComponent text="Light Theme" variant={ChipVariant.LightGreen} />
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.formContainer}>
        <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
          Toggle Component
        </TextComponent>

        <ToggleButton
          size={ToggleSize.Medium}
          label="Enable notifications"
          isActive={notificationsEnabled}
          onToggle={setNotificationsEnabled}
        />
        <ToggleButton
          size={ToggleSize.Large}
          label="Dark mode"
          isActive={darkModeEnabled}
          onToggle={setDarkModeEnabled}
        />
      </View>

      <View style={styles.separator} />

      <View style={styles.formContainer}>
        <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
          Button Component
        </TextComponent>

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
      </View>

      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
  },
  formContainer: {
    width: "100%",
    paddingHorizontal: 16,
    gap: 16,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  centeredButton: {
    alignItems: "center",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
