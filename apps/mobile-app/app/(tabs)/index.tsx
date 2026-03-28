import { useAuth } from "@/auth/AuthContext";
import { Icons } from "@/config";
import { useFocusEffect } from "@react-navigation/native";
import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";

import TaskForm from "@/components/advanced/taskPanel/TaskForm";
import { HomeCard } from "./home/HomeCard.component";
import { UpcomingEventCard } from "./home/UpcomingEventCard.Component";

const PlusIcon = Icons.Plus;

export default function TabOneScreen() {
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const queryClient = useQueryClient();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 0);
  };

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["upcomingTasks", userId] }),
        queryClient.invalidateQueries({ queryKey: ["taskSummary", userId] }),
      ]);
    }, [queryClient, userId])
  );

  return (
    <View style={{ flex: 1, backgroundColor: Color.White }}>
      {/* HomeCard fixed */}
      <HomeCard onSettingsPress={() => router.push("/settings")} />

      {/* Upcoming events header always visible */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 24,
          paddingBottom: 12,
          backgroundColor: Color.White,
          shadowColor: "#0000007b",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: isScrolled ? 0.05 : 0,
          shadowRadius: 4,
          elevation: isScrolled ? 2 : 0,
          zIndex: 1,
        }}
      >
        <Text
          style={{
            fontFamily: "Inter",
            fontSize: textStyles[TextVariant.Title][TextSize.Small].fontSize,
            fontWeight: "700",
            color: Color.Black,
          }}
        >
          Upcoming events
        </Text>

        <TouchableOpacity
          onPress={() => setShowForm(true)}
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Color.LightGrey,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <PlusIcon size={20} color={Color.DarkGreen} />
        </TouchableOpacity>
      </View>

      {/* Scrollable: only the event cards scroll */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 16,
          paddingBottom: 120, // space for nav bar
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <UpcomingEventCard />
      </ScrollView>

      {/* Task Form modal */}
      <TaskForm visible={showForm} onClose={() => setShowForm(false)} />
    </View>
  );
}
