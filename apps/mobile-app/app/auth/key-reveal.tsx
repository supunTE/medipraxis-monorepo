import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Color } from "@repo/config";

import { KeyRevealModal } from "./KeyRevealModal";

export default function KeyRevealScreen() {
  const router = useRouter();
  const { phoneNumber, countryCode } = useLocalSearchParams<{
    phoneNumber: string;
    countryCode: string;
  }>();

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={[Color.White, "#B6F6D2"]}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
        }}
      />
      <KeyRevealModal
        visible
        mode="register"
        onSuccess={() => {
          router.replace({
            pathname: "/auth/login",
            params: { phoneNumber, countryCode },
          });
        }}
      />
    </View>
  );
}
