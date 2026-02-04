import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { EVENT_TYPES, useTaskHandler } from "@/services/tasks/useTaskHandler";
import { CheckIcon, GlobeIcon } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
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
  const eventTypes = [
    EVENT_TYPES.APPOINTMENT_SLOT_WINDOW,
    EVENT_TYPES.APPOINTMENT,
    EVENT_TYPES.TASK,
  ];

  const EVENT_TYPE_LABELS = {
    [EVENT_TYPES.APPOINTMENT_SLOT_WINDOW]: "Appointment Slot Window",
    [EVENT_TYPES.APPOINTMENT]: "Appointment",
    [EVENT_TYPES.TASK]: "Reminder/Task",
  };
  const days = ["M", "T", "W", "T", "F", "S", "S"];

  const { formState, setField, handleSave, isPending } =
    useTaskHandler(onClose);
  const [showEndDateTime, setShowEndDateTime] = useState(false);

  const {
    task_title,
    eventType,
    client,
    start_date,
    end_date,
    note,
    alarm,
    location,
    total_slots,
    repeatDays = [],
    slotWindow,
    slotNo,
    attachToSlot,
  } = formState;

  const toggleDay = (dayIndex: number) => {
    const updatedDays = repeatDays.includes(dayIndex)
      ? repeatDays.filter((d: number) => d !== dayIndex)
      : [...repeatDays, dayIndex];
    setField("repeatDays", updatedDays);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: "#fff" }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.heading}>Schedule New Event</Text>

          {/* Event Type Radio Group */}
          <View style={styles.radioGroup}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.radioRow}
                onPress={() => setField("eventType", type)}
              >
                <View style={styles.radioOuter}>
                  {eventType === type && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>{EVENT_TYPE_LABELS[type]}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 1. APPOINTMENT SLOT WINDOW SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW && (
            <>
              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <GlobeIcon size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.flexInput}
                  value={location}
                  onChangeText={(v) => setField("location", v)}
                  placeholder="Care - Medical Centre"
                />
              </View>

              <Text style={styles.label}>Number of Slots</Text>
              <TextInput
                style={styles.input}
                value={String(total_slots)}
                onChangeText={(v) => setField("total_slots", Number(v))}
                keyboardType="numeric"
                placeholder="10"
              />
              <Text style={styles.helpText}>average 15mins per slot</Text>

              <Text style={styles.label}>Start date & time</Text>
              <TextInput
                style={styles.input}
                value={start_date}
                placeholder="Nov 15, 2025  08:00 am"
              />

              <Text style={styles.label}>End date & time</Text>
              <TextInput
                style={styles.input}
                value={end_date}
                placeholder="Nov 15, 2025  11:30 am"
              />

              <Text style={styles.label}>Repeat</Text>
              <View style={styles.dayPicker}>
                {days.map((day, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => toggleDay(index)}
                    style={[
                      styles.dayCircle,
                      repeatDays.includes(index) && styles.dayCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        repeatDays.includes(index) && styles.dayTextActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* 2. APPOINTMENT SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.APPOINTMENT && (
            <>
              <Text style={styles.label}>Enter the title</Text>
              <TextInput
                style={styles.input}
                value={task_title}
                onChangeText={(v) => setField("task_title", v)}
                placeholder="Enter the title"
              />

              <TouchableOpacity
                style={styles.linkRow}
                onPress={() => setField("attachToSlot", !attachToSlot)}
              >
                <Text style={styles.linkText}>
                  {attachToSlot ? "✓" : "+"} Attach to an Appointment slot
                  window
                </Text>
              </TouchableOpacity>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Slot Window</Text>
                  <TextInput
                    style={styles.input}
                    value={slotWindow}
                    placeholder="Sat 9-11PM"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Slot No.</Text>
                  <TextInput
                    style={styles.input}
                    value={String(slotNo)}
                    onChangeText={(v) => setField("slotNo", Number(v))}
                    placeholder="No. 05 (10:15PM)"
                  />
                </View>
              </View>

              <Text style={styles.label}>Location</Text>
              <View style={styles.inputWithIcon}>
                <GlobeIcon size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.flexInput}
                  value={location}
                  placeholder="Care - Medical Centre"
                />
              </View>

              <Text style={styles.label}>Client Details</Text>
              <TextInput
                style={styles.input}
                value={client}
                placeholder="Jennifer ( 012 3456789 )"
              />

              <Text style={styles.label}>Start Date & time</Text>
              <TextInput
                style={styles.input}
                value={start_date}
                placeholder="Nov 15, 2025  08:00 am"
              />

              <Text style={styles.label}>End Date & time</Text>
              <TextInput
                style={styles.input}
                value={end_date}
                placeholder="Nov 15, 2025  11:30 am"
              />
            </>
          )}

          {/* 3. REMINDER/TASK SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.TASK && (
            <>
              <Text style={styles.label}>Enter the title</Text>
              <TextInput
                style={styles.input}
                value={task_title}
                placeholder="Enter the title"
              />

              <Text style={styles.label}>Client Details</Text>
              <TextInput
                style={styles.input}
                value={client}
                placeholder="Jennifer ( 012 3456789 )"
              />

              <Text style={styles.label}>Start Date & time</Text>
              <TextInput
                style={styles.input}
                value={start_date}
                placeholder="Nov 15, 2025  08:00 am"
              />

              {!showEndDateTime ? (
                <TouchableOpacity
                  style={styles.linkRow}
                  onPress={() => setShowEndDateTime(true)}
                >
                  <Text style={styles.linkText}>+ Add End Date & time</Text>
                </TouchableOpacity>
              ) : (
                <>
                  <Text style={styles.label}>End Date & time</Text>
                  <TextInput
                    style={styles.input}
                    value={end_date}
                    placeholder="Nov 15, 2025  08:00 am"
                  />
                </>
              )}

              <View style={styles.switchRow}>
                <Checkbox
                  value="alarm"
                  isChecked={alarm}
                  onChange={(checked) => setField("alarm", checked)}
                >
                  <CheckboxIndicator>
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel style={styles.checkboxLabel}>
                    Do you want to set a alarm
                  </CheckboxLabel>
                </Checkbox>
              </View>
            </>
          )}

          {/* Common Note Field */}
          <Text style={styles.label}>Note</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={note}
            onChangeText={(v) => setField("note", v)}
            placeholder="Type additional notes here"
            multiline
          />
        </ScrollView>

        {/* Updated Action Footer */}
        <View style={styles.actionSection}>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}> Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={isPending}
            >
              <View style={styles.saveButtonContent}>
                <CheckIcon size={18} color="#fff" weight="bold" />
                <Text style={styles.saveButtonText}>
                  {isPending ? "Saving..." : "Save"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const PRIMARY_COLOR = "#e3f0af";

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    backgroundColor: "#fff",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  icon: { marginRight: 10 },
  flexInput: { flex: 1, height: 45 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  radioGroup: { marginBottom: 10 },
  radioRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  radioOuter: {
    height: 22,
    width: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: "#444",
  },
  radioLabel: { fontSize: 15, color: "#555" },
  linkRow: { marginTop: 15, marginBottom: 5 },
  linkText: { color: "#666", fontSize: 14, fontWeight: "500" },
  helpText: { fontSize: 12, color: "#999", marginTop: 4 },
  dayPicker: { flexDirection: "row", marginTop: 10 },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF8E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  dayCircleActive: { backgroundColor: "#99cc88" },
  dayText: { fontSize: 13, fontWeight: "bold", color: "#444" },
  dayTextActive: { color: "#fff" },
  textarea: { height: 100, textAlignVertical: "top" },
  switchRow: { marginTop: 20, flexDirection: "row", alignItems: "center" },
  checkboxLabel: { marginLeft: 10, fontSize: 14, color: "#444" },
  actionSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: PRIMARY_COLOR,
    padding: 15,
    justifyContent: "space-between",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
  },
  saveButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#444",
    fontWeight: "600",
    fontSize: 16,
  },
});
