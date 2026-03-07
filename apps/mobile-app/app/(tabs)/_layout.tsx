import FontAwesome from "@expo/vector-icons/FontAwesome";
import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Link, Tabs } from "expo-router";
import {
  CalendarIcon,
  FoldersIcon,
  HouseLineIcon,
  UsersIcon,
} from "phosphor-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Color } from "@repo/config";
import { AIAssistantButton } from "./ai/AIAssistantButton";
import AIAssistantModal from "./ai/index";

function CustomTabIcon({
  name,
  focused,
}: {
  name: "home" | "calendar" | "user" | "folder";
  focused: boolean;
}) {
  return (
    <View
      style={{
        width: 45,
        height: 45,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? "#FDFDF5" : "transparent",
        borderWidth: focused ? 2 : 0,
        borderColor: focused ? Color.Green : "transparent",
      }}
    >
      {name === "home" && (
        <HouseLineIcon size={24} color={focused ? Color.Green : Color.Black} />
      )}
      {name === "calendar" && (
        <CalendarIcon size={24} color={focused ? Color.Green : Color.Black} />
      )}
      {name === "user" && (
        <UsersIcon size={24} color={focused ? Color.Green : Color.Black} />
      )}
      {name === "folder" && (
        <FoldersIcon size={24} color={focused ? Color.Green : Color.Black} />
      )}
    </View>
  );
}

function CustomTabBar({
  state,
  descriptors,
  navigation,
  onAssistantPress,
}: BottomTabBarProps & { onAssistantPress: () => void }) {
  return (
    <View className="absolute bottom-8 left-0 right-0 flex-row items-center justify-center gap-4">
      {/* Tabs Container */}
      <View className="shadow-lg rounded-[22px]">
        <LinearGradient
          colors={[Color.Green, "#D1FD22"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 22, padding: 2 }}
        >
          <View className="flex-row items-center bg-[#F8FFDA] rounded-[20px] px-2 py-2">
            {state.routes.map((route, index) => {
              if (
                ["_sitemap", "+not-found", "ai/index", "clients/[id]"].includes(
                  route.name
                )
              )
                return null;

              const descriptor = descriptors[route.key];
              if (!descriptor) return null;
              const { options } = descriptor;

              const isFocused = state.index === index;

              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };

              const onLongPress = () => {
                navigation.emit({
                  type: "tabLongPress",
                  target: route.key,
                });
              };

              return (
                <Pressable
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityState={isFocused ? { selected: true } : {}}
                  accessibilityLabel={(options as any).tabBarAccessibilityLabel}
                  testID={(options as any).tabBarTestID}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  className="items-center justify-center h-[50px] px-1"
                >
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color: "",
                    size: 24,
                  })}
                </Pressable>
              );
            })}
          </View>
        </LinearGradient>
      </View>

      {/* AI Assistant Button Container */}
      <View>
        <AIAssistantButton onPress={onAssistantPress} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isAIAssistantVisible, setIsAIAssistantVisible] = useState(false);

  return (
    <View className="flex-1 h-full">
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: useClientOnlyValue(false, true),
          tabBarShowLabel: false,
          tabBarStyle: { display: "none" }, // Check if we need to hide the default tab bar
        }}
        tabBar={(props) => (
          <CustomTabBar
            {...props}
            onAssistantPress={() => setIsAIAssistantVisible(true)}
          />
        )}
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

        {/* Hidden Route */}
        <Tabs.Screen name="ai/index" options={{ href: null }} />
        <Tabs.Screen
          name="clients/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      <AIAssistantModal
        visible={isAIAssistantVisible}
        onClose={() => setIsAIAssistantVisible(false)}
      />
    </View>
  );
}
