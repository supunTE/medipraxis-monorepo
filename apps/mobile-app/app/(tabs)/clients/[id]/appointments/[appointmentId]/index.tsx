import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { ChipComponent, ChipVariant } from "@/components/basic/Chip.component";
import { Icons } from "@/config";
import { useFetchClientById } from "@/services/clients";
import { useGetTaskById } from "@/services/tasks/useGetTaskById";
import { Color, TextSize, TextVariant } from "@repo/config";
import type { TaskDetails } from "@repo/models";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarBlankIcon, ClockIcon, PlayIcon } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { appointmentId, id } = useLocalSearchParams<{
    appointmentId: string;
    id: string;
  }>();

  const [appointment, setAppointment] = useState<TaskDetails | undefined>(
    undefined
  );

  const {
    mutate: fetchAppointment,
    data: appointmentData,
    isLoading: isLoadingAppointment,
  } = useGetTaskById({
    onSuccess: () => {
      if (appointmentData?.task) {
        setAppointment(appointmentData.task as TaskDetails);
      }
    },
  });

  const { data: client, isLoading: isLoadingClient } = useFetchClientById(
    id || ""
  );

  useEffect(() => {
    if (appointmentId) {
      fetchAppointment({ task_id: appointmentId });
    }
  }, [appointmentId]);

  // Update appointment when data changes
  useEffect(() => {
    if (appointmentData?.task) {
      setAppointment(appointmentData.task as TaskDetails);
    }
  }, [appointmentData]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateAge = (dateOfBirth?: string): number | null => {
    if (!dateOfBirth) return null;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getChipConfig = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
      case "ONGOING":
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

  // Show loading while either is loading
  if (isLoadingAppointment || isLoadingClient) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Color.Black} />
        </View>
      </SafeAreaView>
    );
  }

  // If data is not loaded yet, show loading
  if (!appointment || !client) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Color.Green} />
        </View>
      </SafeAreaView>
    );
  }

  const fullName =
    `${client.first_name || ""} ${client.last_name || ""}`.trim() || "Unknown";
  const age = calculateAge(client.date_of_birth);
  const titlePrefix =
    client.gender === "MALE" ? "Mr" : client.gender === "FEMALE" ? "Ms" : "";
  const displayName = titlePrefix ? `${titlePrefix} ${fullName}` : fullName;

  const hasAllergies =
    client.known_conditions &&
    Array.isArray(client.known_conditions) &&
    client.known_conditions.length > 0 &&
    client.known_conditions[0];

  const allergyText =
    hasAllergies && client.known_conditions?.[0]
      ? String(client.known_conditions[0])
      : null;

  const chipConfig = getChipConfig(appointment.task_status_name);
  const isNotStarted = appointment.task_status_name === "NOT_STARTED";

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* Header Section */}
        <View className="px-5 pt-3 pb-6 bg-white">
          {/* Back Button */}
          <View className="mb-6 self-start">
            <ButtonComponent.BackButton
              onPress={() => router.back()}
              size={ButtonSize.Small}
            />
          </View>

          {/* Patient Info Section */}
          <View className="flex-row items-center gap-4 mb-4">
            {/* Avatar - smaller circle */}
            <View className="bg-[#E8F5A8] w-[80px] h-[80px] rounded-full justify-center items-center overflow-hidden">
              <Icons.User size={40} color={Color.Grey} />
            </View>

            {/* Patient Details */}
            <View className="flex-1">
              <TextComponent
                variant={TextVariant.Title}
                size={TextSize.Medium}
                className="mb-0.5"
              >
                {displayName}
              </TextComponent>
              {age !== null && (
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Grey}
                  className="mb-2"
                >
                  {age} years old
                </TextComponent>
              )}
              {allergyText && (
                <ChipComponent
                  text={allergyText}
                  variant={ChipVariant.Danger}
                />
              )}
            </View>
          </View>

          {/* Appointment Date with icon */}
          <View className="flex-row items-center gap-2 mb-2">
            <CalendarBlankIcon size={20} color={Color.Grey} weight="regular" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Grey}
            >
              {formatDate(appointment.start_date)}
            </TextComponent>
          </View>

          {/* Appointment Time with icon */}
          <View className="flex-row items-center gap-2 mb-4">
            <ClockIcon size={20} color={Color.Grey} weight="regular" />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Grey}
            >
              {formatTime(appointment.start_date)} -{" "}
              {formatTime(appointment.end_date)}
            </TextComponent>
          </View>

          {/* Status Chip */}
          <View className="mb-3">
            <ChipComponent
              text={chipConfig.label}
              variant={chipConfig.variant}
            />
          </View>

          {/* Start Button - aligned to right, auto width */}
          {isNotStarted && (
            <View className="items-end">
              <ButtonComponent
                size={ButtonSize.Small}
                leftIcon={PlayIcon}
                buttonColor={Color.Black}
                textColor={Color.White}
                iconColor={Color.White}
                onPress={() => {
                  console.log("Start appointment:", appointmentId);
                  // TODO: Implement start appointment logic
                }}
              >
                Start
              </ButtonComponent>
            </View>
          )}
        </View>

        {/* Appointment Title and Notes Section */}
        {(appointment.task_title || appointment.note) && (
          <View className="px-5 py-4 bg-[#F5F5F5] flex-1">
            <View className="bg-white rounded-2xl p-5 border border-[#E5E5E5]">
              {/* Appointment Title */}
              {appointment.task_title && (
                <View className="mb-4">
                  <TextComponent
                    variant={TextVariant.Title}
                    size={TextSize.Small}
                    color={Color.Black}
                    className="mb-1"
                  >
                    {appointment.task_title}
                  </TextComponent>
                </View>
              )}

              {/* Notes */}
              {appointment.note && (
                <View
                  className={
                    appointment.task_title
                      ? "pt-4 border-t border-[#E5E5E5]"
                      : ""
                  }
                >
                  <TextComponent
                    variant={TextVariant.Title}
                    size={TextSize.Small}
                    color={Color.Black}
                    className="mb-2"
                  >
                    Notes
                  </TextComponent>
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Medium}
                    color={Color.Grey}
                  >
                    {appointment.note}
                  </TextComponent>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
