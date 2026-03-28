import { useAuth } from "@/auth/AuthContext";
import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  DateTimePickerComponent,
  TextAreaComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
  ToggleButton,
} from "@/components/basic";
import { ChipComponent, ChipVariant } from "@/components/basic/Chip.component";
import { Icons } from "@/config";
import { useFetchClientById } from "@/services/clients";
import { useFetchActiveForm } from "@/services/forms";
import { useGetTaskById } from "@/services/tasks/useGetTaskById";
import { Color, TextSize, TextVariant } from "@repo/config";
import { FormType, type TaskDetails } from "@repo/models";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarBlankIcon, ClockIcon, PlayIcon } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";

interface FormField {
  field_type: string;
  display_label: string;
  description: string;
  help_text: string;
  active: boolean;
  required: boolean;
  shareable: boolean;
  sequence: number;
}

export default function AppointmentDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const userId = user?.user_id ?? "";
  const { appointmentId, id } = useLocalSearchParams<{
    appointmentId: string;
    id: string;
  }>();

  const [appointment, setAppointment] = useState<TaskDetails | undefined>(
    undefined
  );
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

  const { data: appointmentForm } = useFetchActiveForm(
    userId,
    FormType.APPOINTMENT_RECORD
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

  const sortedFormFields =
    appointmentForm?.form_configuration
      ?.filter((field: FormField) => field.active)
      ?.sort((a: FormField, b: FormField) => a.sequence - b.sequence) || [];

  const handleFieldChange = (fieldLabel: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldLabel]: value }));
    // Clear error when field is updated
    if (formErrors[fieldLabel]) {
      setFormErrors((prev) => {
        const { [fieldLabel]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    sortedFormFields.forEach((field: FormField) => {
      if (field.required && !formValues[field.display_label]) {
        errors[field.display_label] = `${field.display_label} is required`;
      }
    });
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    console.log("Form values:", formValues);
    // TODO: Submit form data to API
    Alert.alert("Success", "Appointment record saved successfully");
  };

  const renderFormField = (field: FormField) => {
    const value = formValues[field.display_label];
    const hasError = !!formErrors[field.display_label];

    return (
      <View key={field.sequence} className="mb-5">
        <View className="flex-row items-center mb-2">
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Black}
          >
            {field.display_label}
          </TextComponent>
          {field.required && (
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Danger}
              className="ml-1"
            >
              *
            </TextComponent>
          )}
        </View>

        {field.field_type === "single-text" && (
          <>
            <TextInputComponent
              inputType={TextInputType.Text}
              inputField={{
                value: value || "",
                onChangeText: (text: string) =>
                  handleFieldChange(field.display_label, text),
                placeholder: `Enter ${field.display_label.toLowerCase()}`,
              }}
            />
            {hasError && (
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Danger}
                className="mt-1"
              >
                {formErrors[field.display_label]}
              </TextComponent>
            )}
          </>
        )}

        {field.field_type === "multi-text" && (
          <>
            <TextAreaComponent
              inputField={{
                value: value || "",
                onChangeText: (text: string) =>
                  handleFieldChange(field.display_label, text),
                placeholder: `Enter ${field.display_label.toLowerCase()}`,
              }}
            />
            {hasError && (
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Danger}
                className="mt-1"
              >
                {formErrors[field.display_label]}
              </TextComponent>
            )}
          </>
        )}

        {field.field_type === "numeric" && (
          <>
            <TextInputComponent
              inputType={TextInputType.Number}
              inputField={{
                value: value || "",
                onChangeText: (text: string) =>
                  handleFieldChange(field.display_label, text),
                placeholder: `Enter ${field.display_label.toLowerCase()}`,
              }}
            />
            {hasError && (
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Danger}
                className="mt-1"
              >
                {formErrors[field.display_label]}
              </TextComponent>
            )}
          </>
        )}

        {field.field_type === "checkbox" && (
          <View className="flex-row items-center gap-3">
            <CheckboxComponent
              isChecked={value || false}
              onChange={(checked: boolean) =>
                handleFieldChange(field.display_label, checked)
              }
            />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
            >
              {field.display_label}
            </TextComponent>
          </View>
        )}

        {field.field_type === "toggle" && (
          <View className="flex-row items-center gap-3">
            <ToggleButton
              isActive={value || false}
              onToggle={(toggled: boolean) =>
                handleFieldChange(field.display_label, toggled)
              }
            />
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
            >
              {field.display_label}
            </TextComponent>
          </View>
        )}

        {field.field_type === "date" && (
          <>
            <DateTimePickerComponent
              value={
                value
                  ? typeof value === "string"
                    ? value
                    : value.toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              onChange={(dateString: string) =>
                handleFieldChange(field.display_label, dateString)
              }
              mode="date"
            />
            {hasError && (
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.Danger}
                className="mt-1"
              >
                {formErrors[field.display_label]}
              </TextComponent>
            )}
          </>
        )}
      </View>
    );
  };

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
            <View className="items-end mb-6">
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

          {/* Appointment Log Form */}
          {sortedFormFields.length > 0 && (
            <>
              {sortedFormFields.map((field: FormField) =>
                renderFormField(field)
              )}

              <View className="mb-8">
                <ButtonComponent
                  size={ButtonSize.Medium}
                  buttonColor={Color.Black}
                  textColor={Color.White}
                  onPress={handleSubmit}
                >
                  Save Record
                </ButtonComponent>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
