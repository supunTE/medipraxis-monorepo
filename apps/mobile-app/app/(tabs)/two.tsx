import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { View } from "@/components/Themed";
import TextComponent, { TextInputComponent } from "@/components/basic";
import { TextSize, TextVariant } from '@repo/config';

export default function TabTwoScreen() {
  const [textInput, setTextInput] = useState("");
  const [otp, setOtp] = useState("");

  return (
      <View style={styles.container}>
        <View>
          <TextComponent variant={TextVariant.Title} size={TextSize.ExtraLarge}>
            Title-extralarge
          </TextComponent>
          <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
            Title-large
          </TextComponent>
          <TextComponent variant={TextVariant.Title} size={TextSize.Medium}>
            Title-medium
          </TextComponent>
          <TextComponent variant={TextVariant.Title} size={TextSize.Small}>
            Title-small
          </TextComponent>
          <TextComponent variant={TextVariant.Button} size={TextSize.Large}>
            Button-large
          </TextComponent>
          <TextComponent variant={TextVariant.Button} size={TextSize.Medium}>
            Button-medium
          </TextComponent>
          <TextComponent variant={TextVariant.Button} size={TextSize.Small}>
            Button-small
          </TextComponent>
          <TextComponent variant={TextVariant.Body} size={TextSize.Large}>
            Body-large
          </TextComponent>
          <TextComponent variant={TextVariant.Body} size={TextSize.Medium}>
            Body-medium
          </TextComponent>
          <TextComponent variant={TextVariant.Body} size={TextSize.Small}>
            Body-small
          </TextComponent>
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
        <View style={styles.separator} />
        <View>
          <TextInputComponent.OTPField
            value={otp}
            onChangeText={setOtp}
            label="OTP Input"
          />
        </View>

      </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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

