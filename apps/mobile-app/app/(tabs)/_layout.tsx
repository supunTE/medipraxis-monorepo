import { type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import {
  CalendarIcon,
  FoldersIcon,
  HouseLineIcon,
  UsersIcon,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Pressable, View } from "react-native";

import { KeyEntryModal } from "../auth/KeyEntryModal";
import { KeyRevealModal } from "../auth/KeyRevealModal";

import { encryptionKeyStorage } from "../../utils/storage";

import { useClientOnlyValue } from "@/components/useClientOnlyValue";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { Color } from "@repo/config";
import { useQueryClient } from "@tanstack/react-query";
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
      <View
          className="rounded-[22px]"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 6,
            elevation: 4,
          }}
        >
        <LinearGradient
          colors={[Color.Green, "#D1FD22"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 22, padding: 2 }}
        >
          <View className="flex-row items-center bg-[#F8FFDA] rounded-[20px] px-2 py-2">
            {state.routes.map((route, index) => {
              const descriptor = descriptors[route.key];
              if (!descriptor) return null;
              const { options } = descriptor;

              // Skip routes without a tab icon (hidden routes)
              if (!options.tabBarIcon) return null;

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
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
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
  const [isKeyModalVisible, setIsKeyModalVisible] = useState(false);
  const [isKeyEntryVisible, setIsKeyEntryVisible] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const checkEncryptionKey = async () => {
      const key = await encryptionKeyStorage.get();
      if (!key) {
        setIsKeyEntryVisible(true);
      }
    };
    void checkEncryptionKey();
  }, []);

  return (
    <View className="flex-1 h-full mb-6">
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
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="home" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="schedule"
          options={{
            title: "Schedule",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="calendar" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="clients/index"
          options={{
            title: "Clients",
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon name="user" focused={focused} />
            ),
          }}
        />

        <Tabs.Screen
          name="reports/index"
          options={{
            title: "Reports",
            headerShown: false,
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
        <Tabs.Screen
          name="reports/[id]"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings/index"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings/form-setup-center/index"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="reports/request-report"
          options={{
            href: null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="reports/request-report/[id]"
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

      <KeyEntryModal
        visible={isKeyEntryVisible}
        onSuccess={() => setIsKeyEntryVisible(false)}
        onForgotKey={() => {
          setIsKeyEntryVisible(false);
          setIsKeyModalVisible(true);
        }}
      />

      <KeyRevealModal
        visible={isKeyModalVisible}
        mode="revoke"
        onSuccess={() => {
          setIsKeyModalVisible(false);
          setIsKeyEntryVisible(false);
          void queryClient.invalidateQueries({ queryKey: ["user-keys"] });
        }}
        onClose={() => {
          setIsKeyModalVisible(false);
          // Re-check: if key still missing, re-show entry modal
          void (async () => {
            const key = await encryptionKeyStorage.get();
            if (!key) setIsKeyEntryVisible(true);
          })();
        }}
      />
    </View>
  );
}
