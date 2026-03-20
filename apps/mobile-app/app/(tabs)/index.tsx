import { useAuth } from "@/auth/AuthContext";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import { useFocusEffect } from "@react-navigation/native";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import TaskForm from "@/components/advanced/taskPanel/TaskForm";
import { HomeCard } from "./home/HomeCard.component";
import { UpcomingEventCard } from "./home/UpcomingEventCard.Component";

const PlusIcon = Icons.Plus;
const FileTextIcon = Icons.FileText;
import { FormSetupCenter } from "./settings/components/form-setup-center";

export default function TabOneScreen() {
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [showFormSetup, setShowFormSetup] = useState(false);

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
      <HomeCard />

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
        }}
      >
        <Text
          style={{
            fontFamily: "Lato",
            fontSize: textStyles[TextVariant.Title][TextSize.Small].fontSize,
            fontWeight: "700",
            color: Color.Black,
          }}
        >
          Upcoming events
        </Text>

        <View style={{ flexDirection: "row", gap: 10 }}>
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

          <TouchableOpacity
            onPress={() => setShowFormSetup(true)}
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
            <FileTextIcon size={20} color={Color.DarkGreen} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable: only the event cards scroll */}
      <ScrollView
        contentContainerStyle={{
          paddingTop: 4,
          paddingBottom: 120, // space for nav bar
        }}
        showsVerticalScrollIndicator={false}
      >
        <UpcomingEventCard />
      </ScrollView>

      {/* Task Form modal */}
      <TaskForm visible={showForm} onClose={() => setShowForm(false)} />
      <FormSetupCenter
        visible={showFormSetup}
        onClose={() => setShowFormSetup(false)}
      />
    </View>
  );
}
