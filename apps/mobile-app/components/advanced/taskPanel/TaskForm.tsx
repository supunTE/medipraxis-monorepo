import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function TaskForm({ visible, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("Appointment");
  const [client, setClient] = useState("Jennifer");
  const [startDateTime, setStartDateTime] = useState("2025-11-15T08:00");
  const [endDateTime, setEndDateTime] = useState("2025-11-15T11:30");
  const [note, setNote] = useState("");
  const [alarm, setAlarm] = useState(true);
  const [location, setLocation] = useState("Care - Medical Centre");
  const [attachToSlot, setAttachToSlot] = useState(false);

  const handleSave = () => {
    const eventDetails = {
      title,
      eventType,
      client,
      startDateTime,
      endDateTime,
      note,
      alarm,
      location,
      attachToSlot,
    };
    console.log("Event Saved:", eventDetails);
    onClose();
  };

  const eventTypes = [
    "Appointment Slot Window",
    "Appointment",
    "Reminder/Task",
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Schedule New Event</Text>

        {/* Title */}
        <Text style={styles.label}>Enter the title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Event title"
        />

        {/* Event Type */}
        <Text style={styles.label}>Event Type</Text>
        <View style={styles.radioGroup}>
          {eventTypes.map((type) => (
            <TouchableOpacity
              key={type}
              style={styles.radioRow}
              onPress={() => setEventType(type)}
            >
              <View style={styles.radioOuter}>
                {eventType === type && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.small}>Selected: {eventType}</Text>

        {/* Appointment-specific fields */}
        {eventType === "Appointment" && (
          <>
            <TouchableOpacity
              style={styles.attachRow}
              onPress={() => setAttachToSlot(!attachToSlot)}
            >
              <Text style={styles.attachText}>
                {attachToSlot ? "✓" : "+"} Attach to an Appointment slot window
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
            />

            <Text style={styles.label}>End Date & Time</Text>
            <TextInput
              style={styles.input}
              value={endDateTime}
              onChangeText={setEndDateTime}
              placeholder="YYYY-MM-DDTHH:MM"
            />
          </>
        )}

        {/* Client */}
        <Text style={styles.label}>Client Details</Text>
        <TextInput
          style={styles.input}
          value={client}
          onChangeText={setClient}
          placeholder="Client name"
        />

        {/* Start Date */}
        <Text style={styles.label}>Start Date & Time</Text>
        <TextInput
          style={styles.input}
          value={startDateTime}
          onChangeText={setStartDateTime}
          placeholder={
            Platform.OS === "web" ? "YYYY-MM-DDTHH:MM" : "2025-11-15T08:00"
          }
        />

        {/* Note */}
        <Text style={styles.label}>Note</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          value={note}
          onChangeText={setNote}
          placeholder="Additional notes..."
          multiline
        />

        {/* Alarm */}
        <View style={styles.switchRow}>
          <Switch value={alarm} onValueChange={setAlarm} />
          <Text style={styles.switchLabel}>Set an alarm</Text>
        </View>
      </ScrollView>

      {/* Actions Section (full width footer) */}
      <View style={styles.actionSection}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}> Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}> Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const PRIMARY_COLOR = "#e3f0af";

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 16,
    color: "#222",
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: "500",
    fontSize: 14,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
    color: "#222",
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  radioGroup: {
    marginVertical: 8,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  radioOuter: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  radioInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY_COLOR,
  },
  radioLabel: {
    fontSize: 14,
    color: "#444", // unified text color
  },
  small: {
    fontSize: 12,
    color: "#555",
    marginTop: 4,
  },
  attachRow: {
    marginTop: 12,
    marginBottom: 8,
  },
  attachText: {
    fontSize: 14,
    color: "#444", // unified with radio label color
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  switchLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: "#444",
  },
  actionSection: {
    backgroundColor: PRIMARY_COLOR, // full-width footer section
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#222", // dark grey / lighter black
    padding: 12,
    borderRadius: 6,
    marginRight: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  closeButton: {
    flex: 1,
    backgroundColor: "#ccc",
    padding: 12,
    borderRadius: 6,
    marginLeft: 8,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#444",
    fontWeight: "600",
  },
});
