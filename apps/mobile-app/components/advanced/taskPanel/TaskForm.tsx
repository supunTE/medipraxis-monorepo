import { EVENT_TYPES, useTaskHandler } from "@/services/tasks/useTaskHandler";
import React, { useState } from "react";
import { Modal, ScrollView, TouchableOpacity, View } from "react-native";

import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  DateTimePickerComponent,
  DropdownComponent,
  RadioGroupComponent,
  TextAreaComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
  ToggleButton,
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

  const clientOptions = [
    { label: "Jennifer ( 012 3456789 )", value: "Jennifer ( 012 3456789 )" },
    { label: "Michael ( 098 7654321 )", value: "Michael ( 098 7654321 )" },
    { label: "Sarah ( 011 2233445 )", value: "Sarah ( 011 2233445 )" },
  ];

  const slotWindowOptions = [
    { label: "Sat 9-11PM", value: "Sat 9-11PM" },
    { label: "Sun 10-12AM", value: "Sun 10-12AM" },
  ];

  const slotNoOptions = [
    { label: "No. 05 (10:15PM)", value: "No. 05 (10:15PM)" },
    { label: "No. 06 (10:30PM)", value: "No. 06 (10:30PM)" },
  ];

  const { formState, setField, handleSave, isPending } =
    useTaskHandler(onClose);
  const [showEndDateTime, setShowEndDateTime] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

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

          {eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW && (
            <ToggleButton
              label="Recurring"
              isActive={isRecurring}
              onToggle={setIsRecurring}
            />
          )}

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

              {!isRecurring && (
                <DateTimePickerComponent
                  label="Date"
                  value={endDate}
                  onChange={(v) => setField("endDate", v)}
                  placeholder="Nov 15, 2025"
                />
              )}

              <DateTimePickerComponent
                label="Start time"
                value={startDate}
                onChange={(v) => setField("startDate", v)}
                placeholder="08:00 am"
              />

              <DateTimePickerComponent
                label="End time"
                value={endDate}
                onChange={(v) => setField("endDate", v)}
                placeholder="11:30 am"
              />

              {isRecurring && (
                <>
                  <DateTimePickerComponent
                    label="Repeat Until"
                    value={endDate}
                    onChange={(v) => setField("endDate", v)}
                    placeholder="Nov 15, 2025 11:30 am"
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
                              repeatDays.includes(index)
                                ? Color.White
                                : Color.Black
                            }
                            className="font-bold"
                          >
                            {day}
                          </TextComponent>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
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

              {!attachToSlot ? (
                <>
                  <TouchableOpacity
                    className="my-1.5"
                    onPress={() => setField("attachToSlot", true)}
                  >
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Medium}
                      className="text-[#666] font-medium"
                    >
                      + Attach to an Appointment slot window
                    </TextComponent>
                  </TouchableOpacity>

                  <TextInputComponent
                    label="Location"
                    inputField={{
                      value: location,
                      onChangeText: (v) => setField("location", v),
                      placeholder: "Care - Medical Centre",
                    }}
                    inputType={TextInputType.Text}
                  />

                  <DropdownComponent
                    label="Client Details"
                    value={client || ""}
                    onValueChange={(v) => setField("client", v)}
                    options={clientOptions}
                    placeholder="Jennifer ( 012 3456789 )"
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
                </>
              ) : (
                <>
                  <View className="flex-row gap-4 mb-2">
                    <View className="flex-1">
                      <DropdownComponent
                        label="Slot Window"
                        value={slotWindow || ""}
                        onValueChange={(v) => setField("slotWindow", v)}
                        options={slotWindowOptions}
                        placeholder="Sat 9-11PM"
                      />
                    </View>
                    <View className="flex-1">
                      <DropdownComponent
                        label="Slot No."
                        value={slotNo || ""}
                        onValueChange={(v) => setField("slotNo", v)}
                        options={slotNoOptions}
                        placeholder="No. 05 (10:15PM)"
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    className="my-1.5"
                    onPress={() => {
                      setField("attachToSlot", false);
                      setField("slotWindow", "");
                      setField("slotNo", "");
                    }}
                  >
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Medium}
                      color={Color.Danger}
                      className="font-medium"
                    >
                      - Remove Appointment Slot
                    </TextComponent>
                  </TouchableOpacity>

                  <DropdownComponent
                    label="Client Details"
                    value={client || ""}
                    onValueChange={(v) => setField("client", v)}
                    options={clientOptions}
                    placeholder="Jennifer ( 012 3456789 )"
                  />
                </>
              )}
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

              <DropdownComponent
                label="Client Details"
                value={client || ""}
                onValueChange={(v) => setField("client", v)}
                options={clientOptions}
                placeholder="Jennifer ( 012 3456789 )"
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

          {/* Alarm - only for Reminder/Task */}
          {eventType === EVENT_TYPES.TASK && (
            <View className="mt-2.5 flex-row items-center">
              <CheckboxComponent
                value="alarm"
                label="Do you want to set an alarm"
                isChecked={alarm}
                onChange={(checked) => setField("alarm", checked)}
              />
            </View>
          )}
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
