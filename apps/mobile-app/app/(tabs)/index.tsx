import { View } from "@/components/Themed";
import { useState } from "react";
import { Button, StyleSheet } from "react-native";

import TaskForm from "@/components/advanced/taskPanel/TaskForm";
import { FormSetupCenter } from "./settings/components/form-setup-center";

export default function TabOneScreen() {
  const [showForm, setShowForm] = useState(false);
  const [showFormSetup, setShowFormSetup] = useState(false);

  return (
    <View style={styles.container}>
      {/* --- Old demo content (commented out) ---
      <Text style={styles.title}>Tab One</Text>
      <TextComponent
        variant={TextVariant.Title}
        size={TextSize.ExtraLarge}
        color={Color.Green}
      >
        Welcome to Medipraxis!
      </TextComponent>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      ----------------------------------------- */}

      {/* Button to open the appointment window */}
      <Button title="Open Appointment Form" onPress={() => setShowForm(true)} />

      {/* Button to open Form Setup Center */}
      <Button
        title="Form Setup Center"
        onPress={() => setShowFormSetup(true)}
      />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  // old styles kept for reference
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
