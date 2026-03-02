import { EVENT_TYPES, useTaskHandler } from "@/services/tasks/useTaskHandler";
import React, { useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";

import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  DateTimePickerComponent,
  RadioGroupComponent,
  TextAreaComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";

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
    taskTitle,
    eventType,
    client,
    startDate,
    endDate,
    note,
    alarm,
    location,
    totalSlots,
    repeatDays = [],
    slotWindow,
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
          contentContainerClassName="p-5 pb-[150px]"
          keyboardShouldPersistTaps="handled"
        >
          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Large}
            className="mb-5"
          >
            Schedule New Event
          </TextComponent>

          {/* Event Type Radio Group */}
          <RadioGroupComponent
            value={eventType}
            onChange={(val) => setField("eventType", val)}
            options={eventTypes.map((type) => ({
              label: EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS],
              value: type,
            }))}
            className="mb-4 gap-3 flex-col"
          />

          {/* 1. APPOINTMENT SLOT WINDOW SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW && (
            <View className="gap-4 mt-2.5">
              <TextInputComponent
                label="Location"
                inputField={{
                  value: location,
                  onChangeText: (v) => setField("location", v),
                  placeholder: "Care - Medical Centre",
                }}
                inputType={TextInputType.Text}
              />

              <TextInputComponent
                label="Number of Slots"
                inputField={{
                  value: totalSlots !== undefined ? String(totalSlots) : "",
                  onChangeText: (v) => setField("totalSlots", Number(v)),
                  placeholder: "10",
                }}
                inputType={TextInputType.Number}
                helperText="average 15mins per slot"
              />

              <DateTimePickerComponent
                label="Start date & time"
                value={startDate}
                onChange={(v) => setField("startDate", v)}
                placeholder="Nov 15, 2025  08:00 am"
              />

              <DateTimePickerComponent
                label="End date & time"
                value={endDate}
                onChange={(v) => setField("endDate", v)}
                placeholder="Nov 15, 2025  11:30 am"
              />

              <View>
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Large}
                  className="mb-2"
                >
                  Repeat
                </TextComponent>
                <View className="flex-row mt-1.5">
                  {days.map((day, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => toggleDay(index)}
                      className="w-9 h-9 rounded-full items-center justify-center mr-2 bg-[#FFF8E1]"
                      style={
                        repeatDays.includes(index)
                          ? { backgroundColor: Color.Green }
                          : undefined
                      }
                    >
                      <TextComponent
                        variant={TextVariant.Body}
                        size={TextSize.Medium}
                        color={
                          repeatDays.includes(index) ? Color.White : Color.Black
                        }
                        className="font-bold"
                      >
                        {day}
                      </TextComponent>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* 2. APPOINTMENT SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.APPOINTMENT && (
            <View className="gap-4 mt-2.5">
              <TextInputComponent
                label="Enter the title"
                inputField={{
                  value: taskTitle,
                  onChangeText: (v) => setField("taskTitle", v),
                  placeholder: "Enter the title",
                }}
                inputType={TextInputType.Text}
              />

              <TouchableOpacity
                className="my-1.5"
                onPress={() => setField("attachToSlot", !attachToSlot)}
              >
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Medium}
                  className="text-[#666] font-medium"
                >
                  {attachToSlot ? "✓" : "+"} Attach to an Appointment slot
                  window
                </TextComponent>
              </TouchableOpacity>

              <TextInputComponent
                label="Slot Window"
                inputField={{
                  value: slotWindow,
                  onChangeText: (v) => setField("slotWindow", v),
                  placeholder: "Sat 9-11PM",
                }}
                inputType={TextInputType.Text}
              />

              <TextInputComponent
                label="Location"
                inputField={{
                  value: location,
                  onChangeText: (v) => setField("location", v),
                  placeholder: "Care - Medical Centre",
                }}
                inputType={TextInputType.Text}
              />

              <TextInputComponent
                label="Client Details"
                inputField={{
                  value: client,
                  onChangeText: (v) => setField("client", v),
                  placeholder: "Jennifer ( 012 3456789 )",
                }}
                inputType={TextInputType.Text}
              />

              <DateTimePickerComponent
                label="Start Date & time"
                value={startDate}
                onChange={(v) => setField("startDate", v)}
                placeholder="Nov 15, 2025  08:00 am"
                mode="datetime"
              />

              <DateTimePickerComponent
                label="End Date & time"
                value={endDate}
                onChange={(v) => setField("endDate", v)}
                placeholder="Nov 15, 2025  11:30 am"
                mode="datetime"
              />
            </View>
          )}

          {/* 3. REMINDER/TASK SPECIFIC FIELDS */}
          {eventType === EVENT_TYPES.TASK && (
            <View className="gap-4 mt-2.5">
              <TextInputComponent
                label="Enter the title"
                inputField={{
                  value: taskTitle,
                  onChangeText: (v) => setField("taskTitle", v),
                  placeholder: "Enter the title",
                }}
                inputType={TextInputType.Text}
              />

              <TextInputComponent
                label="Client Details"
                inputField={{
                  value: client,
                  onChangeText: (v) => setField("client", v),
                  placeholder: "Jennifer ( 012 3456789 )",
                }}
                inputType={TextInputType.Text}
              />

              <DateTimePickerComponent
                label="Start Date & time"
                value={startDate}
                onChange={(v) => setField("startDate", v)}
                placeholder="Nov 15, 2025  08:00 am"
              />

              {!showEndDateTime ? (
                <TouchableOpacity
                  className="my-1.5"
                  onPress={() => setShowEndDateTime(true)}
                >
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Medium}
                    className="text-[#666] font-medium"
                  >
                    + Add End Date & time
                  </TextComponent>
                </TouchableOpacity>
              ) : (
                <View>
                  <DateTimePickerComponent
                    label="End Date & time"
                    value={endDate}
                    onChange={(v) => setField("endDate", v)}
                    placeholder="Nov 15, 2025  08:00 am"
                  />
                  <TouchableOpacity
                    className="my-1.5"
                    onPress={() => {
                      setShowEndDateTime(false);
                      setField("endDate", "");
                    }}
                  >
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Medium}
                      color={Color.Danger}
                      className="font-medium"
                    >
                      - Remove End Date & time
                    </TextComponent>
                  </TouchableOpacity>
                </View>
              )}

              <View className="mt-2.5 flex-row items-center">
                <CheckboxComponent
                  value="alarm"
                  label="Do you want to set an alarm"
                  isChecked={alarm}
                  onChange={(checked) => setField("alarm", checked)}
                />
              </View>
            </View>
          )}

          {/* Common Note Field */}
          <View className="gap-4 mt-4">
            <TextAreaComponent
              label="Note"
              inputField={{
                value: note,
                onChangeText: (v) => setField("note", v),
                placeholder: "Type additional notes here",
              }}
            />
          </View>
        </ScrollView>

        {/* Updated Action Footer using ButtonComponent */}
        <View className="absolute bottom-0 w-full bg-[#e3f0af] p-[15px] pb-[30px] justify-between">
          <View className="flex-row justify-between w-full">
            <View style={{ flex: 1, marginRight: 8 }}>
              <ButtonComponent
                size={ButtonSize.Large}
                buttonColor={Color.LightGrey}
                textColor={Color.Grey}
                onPress={onClose}
              >
                Close
              </ButtonComponent>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <ButtonComponent
                size={ButtonSize.Large}
                leftIcon={Icons.Check}
                buttonColor={Color.Black}
                textColor={Color.White}
                iconColor={Color.White}
                onPress={handleSave}
                disabled={isPending}
              >
                {isPending ? "Saving..." : "Save"}
              </ButtonComponent>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
