import { useFetchClients } from "@/services/clients/useClients";
import { useGetSlotWindows } from "@/services/slot-windows/useGetSlotWindows";
import {
  EVENT_TYPES,
  useTaskHandler,
  type EventType,
} from "@/services/tasks/useTaskHandler";
import React, { useMemo, useState } from "react";
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

  const {
    formState,
    setField,
    handleSave,
    resetForm,
    switchEventType,
    toggleAttachToSlot,
    toggleRecurring,
    isPending,
  } = useTaskHandler(onClose);
  const [showEndDateTime, setShowEndDateTime] = useState(false);

  const { data: clients = [] } = useFetchClients(formState.userId);

  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        label: c.name,
        value: c.id,
      })),
    [clients]
  );

  const { data: slotWindows = [] } = useGetSlotWindows({
    userId: formState.userId,
  });

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
    slotDate,
    repeatUntil,
    isRecurring,
  } = formState;

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([], { weekday: "short" });
  };

  const slotWindowOptions = useMemo(
    () =>
      slotWindows.map((sw) => ({
        label: `${formatDay(sw.start_date)} ${formatTime(sw.start_date)}-${formatTime(sw.end_date)}`,
        value: sw.slot_window_id,
      })),
    [slotWindows]
  );

  const selectedSlotWindow = useMemo(
    () => slotWindows.find((sw) => sw.slot_window_id === slotWindow),
    [slotWindows, slotWindow]
  );

  const slotNoOptions = useMemo(() => {
    if (!selectedSlotWindow) return [];
    const { total_slots, start_date, end_date } = selectedSlotWindow;
    const startMs = new Date(start_date).getTime();
    const endMs = new Date(end_date).getTime();
    const slotDuration = (endMs - startMs) / total_slots;

    return Array.from({ length: total_slots }, (_, i) => {
      const slotTime = new Date(startMs + i * slotDuration);
      const time = slotTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      return {
        label: `No. ${String(i + 1).padStart(2, "0")} (${time})`,
        value: String(i + 1),
      };
    });
  }, [selectedSlotWindow]);

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
      <View className="flex-1 bg-white">
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
            onChange={(val) => switchEventType(val as EventType)}
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
              onToggle={toggleRecurring}
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
                  value={slotDate}
                  onChange={(v) => setField("slotDate", v)}
                  placeholder="Nov 15, 2025"
                  mode="date"
                />
              )}

              <DateTimePickerComponent
                label="Start time"
                value={startDate}
                onChange={(v) => setField("startDate", v)}
                placeholder="08:00 am"
                mode="time"
              />

              <DateTimePickerComponent
                label="End time"
                value={endDate}
                onChange={(v) => setField("endDate", v)}
                placeholder="11:30 am"
                mode="time"
              />

              {isRecurring && (
                <>
                  <DateTimePickerComponent
                    label="Repeat Until"
                    value={repeatUntil}
                    onChange={(v) => setField("repeatUntil", v)}
                    placeholder="Nov 15, 2025"
                    mode="date"
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
                    onPress={() => toggleAttachToSlot(true)}
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
                    onPress={() => toggleAttachToSlot(false)}
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
                mode="datetime"
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
                    mode="datetime"
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

          {/* Note Field */}
          {!(eventType === EVENT_TYPES.APPOINTMENT && attachToSlot) && (
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
          )}

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
                onPress={() => {
                  resetForm();
                  onClose();
                }}
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
