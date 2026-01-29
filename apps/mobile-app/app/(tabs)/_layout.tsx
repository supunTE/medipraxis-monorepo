import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Tabs } from "expo-router";
import React, { useState } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import {
  HouseLineIcon,
  CalendarIcon,
  UsersIcon,
  FoldersIcon,
} from "phosphor-react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import AIAssistantModal from "./ai/index";
import { AIAssistantButton } from "./ai/AIAssistantButton";

function CustomTabIcon({
  name,
  focused,
}: {
  name: "home" | "calendar" | "user" | "folder";
  focused: boolean;
}) {
  return (
    <View
      className={`h-[45px] w-[45px] rounded-[14px] items-center justify-center mt-3 ${
        focused ? "bg-[#FDFDF5] border-[1.5px] border-[#CFFF5E]" : ""
      }`}
    >
      {name === "home" && (
        <HouseLineIcon size={24} color={focused ? "#4A5D23" : "#1C1C1E"} />
      )}
      {name === "calendar" && (
        <CalendarIcon size={24} color={focused ? "#4A5D23" : "#1C1C1E"} />
      )}
      {name === "user" && (
        <UsersIcon size={24} color={focused ? "#4A5D23" : "#1C1C1E"} />
      )}
      {name === "folder" && (
        <FoldersIcon size={24} color={focused ? "#4A5D23" : "#1C1C1E"} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAIAssistantVisible, setIsAIAssistantVisible] = useState(false);

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          // Disable the static render of the header on web
          // to prevent a hydration error in React Navigation v6.
          headerShown: useClientOnlyValue(false, true),
          tabBarShowLabel: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItemStyle,
          tabBarIconStyle: styles.tabBarIconStyle,
          tabBarBackground: undefined,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="home" focused={focused} />
            ),
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable className="mr-[15px]">
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />

        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="calendar" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="clients/index"
          options={{
            title: "Clients",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="user" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="two"
          options={{
            title: "Tab Two",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="folder" focused={focused} />
            ),
          }}
        />

        {/* Hidden AI Route */}
        <Tabs.Screen name="ai/index" options={{ href: null }} />
      </Tabs>

      {/* AI Assistant */}
      <AIAssistantButton onPress={() => setIsAIAssistantVisible(true)} />

      <AIAssistantModal
        visible={isAIAssistantVisible}
        onClose={() => setIsAIAssistantVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 25,
    left: 20,
    right: 20,
    height: 72,
    backgroundColor: "#F6FFDE",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#CFFF5E",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    width: "60%",
    marginLeft: 30,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 0,
    paddingTop: 0,
  },

  tabBarItemStyle: {
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 0,
    paddingBottom: 0,
    paddingTop: 0,
  },

  tabBarIconStyle: {
    marginTop: 0,
    marginBottom: 0,
  },
});
