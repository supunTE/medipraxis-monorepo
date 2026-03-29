import React, { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ButtonComponent,
  ButtonSize,
  ChipComponent,
  ChipVariant,
  TextComponent,
} from "@/components/basic";
import { Text } from "@/components/Themed";
import { Icons } from "@/config";
import { useGetAppointments } from "@/services/tasks/useGetAppointments";
import { useDeactivateSlotWindowTemplate } from "@/services/slotWindows/useDeactivateSlotWindowTemplate";
import { useDeleteSlotWindowTemplate } from "@/services/slotWindows/useDeleteSlotWindowTemplate";
import { useGetSlotWindowTemplates } from "@/services/slotWindows/useGetSlotWindowTemplates";
import { useGetSlotWindows } from "@/services/slotWindows/useGetSlotWindows";
import { useCancelSlotWindow } from "@/services/slotWindows/useCancelSlotWindow";
import { Color, TextSize, TextVariant } from "@repo/config";
import { type SlotWindow, type SlotWindowTemplate } from "@repo/models";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AgendaBlockModal } from "@/components/advanced/calendar/AgendaBlockModal.component";
import { type AgendaBlockContent } from "@/components/advanced/calendar/calendar.types";

/* ─── helpers ─────────────────────────────────────────────── */

const DAY_SHORT: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const DAY_ORDER: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

function formatDays(days: string[]): string {
  return [...days]
    .sort((a, b) => (DAY_ORDER[a] ?? 8) - (DAY_ORDER[b] ?? 8))
    .map((d) => DAY_SHORT[d] ?? d)
    .join(", ");
}

// "HH:MM:SS" → "h:mm am/pm"
function formatTimePart(time: string): string {
  const [hStr, mStr] = time.split(":");
  const h = parseInt(hStr ?? "0", 10);
  const m = mStr ?? "00";
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m} ${suffix}`;
}

// ISO timestamp → "h:mm am/pm"
// Uses getUTC* because datetimes are stored as "naive local time treated as UTC".
function formatISOTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const suffix = h >= 12 ? "pm" : "am";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m} ${suffix}`;
}

// ISO timestamp or date string → "d MMM yyyy"
// Uses timeZone:"UTC" so date-only strings ("YYYY-MM-DD") and naive datetime
// strings both resolve to the correct calendar date.
function formatISODate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/* ─── sub-components ──────────────────────────────────────── */

/** Compact row for a single slot window instance inside a template card */
function TemplateInstanceItem({
  slotWindow,
  templateLocation,
  onPress,
}: {
  slotWindow: SlotWindow;
  templateLocation: string | null;
  onPress: () => void;
}) {
  const filled = slotWindow.slots_filled;
  const total = slotWindow.total_slots;
  const isFull = filled >= total;
  // Only show location if it differs from the template's location
  const showLocation =
    slotWindow.location && slotWindow.location !== templateLocation;

  return (
    <Pressable
      className="flex-row justify-between items-center py-2.5 border-t border-gray-100"
      onPress={onPress}
    >
      <View className="flex-1 mr-3">
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Black}
        >
          {formatISODate(slotWindow.start_date)}
        </TextComponent>
        {showLocation ? (
          <View className="flex-row items-center gap-1 mt-0.5">
            <Icons.MapPin size={11} color={Color.Grey} weight="regular" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              color={Color.Grey}
            >
              {slotWindow.location}
            </TextComponent>
          </View>
        ) : null}
      </View>
      <ChipComponent
        text={`${filled}/${total} filled`}
        variant={isFull ? ChipVariant.Warning : ChipVariant.LightGreen}
      />
    </Pressable>
  );
}

