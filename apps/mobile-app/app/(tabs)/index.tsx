import { View } from "@/components/Themed";
import { useState } from "react";
import { Button, ScrollView } from "react-native";

import { FormSetupCenter } from "@/components/advanced/formSetupCenter";
import TaskForm from "@/components/advanced/taskPanel/TaskForm";
import HomeCard from "./HomeCard.component";

export default function TabOneScreen() {
  const [showForm, setShowForm] = useState(false);
  const [showFormSetup, setShowFormSetup] = useState(false);

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}>
        {/* Home Card */}
        <HomeCard />

        {/* Existing buttons — visible above tab bar */}
        <View className="flex-1 justify-end items-center pt-10">
          <Button
            title="Open Appointment Form"
            onPress={() => setShowForm(true)}
          />
          <Button
            title="Form Setup Center"
            onPress={() => setShowFormSetup(true)}
          />
        </View>
      </ScrollView>

      {/* Appointment modal only shows when state is true */}
      <TaskForm visible={showForm} onClose={() => setShowForm(false)} />

      {/* Form Setup Center modal */}
      <FormSetupCenter
        visible={showFormSetup}
        onClose={() => setShowFormSetup(false)}
      />
    </View>
  );
}
