import React, { useState } from "react";
import { StyleSheet } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { View } from "@/components/Themed";
import TextComponent, { ButtonComponent, ButtonSize, TextInputComponent } from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from '@repo/config';
import { z } from "zod";

export default function TabTwoScreen() {
  const [textInput, setTextInput] = useState("");
  const [otp1, setOtp1] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number");
  const usernameSchema = z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must not exceed 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores");
  const otpSchema = z.string().regex(/^[0-9]$/, "Must be a number");

  
  return (
      <View style={styles.container}>
        <View>
          <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
            Welcome to Tab Two!
          </TextComponent>
          <TextInputComponent
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Enter your name"
            label="Text Input"
            showPasswordToggle={false}
          />
        </View>
        <View style={styles.separator} />
        <View>
          <TextInputComponent
            value={textInput}
            onChangeText={setTextInput}
            placeholder="Enter your name"
            label="Text Input"
          />
        </View>
        {/* Password Input with Validation */}
        <TextInputComponent
          value={password}
          onChangeText={setPassword}
          placeholder="Enter secure password"
          label="Password"
          inputType="password"
          validationSchema={passwordSchema}
          helperText="Min 8 chars with uppercase, lowercase & number"
        />
        {/* Username with Warning Example */}
        <TextInputComponent
          value={username}
          onChangeText={setUsername}
          placeholder="johndoe123"
          label="Username"
          validationSchema={usernameSchema}
          showWarning={username === "admin" || username === "test"}
          helperText="3-20 characters, letters, numbers & underscores"
        />
        <View style={styles.separator} />
        <View>
          <TextInputComponent.OTPField
          value={otp1}
          onChangeText={setOtp1}
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
  }
});