function RecurringItem({
  template,
  instances,
  onDeactivate,
  onDelete,
  onInstancePress,
}: {
  template: SlotWindowTemplate;
  instances: SlotWindow[];
  onDeactivate: () => void;
  onDelete: () => void;
  onInstancePress: (sw: SlotWindow) => void;
}) {
  const sortedInstances = [...instances].sort(
    (a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
  );

  return (
    <View
      className="bg-white rounded-xl p-4 mb-3"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Days + Active badge */}
      <View className="flex-row justify-between items-center mb-2">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          style={{ flex: 1, marginRight: 8 }}
        >
          {formatDays(template.day_of_week)}
        </TextComponent>
        <ChipComponent
          text={template.is_active ? "Active" : "Inactive"}
          variant={template.is_active ? ChipVariant.LightGreen : ChipVariant.LightGrey}
        />
      </View>

      {/* Time */}
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icons.Clock size={13} color={Color.Grey} weight="regular" />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Grey}
        >
          {formatTimePart(template.start_time)} – {formatTimePart(template.end_time)}
        </TextComponent>
      </View>

      {/* Slots */}
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icons.CalendarBlank size={13} color={Color.Grey} weight="regular" />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Grey}
        >
          {template.total_slots} slot{template.total_slots !== 1 ? "s" : ""}
        </TextComponent>
      </View>

      {/* Location */}
      {template.location ? (
        <View className="flex-row items-center gap-1.5 mb-1">
          <Icons.MapPin size={13} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {template.location}
          </TextComponent>
        </View>
      ) : null}

      {/* End date */}
      {template.end_date ? (
        <View className="flex-row items-center gap-1.5">
          <Icons.Calendar size={13} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            Ends {template.end_date}
          </TextComponent>
        </View>
      ) : null}

      {/* Slot window instances generated from this template */}
      {sortedInstances.length > 0 && (
        <View className="mt-3">
          {sortedInstances.map((sw) => (
            <TemplateInstanceItem
              key={sw.slot_window_id}
              slotWindow={sw}
              templateLocation={template.location}
              onPress={() => onInstancePress(sw)}
            />
          ))}
        </View>
      )}

      {/* Action footer */}
      <View className="flex-row justify-end gap-x-2 mt-3 pt-3 border-t border-gray-100">
        {template.is_active && (
          <Pressable
            className="flex-row items-center bg-slate-900 py-2 px-3 rounded-lg gap-x-1.5"
            onPress={onDeactivate}
          >
            <Icons.CalendarBlank size={14} color="white" weight="bold" />
            <Text lightColor="white" darkColor="white" className="text-xs font-semibold">
              Deactivate
            </Text>
          </Pressable>
        )}
        <Pressable
          className="flex-row items-center bg-[#FF5A5F] py-2 px-3 rounded-lg gap-x-1.5"
          onPress={onDelete}
        >
          <Icons.Trash size={14} color="white" weight="bold" />
          <Text lightColor="white" darkColor="white" className="text-xs font-semibold">
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function AdHocItem({
  slotWindow,
  onPress,
}: {
  slotWindow: SlotWindow;
  onPress: () => void;
}) {
  const filled = slotWindow.slots_filled;
  const total = slotWindow.total_slots;
  const isFull = filled >= total;

  return (
    <Pressable
      className="bg-white rounded-xl p-4 mb-3"
      onPress={onPress}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      {/* Date + fill badge */}
      <View className="flex-row justify-between items-center mb-2">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          style={{ flex: 1, marginRight: 8 }}
        >
          {formatISODate(slotWindow.start_date)}
        </TextComponent>
        <ChipComponent
          text={`${filled}/${total} filled`}
          variant={isFull ? ChipVariant.Warning : ChipVariant.LightGreen}
        />
      </View>

      {/* Time */}
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icons.Clock size={13} color={Color.Grey} weight="regular" />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Grey}
        >
          {formatISOTime(slotWindow.start_date)} – {formatISOTime(slotWindow.end_date)}
        </TextComponent>
      </View>

      {/* Total slots */}
      <View className="flex-row items-center gap-1.5 mb-1">
        <Icons.CalendarBlank size={13} color={Color.Grey} weight="regular" />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Grey}
        >
          {total} slot{total !== 1 ? "s" : ""}
        </TextComponent>
      </View>

      {/* Location */}
      {slotWindow.location ? (
        <View className="flex-row items-center gap-1.5">
          <Icons.MapPin size={13} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {slotWindow.location}
          </TextComponent>
        </View>
      ) : null}
    </Pressable>
  );
}

/* ─── main component ──────────────────────────────────────── */

type Tab = "recurring" | "adhoc";

interface ManageSlotWindowsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
}

