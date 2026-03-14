import { Icons } from "@/config";
import { useFetchClientById } from "@/services/clients";
import { useFetchUpcomingTasks } from "@/services/tasks/useUpcomingTasks";
import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import type { TaskDetails } from "@repo/models";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { ViewClient } from "../clients/viewClient";

const HARDCODED_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

const CalendarIcon = Icons.CalendarBlank;
const CalendarCheckIcon = Icons.CalendarCheckIcon;
const DotsIcon = Icons.DotsThreeVertical;

export type EventType = "appointment" | "task" | "other";

export interface UpcomingEvent {
  id: string;
  title: string;
  time: string;
  type: EventType;
  tagName?: string;
  clientId?: string;
  onOptionsPress?: () => void;
  onClientPress?: () => void;
  onTimePress?: () => void;
}

// task_type_name, task_status_name, client_first_name, client_last_name are joined columns from the DB query — not nested objects.
type TaskDetailsWithFlatFields = TaskDetails & {
  task_type_name?: string | null;
  task_status_name?: string | null;
  client_first_name?: string | null;
  client_last_name?: string | null;
};

function getLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function mapTaskToEvent(task: TaskDetailsWithFlatFields): UpcomingEvent {
  const isAppointment = task.task_type_name === "APPOINTMENT";
  const clientFirstName = task.client_first_name ?? null;

  return {
    id: task.task_id,
    title: isAppointment ? "Appointment with" : task.task_title,
    time: task.start_date ? formatTime(task.start_date) : "—",
    type: isAppointment ? "appointment" : "task",
    tagName:
      isAppointment && clientFirstName ? `#${clientFirstName}` : undefined,
    clientId: task.client_id ?? undefined,
  };
}

// Loads client by ID and opens ViewClient
function ClientDetailLoader({
  clientId,
  onClose,
}: {
  clientId: string;
  onClose: () => void;
}) {
  const { data: client, isLoading } = useFetchClientById(clientId);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Color.White,
        }}
      >
        <ActivityIndicator size="large" color={Color.Green} />
      </View>
    );
  }

  if (!client) return null;

  return <ViewClient client={client} visible={true} onClose={onClose} />;
}

function EventCard({
  title,
  time,
  type,
  tagName,
  clientId,
  onOptionsPress,
  onClientPress,
  onTimePress,
}: UpcomingEvent) {
  const bodyLarge = textStyles[TextVariant.Body][TextSize.Large];
  const bodySmall = textStyles[TextVariant.Body][TextSize.Small];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: Color.White,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#E8E8E8",
        paddingVertical: 12,
        paddingHorizontal: 14,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.07,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 34,
          height: 34,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 10,
        }}
      >
        {type === "task" ? (
          <CalendarCheckIcon size={22} color={Color.Black} />
        ) : (
          <CalendarIcon size={22} color={Color.Black} />
        )}
      </View>

      {/* Text block */}
      <View style={{ flex: 1 }}>
        {/* Title row: plain title + tappable client tag */}
        <Text
          style={{
            fontFamily: "DMSans",
            fontSize: bodyLarge.fontSize,
            fontWeight: "400",
            color: Color.Black,
          }}
        >
          {title}
          {tagName ? " " : ""}
          {tagName && clientId ? (
            <Text
              onPress={onClientPress}
              style={{
                fontFamily: "DMSans",
                fontSize: bodyLarge.fontSize,
                fontWeight: "600",
                color: Color.TextGreen,
              }}
            >
              {tagName}
            </Text>
          ) : tagName ? (
            <Text
              style={{
                fontFamily: "DMSans",
                fontSize: bodyLarge.fontSize,
                fontWeight: "600",
                color: Color.TextGreen,
              }}
            >
              {tagName}
            </Text>
          ) : null}
        </Text>

        {/* Tappable time → navigates to calendar tab */}
        <TouchableOpacity onPress={onTimePress} activeOpacity={0.6} hitSlop={6}>
          <Text
            style={{
              fontFamily: "DMSans",
              fontSize: bodySmall.fontSize,
              fontWeight: "400",
              color: Color.TextGreen,
              marginTop: 2,
            }}
          >
            @{time}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options menu */}
      <TouchableOpacity onPress={onOptionsPress} hitSlop={8}>
        <DotsIcon size={18} color={Color.Grey} />
      </TouchableOpacity>
    </View>
  );
}

export function UpcomingEventCard() {
  const router = useRouter();
  const today = getLocalDateString();
  const { data, isLoading } = useFetchUpcomingTasks(HARDCODED_USER_ID, today);

  // Track which client's detail modal is open (by client_id)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <ActivityIndicator color={Color.Green} />
      </View>
    );
  }

  const tasks = (data?.tasks ?? []) as TaskDetailsWithFlatFields[];

  if (tasks.length === 0) {
    return (
      <View style={{ paddingVertical: 24, alignItems: "center" }}>
        <Text style={{ fontFamily: "DMSans", fontSize: 14, color: Color.Grey }}>
          No upcoming events for today
        </Text>
      </View>
    );
  }

  return (
    <>
      <View style={{ paddingHorizontal: 20, gap: 10 }}>
        {tasks.map((task) => {
          const event = mapTaskToEvent(task);
          return (
            <EventCard
              key={event.id}
              {...event}
              onClientPress={
                event.clientId
                  ? () => setSelectedClientId(event.clientId!)
                  : undefined
              }
              onTimePress={() => {
                // Update the route string to match exact tab filename in app/(tabs)/
                router.navigate("/(tabs)/schedule" as any);
              }}
              onOptionsPress={() =>
                console.log("Options pressed for", event.id)
              }
            />
          );
        })}
      </View>

      {/* Client detail modal — rendered outside the list so it overlays everything */}
      {selectedClientId && (
        <ClientDetailLoader
          clientId={selectedClientId}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </>
  );
}
