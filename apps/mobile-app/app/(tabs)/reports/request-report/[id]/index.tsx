import {
  ButtonComponent,
  ButtonSize,
  InlineDropdownComponent,
  TextComponent,
} from "@/components/basic";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { Icons, type Icon } from "@/config";
import { useFetchClients } from "@/services/clients";
import { useFetchRequestForm, type FormField } from "@/services/forms";
import { useCreateRequestReport } from "@/services/reports";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AtIcon,
  ChatCircleTextIcon,
  CheckIcon,
  WhatsappLogoIcon,
} from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const TEMP_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

const CLIENT_ICON_SIZE = 14;
const SEND_THROUGH_ICON_SIZE = 18;
const NOTES_MIN_HEIGHT = 120;
const BOTTOM_SPACING = 24;

type SendThroughOption = "whatsapp" | "message" | "email";

const SEND_THROUGH_OPTIONS: {
  key: SendThroughOption;
  label: string;
  Icon: Icon;
}[] = [
  { key: "whatsapp", label: "WhatsApp", Icon: WhatsappLogoIcon },
  { key: "message", label: "Message", Icon: ChatCircleTextIcon },
  { key: "email", label: "Email", Icon: AtIcon },
];

export default function RequestReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: clients = [] } = useFetchClients(TEMP_USER_ID);
  const { data: requestForm, isLoading: isFormLoading } =
    useFetchRequestForm(TEMP_USER_ID);
  const createRequestReportMutation = useCreateRequestReport();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedSendThrough, setSelectedSendThrough] = useState<
    SendThroughOption[]
  >([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    typeof id === "string" ? id : ""
  );

  useEffect(() => {
    if (requestForm?.form_configuration) {
      setFormFields(requestForm.form_configuration as unknown as FormField[]);
    }
  }, [requestForm]);

  const sortedFormFields = [...formFields].sort(
    (a, b) => a.sequence - b.sequence
  );

  const clientOptions = clients.map((client) => ({
    label: client.name,
    value: client.id,
  }));

  const toggleReport = (reportType: string) => {
    setFormFields((previous) =>
      previous.map((field) =>
        field.display_label === reportType
          ? { ...field, active: !field.active }
          : field
      )
    );
  };

  const toggleSendThrough = (option: SendThroughOption) => {
    setSelectedSendThrough((previous) =>
      previous.includes(option)
        ? previous.filter((item) => item !== option)
        : [...previous, option]
    );
  };

  const handleRequest = async () => {
    if (!selectedClientId) {
      Alert.alert("Error", "Please select a client");
      return;
    }

    if (!requestForm?.form_id) {
      Alert.alert("Error", "Form configuration not loaded");
      return;
    }

    const hasSelectedReports = formFields.some((field) => field.active);
    if (!hasSelectedReports) {
      Alert.alert("Error", "Please select at least one report");
      return;
    }

    if (selectedSendThrough.length === 0) {
      Alert.alert("Error", "Please select at least one notification method");
      return;
    }

    const requestPayload = {
      user_id: TEMP_USER_ID,
      client_id: selectedClientId,
      form_id: requestForm.form_id,
      note: additionalNotes,
      notification_type: {
        whatsapp: selectedSendThrough.includes("whatsapp"),
        text: selectedSendThrough.includes("message"),
        email: selectedSendThrough.includes("email"),
      },
      requested_reports: formFields,
    };

    try {
      await createRequestReportMutation.mutateAsync(requestPayload);
      router.back();
    } catch (error) {
      console.error("Failed to create request report:", error);
    }
  };

  if (isFormLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={Color.Green} />
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Grey}
            className="mt-4"
          >
            Loading form...
          </TextComponent>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1 bg-white"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-3 pb-6 bg-white">
          <View className="mb-6 self-start">
            <ButtonComponent.BackButton
              onPress={() => router.back()}
              size={ButtonSize.Small}
            />
          </View>

          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Large}
            color={Color.Black}
            className="mb-5"
          >
            Requesting Reports
          </TextComponent>

          <View className="flex-row items-center gap-2 mb-6">
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Black}
            >
              from
            </TextComponent>
            <View
              className="w-6 h-6 rounded-full justify-center items-center overflow-hidden"
              style={{ backgroundColor: Color.LightCream }}
            >
              <Icons.User size={CLIENT_ICON_SIZE} color={Color.Grey} />
            </View>
            <InlineDropdownComponent
              value={selectedClientId}
              onValueChange={setSelectedClientId}
              options={clientOptions}
              placeholder="Select client"
            />
          </View>
        </View>

        <View className="px-5">
          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Medium}
            color={Color.Black}
            className="mb-3"
          >
            Reports
          </TextComponent>

          <View className="mb-6 gap-3">
            {sortedFormFields.map((field) => (
              <Checkbox
                key={`${field.sequence}-${field.display_label}`}
                size="md"
                value={field.display_label}
                isChecked={field.active}
                onChange={() => toggleReport(field.display_label)}
                className="items-center"
              >
                <CheckboxIndicator className="mr-3 border-[#D4D4D4] data-[checked=true]:border-[#90C67C] data-[checked=true]:bg-[#90C67C]">
                  <CheckboxIcon
                    as={CheckIcon}
                    className="!text-white"
                    color={Color.White}
                  />
                </CheckboxIndicator>
                <CheckboxLabel style={{ color: Color.Black }}>
                  {field.display_label}
                </CheckboxLabel>
              </Checkbox>
            ))}
          </View>

          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Medium}
            color={Color.Black}
            className="mb-3"
          >
            Additional Notes
          </TextComponent>

          <View
            className="mb-6 rounded-xl p-3"
            style={{ borderWidth: 1, borderColor: Color.LightGrey }}
          >
            <TextInput
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              textAlignVertical="top"
              placeholder="Type additional notes here..."
              placeholderTextColor={Color.Grey}
              style={{ minHeight: NOTES_MIN_HEIGHT, color: Color.Black }}
            />
          </View>

          <TextComponent
            variant={TextVariant.Button}
            size={TextSize.Medium}
            color={Color.Black}
            className="mb-3"
          >
            Send through
          </TextComponent>

          <View className="mb-8 flex-row items-stretch gap-3">
            {SEND_THROUGH_OPTIONS.map((option) => {
              const isSelected = selectedSendThrough.includes(option.key);
              const IconComponent = option.Icon;
              return (
                <TouchableOpacity
                  key={option.key}
                  onPress={() => toggleSendThrough(option.key)}
                  activeOpacity={0.8}
                  className="flex-1 flex-row items-center justify-center gap-2 rounded-xl px-3 py-3"
                  style={{
                    borderWidth: 1,
                    borderColor: isSelected ? Color.Green : Color.LightGrey,
                    backgroundColor: isSelected ? Color.Green : Color.LightGrey,
                  }}
                >
                  <IconComponent
                    size={SEND_THROUGH_ICON_SIZE}
                    color={isSelected ? Color.Black : Color.Grey}
                    weight="regular"
                  />
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Small}
                    color={Color.Black}
                  >
                    {option.label}
                  </TextComponent>
                </TouchableOpacity>
              );
            })}
          </View>

          <ButtonComponent
            size={ButtonSize.Small}
            buttonColor={Color.Black}
            textColor={Color.White}
            onPress={handleRequest}
          >
            Request
          </ButtonComponent>

          <View style={{ height: BOTTOM_SPACING }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
