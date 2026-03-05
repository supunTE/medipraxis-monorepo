import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  View,
  type TextStyle as RNTextStyle,
} from "react-native";

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

type TabType = "completed" | "pending";

export default function ReportsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabType>("completed");

  return (
    <View className="flex-1 bg-white px-5 pt-5">
      {/* Header with Title and Button */}
      <View className="flex-row justify-between items-center mb-5">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Large}
          color={Color.Black}
        >
          Reports
        </TextComponent>

        <ButtonComponent
          size={ButtonSize.Medium}
          buttonColor={Color.Black}
          textColor={Color.White}
          onPress={() => {
            // TODO: Implement request report functionality
            console.log("Request Report pressed");
          }}
        >
          + Request Report
        </ButtonComponent>
      </View>

      {/* Search Bar */}
      <View className="mb-5">
        <Input
          variant="outline"
          size="md"
          style={{
            borderColor: Color.LightGrey,
            borderWidth: 1.5,
            borderRadius: 12,
            width: "100%",
            height: 56,
            backgroundColor: Color.White,
          }}
        >
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search reports..."
            placeholderTextColor={Color.Grey}
            style={{
              paddingLeft: 16,
              paddingRight: 48,
              paddingVertical: 12,
              fontFamily:
                textLargeStyle.fontFamily === Font.DMsans
                  ? "DMSans_400Regular"
                  : "Lato_400Regular",
              fontSize: textLargeStyle.fontSize,
              fontWeight: "400" as RNTextStyle["fontWeight"],
              textAlign: "left",
              color: Color.Black,
            }}
          />
          <InputSlot className="pr-4">
            <Icons.Search size={20} color={Color.Grey} weight="regular" />
          </InputSlot>
        </Input>
      </View>

      {/* Tabs */}
      <View className="flex-row justify-center items-center mb-5 gap-4">
        <TouchableOpacity
          onPress={() => setActiveTab("completed")}
          className="px-6 py-2 rounded-lg"
          style={{
            backgroundColor:
              activeTab === "completed" ? Color.Green : "transparent",
          }}
        >
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Black}
          >
            Completed
          </TextComponent>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("pending")}
          className="px-6 py-2 rounded-lg"
          style={{
            backgroundColor:
              activeTab === "pending" ? Color.Green : "transparent",
          }}
        >
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Black}
          >
            Pending
          </TextComponent>
        </TouchableOpacity>
      </View>

      {/* Reports List */}
      <ScrollView className="flex-1">
        {/* TODO: Add reports list here */}
        <View className="flex-1 justify-center items-center pt-10">
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Black}
            style={{ opacity: 0.5 }}
          >
            {activeTab === "completed"
              ? "No completed reports yet"
              : "No pending reports yet"}
          </TextComponent>
        </View>
      </ScrollView>
    </View>
  );
}