export function ManageSlotWindowsModal({
  visible,
  onClose,
  userId,
}: ManageSlotWindowsModalProps) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = React.useState<Tab>("recurring");

  // Refresh all relevant caches every time the modal opens
  useEffect(() => {
    if (visible) {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: ["slot-window-templates", userId] }),
        queryClient.invalidateQueries({ queryKey: ["slot-windows", userId] }),
        queryClient.invalidateQueries({ queryKey: ["appointments", userId] }),
      ]);
    }
  }, [visible, userId, queryClient]);

  const [selectedSlotWindow, setSelectedSlotWindow] =
    React.useState<SlotWindow | null>(null);

  const { templates, isLoading: isLoadingTemplates } =
    useGetSlotWindowTemplates(userId);

  // Fetch all appointments (no date) to build per-slot contents for AgendaBlockModal
  const { appointments } = useGetAppointments(userId);

  // Build contents map: slot_window_id → (AgendaBlockContent | null)[]
  const contentsBySlotWindowId = React.useMemo(() => {
    const map = new Map<string, (AgendaBlockContent | null)[]>();
    for (const appt of appointments) {
      if (!appt.slot_window_id) continue;
      const slotIndex =
        appt.appointment_number !== null ? appt.appointment_number - 1 : -1;
      if (slotIndex < 0) continue;
      const existing = map.get(appt.slot_window_id) ?? [];
      // Grow array if needed
      while (existing.length <= slotIndex) existing.push(null);
      const clientName = [appt.client_first_name, appt.client_last_name]
        .filter(Boolean)
        .join(" ");
      existing[slotIndex] = {
        id: appt.task_id,
        title: appt.task_title,
        ...(clientName ? { client: clientName } : {}),
      };
      map.set(appt.slot_window_id, existing);
    }
    return map;
  }, [appointments]);

  const getContentsForSlotWindow = (sw: SlotWindow): (AgendaBlockContent | null)[] => {
    const base = Array.from<AgendaBlockContent | null>(
      { length: sw.total_slots },
      () => null
    );
    const filled = contentsBySlotWindowId.get(sw.slot_window_id) ?? [];
    for (let i = 0; i < filled.length && i < base.length; i++) {
      base[i] = filled[i] ?? null;
    }
    return base;
  };

  const { mutate: cancelSlotWindow } = useCancelSlotWindow({
    onSuccess: () => setSelectedSlotWindow(null),
    onError: (message) => Alert.alert("Error", message),
  });

  const handleSlotWindowPress = (sw: SlotWindow) => setSelectedSlotWindow(sw);

  const handleCancelSlotWindow = () => {
    if (!selectedSlotWindow) return;
    Alert.alert(
      "Cancel Slot Window",
      "This will cancel the slot window and all its appointments. Continue?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => cancelSlotWindow(selectedSlotWindow.slot_window_id),
        },
      ]
    );
  };

  const { mutate: deactivateTemplate } = useDeactivateSlotWindowTemplate({
    onError: (message) => Alert.alert("Error", message),
  });

  const { mutate: deleteTemplate } = useDeleteSlotWindowTemplate({
    onError: (message) => Alert.alert("Error", message),
  });

  const handleDeactivate = (templateId: string) => {
    Alert.alert(
      "Deactivate Template",
      "This will stop generating new slot windows from this template. Existing slot windows will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: () => deactivateTemplate(templateId),
        },
      ]
    );
  };

  const handleDelete = (templateId: string) => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to permanently delete this recurring slot window template? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTemplate(templateId),
        },
      ]
    );
  };

  // Fetch all slot windows (no date filter) for both tabs
  const { slotWindows, isLoading: isLoadingSlotWindows } =
    useGetSlotWindows(userId);

  // ±7-day window centred on today
  const windowedSlotWindows = React.useMemo(() => {
    const now = Date.now();
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const from = now - ONE_WEEK_MS;
    const to = now + ONE_WEEK_MS;
    return slotWindows.filter((sw) => {
      const t = new Date(sw.start_date).getTime();
      return t >= from && t <= to;
    });
  }, [slotWindows]);

  // Ad-hoc: no template_id, within window
  const adHocSlotWindows = windowedSlotWindows.filter(
    (sw) => sw.template_id === null
  );

  // Build a lookup: template_id → SlotWindow[] (instances within window only)
  const instancesByTemplateId = React.useMemo(() => {
    const map = new Map<string, SlotWindow[]>();
    for (const sw of windowedSlotWindows) {
      if (sw.template_id) {
        const list = map.get(sw.template_id) ?? [];
        list.push(sw);
        map.set(sw.template_id, list);
      }
    }
    return map;
  }, [windowedSlotWindows]);

  const isLoading = isLoadingTemplates || isLoadingSlotWindows;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        {/* Header — matches request-report & client detail screens */}
        <View className="px-5 pt-3 pb-6 bg-white">
          <View className="mb-6 self-start">
            <ButtonComponent.BackButton
              onPress={onClose}
              size={ButtonSize.Small}
            />
          </View>

          <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
            Manage Slot Windows
          </TextComponent>
        </View>

        {/* Body — grey background, same as client detail screen */}
        <View className="flex-1 bg-[#F5F5F5]">
          {/* Tab toggles — pill style, same as Appointments / Reports */}
          <View className="px-5 pt-5">
            <View className="flex-row justify-center gap-2 mb-4">
              <TouchableOpacity
                className="px-5 py-2.5 rounded-full"
                style={{
                  backgroundColor:
                    activeTab === "recurring" ? Color.Green : "transparent",
                }}
                onPress={() => setActiveTab("recurring")}
                activeOpacity={0.7}
              >
                <TextComponent
                  variant={TextVariant.Button}
                  size={TextSize.Medium}
                  color={Color.Black}
                >
                  Recurring
                </TextComponent>
              </TouchableOpacity>

              <TouchableOpacity
                className="px-5 py-2.5 rounded-full"
                style={{
                  backgroundColor:
                    activeTab === "adhoc" ? Color.Green : "transparent",
                }}
                onPress={() => setActiveTab("adhoc")}
                activeOpacity={0.7}
              >
                <TextComponent
                  variant={TextVariant.Button}
                  size={TextSize.Medium}
                  color={Color.Black}
                >
                  Ad-hoc
                </TextComponent>
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          {isLoading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Color.Green} />
            </View>
          ) : activeTab === "recurring" ? (
            templates.length === 0 ? (
              <View className="flex-1 justify-center items-center px-8">
                <Icons.CalendarBlank
                  size={48}
                  color={Color.LightGrey}
                  weight="regular"
                />
                <TextComponent
                  variant={TextVariant.Title}
                  size={TextSize.Medium}
                  style={{ marginTop: 16, color: Color.Grey, textAlign: "center" }}
                >
                  No Recurring Slot Windows
                </TextComponent>
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  style={{ marginTop: 8, color: Color.Grey, textAlign: "center" }}
                >
                  Create a recurring slot window from the schedule to set up
                  repeating appointment windows.
                </TextComponent>
              </View>
            ) : (
              <ScrollView
                className="flex-1"
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: insets.bottom + 24,
                }}
                showsVerticalScrollIndicator={false}
              >
                {templates.map((template) => (
                  <RecurringItem
                    key={template.slot_window_template_id}
                    template={template}
                    instances={
                      instancesByTemplateId.get(template.slot_window_template_id) ?? []
                    }
                    onDeactivate={() => handleDeactivate(template.slot_window_template_id)}
                    onDelete={() => handleDelete(template.slot_window_template_id)}
                    onInstancePress={handleSlotWindowPress}
                  />
                ))}
              </ScrollView>
            )
          ) : adHocSlotWindows.length === 0 ? (
            <View className="flex-1 justify-center items-center px-8">
              <Icons.CalendarBlank
                size={48}
                color={Color.LightGrey}
                weight="regular"
              />
              <TextComponent
                variant={TextVariant.Title}
                size={TextSize.Medium}
                style={{ marginTop: 16, color: Color.Grey, textAlign: "center" }}
              >
                No Ad-hoc Slot Windows
              </TextComponent>
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                style={{ marginTop: 8, color: Color.Grey, textAlign: "center" }}
              >
                Ad-hoc slot windows are one-off windows created without a
                recurring schedule.
              </TextComponent>
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingBottom: insets.bottom + 24,
              }}
              showsVerticalScrollIndicator={false}
            >
              {[...adHocSlotWindows]
                .sort(
                  (a, b) =>
                    new Date(b.start_date).getTime() -
                    new Date(a.start_date).getTime()
                )
                .map((sw) => (
                  <AdHocItem
                    key={sw.slot_window_id}
                    slotWindow={sw}
                    onPress={() => handleSlotWindowPress(sw)}
                  />
                ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Slot window detail popup */}
      {selectedSlotWindow && (
        <AgendaBlockModal
          visible={!!selectedSlotWindow}
          onClose={() => setSelectedSlotWindow(null)}
          groupId={selectedSlotWindow.slot_window_id}
          startTime={formatISOTime(selectedSlotWindow.start_date)}
          endTime={formatISOTime(selectedSlotWindow.end_date)}
          slots={selectedSlotWindow.total_slots}
          contents={getContentsForSlotWindow(selectedSlotWindow)}
          onCancelSlotWindow={handleCancelSlotWindow}
        />
      )}
    </Modal>
  );
}
