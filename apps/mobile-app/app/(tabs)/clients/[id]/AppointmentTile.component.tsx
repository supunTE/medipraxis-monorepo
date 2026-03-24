import {
  ButtonComponent,
  ButtonSize,
  ChipComponent,
  ChipVariant,
  TextComponent,
} from "@/components/basic";
import { Color, TextSize, TextVariant } from "@repo/config";
import {
  CalendarBlankIcon,
  ClockIcon,
  EyeIcon,
  MapPinIcon,
  PlusIcon,
} from "phosphor-react-native";
import React from "react";
import { View } from "react-native";

export type AppointmentStatus =
  | "NOT_STARTED"
  | "ONGOING"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export interface Appointment {
  appointment_id: string;
  date: string;
  location?: string | null;
  status: AppointmentStatus;
}

export interface AppointmentTileProps {
  appointment: Appointment;
  dateLabel: string;
  hasRecord?: boolean; // Whether this appointment already has a record in the DB
  onViewAppointment?: (appointmentId: string) => void;
  onAddRecord?: (appointmentId: string) => void;
}

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const formatTime = (dateString: string): string =>
  new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const getChipConfig = (
  status: AppointmentStatus
): { label: string; variant: ChipVariant } => {
  switch (status) {
    case "ONGOING":
      return { label: "Ongoing", variant: ChipVariant.Green };
    case "IN_PROGRESS":
      return { label: "In Progress", variant: ChipVariant.Green };
    case "COMPLETED":
      return { label: "Completed", variant: ChipVariant.LightGreen };
    case "CANCELLED":
      return { label: "Cancelled", variant: ChipVariant.Danger };
    case "NOT_STARTED":
    default:
      return { label: "Not Started", variant: ChipVariant.LightGreen };
  }
};

export const AppointmentTile: React.FC<AppointmentTileProps> = ({
  appointment,
  dateLabel,
  hasRecord = false,
  onViewAppointment,
  onAddRecord,
}) => {
  const { label: chipLabel, variant: chipVariant } = getChipConfig(
    appointment.status
  );

  // Only suppress the status chip for genuinely future NOT_STARTED appointments.
  // Past appointments that were never actioned remain NOT_STARTED in the DB and must still show the chip.
  const isFutureNotStarted =
    appointment.status === "NOT_STARTED" &&
    new Date(appointment.date) > new Date();

  // Button priority:
  // 1. Has a record (any status) → "View Record"
  // 2. No record + NOT_STARTED   → "View Appointment"
  // 3. No record + any other status → "Add Record"
  let actionLabel: string;
  let showAddIcon = false;

  if (hasRecord) {
    actionLabel = "View Record";
  } else if (appointment.status === "NOT_STARTED") {
    actionLabel = "View Appointment";
  } else {
    actionLabel = "Add Record";
    showAddIcon = true;
  }

  const handleActionPress = () => {
    if (showAddIcon) {
      onAddRecord?.(appointment.appointment_id);
    } else {
      onViewAppointment?.(appointment.appointment_id);
    }
  };

  return (
    <View
      className="bg-white rounded-2xl p-4 mb-3 border border-[#E5E5E5]"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-center mb-4">
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          color={Color.Black}
        >
          {dateLabel}
        </TextComponent>

        <ButtonComponent
          size={ButtonSize.Small}
          leftIcon={showAddIcon ? PlusIcon : EyeIcon}
          buttonColor={Color.Black}
          textColor={Color.White}
          iconColor={Color.White}
          onPress={handleActionPress}
        >
          {actionLabel}
        </ButtonComponent>
      </View>

      <View
        className="flex-row items-center gap-4"
        style={{ marginBottom: isFutureNotStarted ? 0 : 16 }}
      >
        {/* Date */}
        <View className="flex-row items-center gap-2">
          <CalendarBlankIcon size={16} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {formatDate(appointment.date)}
          </TextComponent>
        </View>

        {/* Time */}
        <View className="flex-row items-center gap-2">
          <ClockIcon size={16} color={Color.Grey} weight="regular" />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
          >
            {formatTime(appointment.date)}
          </TextComponent>
        </View>

        {isFutureNotStarted && appointment.location ? (
          <View className="flex-row items-center gap-1 flex-1 justify-end">
            <MapPinIcon size={14} color={Color.Grey} weight="regular" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Small}
              color={Color.Grey}
            >
              {appointment.location}
            </TextComponent>
          </View>
        ) : null}
      </View>

      {!isFutureNotStarted ? (
        <>
          {/* Grey divider line */}
          <View className="border-t border-[#E5E5E5] mb-3" />

          {/* Status chip + location */}
          <View className="flex-row justify-between items-center">
            <ChipComponent text={chipLabel} variant={chipVariant} />

            {appointment.location ? (
              <View className="flex-row items-center gap-1">
                <MapPinIcon size={14} color={Color.Grey} weight="regular" />
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Grey}
                >
                  {appointment.location}
                </TextComponent>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );
};
