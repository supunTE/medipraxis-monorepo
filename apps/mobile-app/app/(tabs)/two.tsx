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
import { z } from "zod";

export default function TabTwoScreen() {
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [country, setCountry] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(true);

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
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
          Welcome to Tab Two!
        </TextComponent>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
          minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat.
        </TextComponent>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
          dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est
          laborum.
        </TextComponent>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae
          ab illo inventore veritatis et quasi architecto beatae vitae dicta
          sunt explicabo.
        </TextComponent>
        <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
          Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut
          fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem
          sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor
          sit amet.
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
        <View>
          <DropdownComponent
            value={country}
            onValueChange={setCountry}
            options={countryOptions}
            label="Country"
            placeholder="Select a country"
            validationSchema={requiredSchema}
            validateOnChange={true}
          />
          <ToggleButton
            size={ToggleSize.Medium}
            label="Enable toggle"
            isActive={notificationsEnabled}
            onToggle={setNotificationsEnabled}
          />
          <ToggleButton
            size={ToggleSize.Large}
            isActive={darkModeEnabled}
            onToggle={setDarkModeEnabled}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    paddingVertical: 20,
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
