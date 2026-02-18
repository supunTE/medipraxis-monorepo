import {
  DMSans_400Regular,
  DMSans_500Medium,
} from "@expo-google-fonts/dm-sans";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { DotsSixVerticalIcon } from "phosphor-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { FieldItemProps } from "./formConfig.types";

export function FieldItem({ field, onPress }: FieldItemProps) {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  const FieldIcon = field.icon;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.leftSection}>
        <FieldIcon size={20} color={Color.Black} weight="regular" />
        <Text style={styles.fieldName}>{field.fieldName}</Text>
      </View>
      <DotsSixVerticalIcon size={20} color={Color.Grey} weight="bold" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Color.LightCream,
    marginBottom: 12,
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  fieldName: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Color.Black,
  },
});
