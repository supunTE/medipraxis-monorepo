import {
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
import { useFetchClients } from "@/services/clients/useClients";
import {
  EVENT_TYPES,
  useTaskHandler,
  type EventType,
} from "@/services/tasks/useTaskHandler";
import { Color, TextSize, TextVariant } from "@repo/config";
import type { SlotWindow } from "@repo/models";
import React, { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  initialClientId?: string;
  initialSlotWindowId?: string;
  slotWindows?: SlotWindow[];
};

export default function TaskForm({ visible, onClose, initialClientId, initialSlotWindowId, slotWindows = [] }: Props) {
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
    control,
    watch,
    setValue,
    errors,
    handleSave,
    resetForm,
    switchEventType,
    toggleAttachToSlot,
    toggleRecurring,
    averageMinutesPerSlot,
    userId,
    isPending,
  } = useTaskHandler(onClose);

  // Pre-select client + switch to Appointment when opened with initialClientId
  useEffect(() => {
    if (visible && initialClientId) {
      switchEventType(EVENT_TYPES.APPOINTMENT);
      setValue("client", initialClientId);
    }
  }, [visible, initialClientId]);

  // Pre-select slot window + switch to Appointment (attach to slot) when opened from an empty slot
  useEffect(() => {
    if (visible && initialSlotWindowId) {
      switchEventType(EVENT_TYPES.APPOINTMENT);
      setValue("attachToSlot", true);
      setValue("slotWindow", initialSlotWindowId);
    }
  }, [visible, initialSlotWindowId]);

  const [showEndDateTime, setShowEndDateTime] = useState(false);

  // Watched values for conditional rendering
  const eventType = watch("eventType");
  const isRecurring = watch("isRecurring");
  const attachToSlot = watch("attachToSlot");
  const repeatDays = watch("repeatDays") ?? [];

  const { data: clients = [] } = useFetchClients(userId);
  const clientOptions = useMemo(
    () => clients.map((c) => ({ label: c.name, value: c.id })),
    [clients]
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return "th";
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  const formatDateWithDay = (dateStr: string) => {
    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString([], { weekday: "short" });
    const dayOfMonth = d.getDate();
    return `${dayOfMonth}${getOrdinalSuffix(dayOfMonth)} ${dayName}`;
  };

  const slotWindowOptions = useMemo(
    () =>
      slotWindows.map((sw) => ({
        label: `${formatDateWithDay(sw.start_date)} ${formatTime(sw.start_date)}-${formatTime(sw.end_date)}`,
        value: sw.slot_window_id,
      })),
    [slotWindows]
  );

  const toggleDay = (dayIndex: number) => {
    const updated = repeatDays.includes(dayIndex)
      ? repeatDays.filter((d: number) => d !== dayIndex)
      : [...repeatDays, dayIndex];
    setValue("repeatDays", updated);
  };

  return (
    <>
      {/* Overlay modal — covers status bar with dark background */}
      <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
      </Modal>

      {/* Form modal */}
      <Modal visible={visible} animationType="slide" transparent>
        {/* Pseudo wrapper — transparent so overlay shows through the padding gaps */}
        <View style={{ flex: 1, justifyContent: "center", padding: 12, backgroundColor: "transparent" }}>
          <View style={{ backgroundColor: "white", borderRadius: 20, overflow: "hidden", maxHeight: "92%" }}>

            <ScrollView contentContainerClassName="p-5 pb-[150px]" keyboardShouldPersistTaps="handled">
              <TextComponent variant={TextVariant.Title} size={TextSize.Large} className="mb-5">
                Schedule New Event
              </TextComponent>

              {/* Event Type */}
              <Controller
                control={control}
                name="eventType"
                render={({ field: { value } }) => (
                  <RadioGroupComponent
                    value={value}
                    onChange={(val) => switchEventType(val as EventType)}
                    options={eventTypes.map((type) => ({ label: EVENT_TYPE_LABELS[type], value: type }))}
                    className="mb-4 gap-3 flex-col"
                  />
                )}
              />

              {/* ── APPOINTMENT SLOT WINDOW ── */}
              {eventType === EVENT_TYPES.APPOINTMENT_SLOT_WINDOW && (
                <>
                  <ToggleButton label="Recurring" isActive={isRecurring} onToggle={toggleRecurring} />

                  <View className="gap-4 mt-2.5">
                    <Controller
                      control={control}
                      name="location"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          label="Location"
                          inputField={{ value, onChangeText: onChange, placeholder: "Care - Medical Centre" }}
                          inputType={TextInputType.Text}
                          errorText={errors.location?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="totalSlots"
                      render={({ field: { onChange, value } }) => (
                        <TextInputComponent
                          label="Number of Slots"
                          inputField={{
                            value: value !== undefined ? String(value) : "",
                            onChangeText: (v) => onChange(Number(v)),
                            placeholder: "10",
                          }}
                          inputType={TextInputType.Number}
                          helperText={averageMinutesPerSlot ? `Average ${averageMinutesPerSlot}mins per slot` : ""}
                          errorText={errors.totalSlots?.message}
                        />
                      )}
                    />

                    {!isRecurring && (
                      <Controller
                        control={control}
                        name="slotDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePickerComponent
                            label="Date"
                            value={value}
                            onChange={onChange}
                            placeholder="Nov 15, 2025"
                            mode="date"
                            errorText={errors.slotDate?.message}
                          />
                        )}
                      />
                    )}

                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field: { onChange, value } }) => (
                        <DateTimePickerComponent
                          label="Start time"
                          value={value}
                          onChange={onChange}
                          placeholder="08:00 am"
                          mode="time"
                          errorText={errors.startDate?.message}
                        />
                      )}
                    />

                    <Controller
                      control={control}
                      name="endDate"
                      render={({ field: { onChange, value } }) => (
                        <DateTimePickerComponent
                          label="End time"
                          value={value}
                          onChange={onChange}
                          placeholder="11:30 am"
                          mode="time"
                          errorText={errors.endDate?.message}
                        />
                      )}
                    />

                    {isRecurring && (
                      <>
                        <Controller
                          control={control}
                          name="repeatUntil"
                          render={({ field: { onChange, value } }) => (
                            <DateTimePickerComponent
                              label="Repeat Until"
                              value={value}
                              onChange={onChange}
                              placeholder="Nov 15, 2025"
                              mode="date"
                              errorText={errors.repeatUntil?.message}
                            />
                          )}
                        />

                        <View>
                          <TextComponent variant={TextVariant.Body} size={TextSize.Large} className="mb-2">
                            Repeat
                          </TextComponent>
                          {errors.repeatDays && (
                            <TextComponent variant={TextVariant.Body} size={TextSize.Small} color={Color.Danger}>
                              {errors.repeatDays.message}
                            </TextComponent>
                          )}
                          <View className="flex-row mt-1.5">
                            {days.map((day, index) => (
                              <TouchableOpacity
                                key={index}
                                onPress={() => toggleDay(index)}
                                className="w-9 h-9 rounded-full items-center justify-center mr-2 bg-[#FFF8E1]"
                                style={repeatDays.includes(index) ? { backgroundColor: Color.Green } : undefined}
                              >
                                <TextComponent
                                  variant={TextVariant.Body}
                                  size={TextSize.Medium}
                                  color={repeatDays.includes(index) ? Color.White : Color.Black}
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
                </>
              )}

              {/* ── APPOINTMENT ── */}
              {eventType === EVENT_TYPES.APPOINTMENT && (
                <View className="gap-4 mt-2.5">
                  {!attachToSlot ? (
                    <>
                      <Controller
                        control={control}
                        name="taskTitle"
                        render={({ field: { onChange, value } }) => (
                          <TextInputComponent
                            label="Enter the title"
                            inputField={{ value, onChangeText: onChange, placeholder: "Enter the title" }}
                            inputType={TextInputType.Text}
                            errorText={errors.taskTitle?.message}
                          />
                        )}
                      />

                      <TouchableOpacity className="my-1.5" onPress={() => toggleAttachToSlot(true)}>
                        <TextComponent variant={TextVariant.Body} size={TextSize.Medium} className="text-[#666] font-medium">
                          + Attach to an Appointment slot window
                        </TextComponent>
                      </TouchableOpacity>

                      <Controller
                        control={control}
                        name="location"
                        render={({ field: { onChange, value } }) => (
                          <TextInputComponent
                            label="Location"
                            inputField={{ value, onChangeText: onChange, placeholder: "Care - Medical Centre" }}
                            inputType={TextInputType.Text}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="client"
                        render={({ field: { onChange, value } }) => (
                          <DropdownComponent
                            label="Client Details"
                            value={value}
                            onValueChange={onChange}
                            options={clientOptions}
                            placeholder="Select Client"
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="startDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePickerComponent
                            label="Start Date & time"
                            value={value}
                            onChange={onChange}
                            placeholder="Nov 15, 2025  08:00 am"
                            mode="datetime"
                            errorText={errors.startDate?.message}
                          />
                        )}
                      />

                      <Controller
                        control={control}
                        name="endDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePickerComponent
                            label="End Date & time"
                            value={value}
                            onChange={onChange}
                            placeholder="Nov 15, 2025  11:30 am"
                            mode="datetime"
                            errorText={errors.endDate?.message}
                          />
                        )}
                      />
                    </>
                  ) : (
                    <>
                      <Controller
                        control={control}
                        name="slotWindow"
                        render={({ field: { onChange, value } }) => (
                          <DropdownComponent
                            label="Slot Window"
                            value={value}
                            onValueChange={onChange}
                            options={slotWindowOptions}
                            placeholder="Select Slot Window"
                            helperText="First available slot number will be reserved"
                            errorText={errors.slotWindow?.message}
                          />
                        )}
                      />

                      <TouchableOpacity className="my-1.5" onPress={() => toggleAttachToSlot(false)}>
                        <TextComponent variant={TextVariant.Body} size={TextSize.Medium} color={Color.Danger} className="font-medium">
                          - Remove Appointment Slot
                        </TextComponent>
                      </TouchableOpacity>

                      <Controller
                        control={control}
                        name="client"
                        render={({ field: { onChange, value } }) => (
                          <DropdownComponent
                            label="Client Details"
                            value={value}
                            onValueChange={onChange}
                            options={clientOptions}
                            placeholder="Select Client"
                            errorText={errors.client?.message}
                          />
                        )}
                      />
                    </>
                  )}
                </View>
              )}

              {/* ── REMINDER / TASK ── */}
              {eventType === EVENT_TYPES.TASK && (
                <View className="gap-4 mt-2.5">
                  <Controller
                    control={control}
                    name="taskTitle"
                    render={({ field: { onChange, value } }) => (
                      <TextInputComponent
                        label="Enter the title"
                        inputField={{ value, onChangeText: onChange, placeholder: "Enter the title" }}
                        inputType={TextInputType.Text}
                        errorText={errors.taskTitle?.message}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="client"
                    render={({ field: { onChange, value } }) => (
                      <DropdownComponent
                        label="Client Details"
                        value={value}
                        onValueChange={onChange}
                        options={clientOptions}
                        placeholder="Select Client"
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name="startDate"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePickerComponent
                        label="Start Date & time"
                        value={value}
                        onChange={onChange}
                        placeholder="Nov 15, 2025  08:00 am"
                        mode="datetime"
                        errorText={errors.startDate?.message}
                      />
                    )}
                  />

                  {!showEndDateTime ? (
                    <TouchableOpacity className="my-1.5" onPress={() => setShowEndDateTime(true)}>
                      <TextComponent variant={TextVariant.Body} size={TextSize.Medium} className="text-[#666] font-medium">
                        + Add End Date & time
                      </TextComponent>
                    </TouchableOpacity>
                  ) : (
                    <View>
                      <Controller
                        control={control}
                        name="endDate"
                        render={({ field: { onChange, value } }) => (
                          <DateTimePickerComponent
                            label="End Date & time"
                            value={value}
                            onChange={onChange}
                            placeholder="Nov 15, 2025  08:00 am"
                            mode="datetime"
                          />
                        )}
                      />
                      <TouchableOpacity
                        className="my-1.5"
                        onPress={() => { setShowEndDateTime(false); setValue("endDate", ""); }}
                      >
                        <TextComponent variant={TextVariant.Body} size={TextSize.Medium} color={Color.Danger} className="font-medium">
                          - Remove End Date & time
                        </TextComponent>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}

              {/* Note */}
              {!(eventType === EVENT_TYPES.APPOINTMENT && attachToSlot) && (
                <View className="gap-4 mt-4">
                  <Controller
                    control={control}
                    name="note"
                    render={({ field: { onChange, value } }) => (
                      <TextAreaComponent
                        label="Note"
                        inputField={{
                          value: value ?? "",
                          onChangeText: onChange,
                          placeholder: "Type additional notes here",
                        }}
                      />
                    )}
                  />
                </View>
              )}

              {/* Alarm — Task only */}
              {eventType === EVENT_TYPES.TASK && (
                <View className="mt-2.5 flex-row items-center">
                  <Controller
                    control={control}
                    name="alarm"
                    render={({ field: { onChange, value } }) => (
                      <CheckboxComponent
                        label="Do you want to set an alarm"
                        isChecked={value}
                        onChange={onChange}
                      />
                    )}
                  />
                </View>
              )}
            </ScrollView>

            {/* Action Footer */}
            <View className="absolute bottom-0 w-full bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
              <Pressable
                className="flex-row items-center py-2.5 px-6 rounded-lg"
                style={{ backgroundColor: Color.LightCream, borderWidth: 1, borderColor: Color.LightGrey }}
                onPress={() => { resetForm(); onClose(); }}
              >
                <TextComponent variant={TextVariant.Body} size={TextSize.Medium} color={Color.Black}>
                  Close
                </TextComponent>
              </Pressable>
              <Pressable
                className="flex-row items-center bg-slate-900 py-2.5 px-6 rounded-lg gap-x-2"
                onPress={handleSave}
                disabled={isPending}
              >
                <Icons.Check size={18} color="white" weight="bold" />
                <TextComponent variant={TextVariant.Body} size={TextSize.Medium} color={Color.White}>
                  {isPending ? "Saving..." : "Save"}
                </TextComponent>
              </Pressable>
            </View>

          </View>
        </View>
      </Modal>
    </>
  );
}
