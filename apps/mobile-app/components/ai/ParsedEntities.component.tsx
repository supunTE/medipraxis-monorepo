import { DateTimePickerComponent, TextComponent } from "@/components/basic";
import type { ParsedInput } from "@/lib/nlp";
import type { ClientDisplay } from "@/services/clients/useClients";
import { Color, TextSize, TextVariant } from "@repo/config";
import {
  CalendarIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  UserIcon,
  XIcon,
} from "phosphor-react-native";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ParsedEntitiesProps {
  parsed: ParsedInput | null;
  onInputChange: (newText: string) => void;
  clients?: ClientDisplay[];
}

interface LocalPerson {
  text: string;
  nerText: string;
  clientId?: string;
}

interface LocalDate {
  displayText: string;
  isoDate: string;
  nerText: string;
}

function findAndReplace(
  text: string,
  find: string,
  replacement: string
): string {
  const idx = text.toLowerCase().indexOf(find.toLowerCase());
  if (idx === -1) return text;
  return text.slice(0, idx) + replacement + text.slice(idx + find.length);
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function isoToPromptDate(isoString: string): string {
  const datePart = isoString.split("T")[0] ?? "";
  const parts = datePart.split("-");
  const year = parts[0];
  const month = parseInt(parts[1] ?? "1", 10);
  const day = parseInt(parts[2] ?? "1", 10);
  return `${MONTHS[month - 1] ?? ""} ${day}, ${year}`;
}

function isoToDisplayDate(isoString: string): string {
  const datePart = isoString.split("T")[0] ?? "";
  const parts = datePart.split("-");
  const year = parseInt(parts[0] ?? "0");
  const month = parseInt(parts[1] ?? "1", 10);
  const day = parseInt(parts[2] ?? "1", 10);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (date.getTime() === today.getTime())
    return `Today · ${SHORT_MONTHS[month - 1] ?? ""} ${day}`;
  if (date.getTime() === tomorrow.getTime())
    return `Tomorrow · ${SHORT_MONTHS[month - 1] ?? ""} ${day}`;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

interface ClientPickerModalProps {
  visible: boolean;
  clients: ClientDisplay[];
  onSelect: (client: ClientDisplay) => void;
  onClose: () => void;
}

function ClientPickerModal({
  visible,
  clients,
  onSelect,
  onClose,
}: ClientPickerModalProps) {
  const [query, setQuery] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-4"
        onPress={onClose}
      >
        <Pressable onPress={(e) => e.stopPropagation()}>
          <View className="bg-white rounded-3xl overflow-hidden w-72">
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Large}
                color={Color.Black}
              >
                Select patient
              </TextComponent>
              <TouchableOpacity onPress={onClose} className="p-1">
                <XIcon size={20} color={Color.Grey} weight="bold" />
              </TouchableOpacity>
            </View>

            {/* Search input */}
            <View className="mx-4 mb-3 flex-row items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
              <MagnifyingGlassIcon size={16} color={Color.Grey} weight="bold" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search patients..."
                placeholderTextColor={Color.Grey}
                className="flex-1 text-sm"
                autoFocus
              />
            </View>

            {/* Patient list */}
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              style={{ maxHeight: 280 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    setQuery("");
                  }}
                  className="flex-row items-center gap-3 px-5 py-3 active:bg-gray-50"
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: item.color }}
                  >
                    <TextComponent
                      variant={TextVariant.Body}
                      size={TextSize.Small}
                      color={Color.White}
                    >
                      {item.initial}
                    </TextComponent>
                  </View>
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Medium}
                    color={Color.Black}
                  >
                    {item.name}
                  </TextComponent>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View className="px-5 py-6 items-center">
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Grey}
                  >
                    No patients found
                  </TextComponent>
                </View>
              }
            />

            <View className="h-4" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function ParsedEntities({
  parsed,
  onInputChange,
  clients = [],
}: ParsedEntitiesProps) {
  const [datePickerIndex, setDatePickerIndex] = useState<number | null>(null);
  const [clientPickerIndex, setClientPickerIndex] = useState<number | null>(
    null
  );

  // ── Stable local entity snapshot ────────────────────────────────────────────
  // Persists confirmed selections even when re-parse loses the entity (e.g.
  // compromise not detecting a replaced non-English name).
  const [localPeople, setLocalPeople] = useState<LocalPerson[]>([]);
  const [localDates, setLocalDates] = useState<LocalDate[]>([]);
  const [localTimes, setLocalTimes] = useState<string[]>([]);

  useEffect(() => {
    if (!parsed) {
      setLocalPeople([]);
      setLocalDates([]);
      setLocalTimes([]);
      return;
    }
    if (parsed.entities.people.length > 0) {
      setLocalPeople(
        parsed.entities.people.map((p) => ({
          text: p.suggestedClient?.name ?? p.text,
          nerText: p.text,
          clientId: p.suggestedClient?.id,
        }))
      );
    }
    if (parsed.entities.dates.length > 0) {
      setLocalDates(
        parsed.entities.dates.map((d) => ({
          displayText: d.displayText,
          isoDate: d.resolved.toISOString().split("T")[0] ?? "",
          nerText: d.text,
        }))
      );
    }
    if (parsed.entities.times.length > 0) {
      setLocalTimes(parsed.entities.times.map((t) => t.resolved));
    }
  }, [parsed]);

  const hasChips =
    localPeople.length > 0 || localDates.length > 0 || localTimes.length > 0;

  if (!hasChips) return null;

  const baseText = parsed?.normalizedText ?? "";

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-2"
        contentContainerClassName="flex-row gap-2 px-1 items-center"
      >
        {/* ── Person chips ─────────────────────────────────────────────── */}
        {localPeople.map((person, i) => (
          <Pressable
            key={`person-${i}`}
            onPress={() => setClientPickerIndex(i)}
            className="flex-row items-center gap-1.5 bg-purple-100 rounded-full px-3 py-1.5 active:opacity-70"
          >
            <UserIcon size={13} color="#7C3AED" weight="fill" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              style={{ color: "#7C3AED" }}
            >
              {person.text}
            </TextComponent>
          </Pressable>
        ))}

        {localDates.map((date, i) => (
          <Pressable
            key={`date-${i}`}
            onPress={() => setDatePickerIndex(i)}
            className="flex-row items-center gap-1.5 bg-green-100 rounded-full px-3 py-1.5 active:opacity-70"
          >
            <CalendarIcon size={13} color="#16A34A" weight="fill" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              style={{ color: "#16A34A" }}
            >
              {date.displayText}
            </TextComponent>
          </Pressable>
        ))}

        {/* ── Time chips (display only) ─────────────────────────────────── */}
        {localTimes.map((time, i) => (
          <View
            key={`time-${i}`}
            className="flex-row items-center gap-1.5 bg-amber-100 rounded-full px-3 py-1.5"
          >
            <ClockIcon size={13} color="#D97706" weight="fill" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              style={{ color: "#D97706" }}
            >
              {time}
            </TextComponent>
          </View>
        ))}
      </ScrollView>

      {datePickerIndex !== null &&
        localDates[datePickerIndex] &&
        (() => {
          const localDate = localDates[datePickerIndex]!;
          return (
            <View style={{ height: 0, overflow: "hidden" }}>
              <DateTimePickerComponent
                mode="date"
                autoOpen
                value={localDate.isoDate}
                hideHelperText
                onChange={(isoString) => {
                  const promptDate = isoToPromptDate(isoString);
                  const newDisplayText = isoToDisplayDate(isoString);
                  const newIsoDate = isoString.split("T")[0] ?? "";
                  const newText = findAndReplace(
                    baseText,
                    localDate.nerText,
                    promptDate
                  );
                  setLocalDates((prev) =>
                    prev.map((d, idx) =>
                      idx === datePickerIndex
                        ? {
                            displayText: newDisplayText,
                            isoDate: newIsoDate,
                            nerText: promptDate,
                          }
                        : d
                    )
                  );
                  onInputChange(newText);
                  setDatePickerIndex(null);
                }}
                onDismiss={() => setDatePickerIndex(null)}
              />
            </View>
          );
        })()}

      {clientPickerIndex !== null &&
        localPeople[clientPickerIndex] &&
        (() => {
          const localPerson = localPeople[clientPickerIndex]!;
          return (
            <ClientPickerModal
              visible
              clients={clients}
              onSelect={(client) => {
                const newText = findAndReplace(
                  baseText,
                  localPerson.nerText,
                  client.name
                );
                setLocalPeople((prev) =>
                  prev.map((p, idx) =>
                    idx === clientPickerIndex
                      ? {
                          text: client.name,
                          nerText: client.name,
                          clientId: client.id,
                        }
                      : p
                  )
                );
                onInputChange(newText);
                setClientPickerIndex(null);
              }}
              onClose={() => setClientPickerIndex(null)}
            />
          );
        })()}
    </>
  );
}
