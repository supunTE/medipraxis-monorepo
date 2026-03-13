import { Icons } from "@/config";
import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import { Text, TouchableOpacity, View } from "react-native";

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
  onOptionsPress?: () => void;
}

const HARDCODED_EVENTS: UpcomingEvent[] = [
  {
    id: "1",
    title: "Appointment with",
    tagName: "#Anna",
    time: "8.00 am",
    type: "appointment",
  },
  {
    id: "2",
    title: "Appointment with",
    tagName: "#Elena",
    time: "8.00 am",
    type: "appointment",
  },
  {
    id: "3",
    title: "Appointment with",
    tagName: "#Stefan",
    time: "8.00 am",
    type: "appointment",
  },
  {
    id: "4",
    title: "Lunch with Rebeca and Bonny",
    time: "8.40 am",
    type: "task",
  },
  {
    id: "5",
    title: "Appointment with",
    tagName: "#Jimmy",
    time: "8.00 am",
    type: "appointment",
  },
];

function EventCard({
  title,
  time,
  type,
  tagName,
  onOptionsPress,
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

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: "DMSans",
            fontSize: bodyLarge.fontSize,
            fontWeight: "400",
            color: Color.Black,
          }}
        >
          {title}{" "}
          {tagName && (
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
          )}
        </Text>

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
      </View>

      {/* Options */}
      <TouchableOpacity onPress={onOptionsPress} hitSlop={8}>
        <DotsIcon size={18} color={Color.Grey} />
      </TouchableOpacity>
    </View>
  );
}

export function UpcomingEventCard() {
  return (
    <View style={{ paddingHorizontal: 20, gap: 10 }}>
      {HARDCODED_EVENTS.map((event) => (
        <EventCard
          key={event.id}
          {...event}
          onOptionsPress={() => console.log("Options pressed for", event.id)}
        />
      ))}
    </View>
  );
}
