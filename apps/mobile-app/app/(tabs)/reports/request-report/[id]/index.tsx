import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import {
  Checkbox,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from "@/components/ui/checkbox";
import { Icons, type Icon } from "@/config";
import { useFetchClients } from "@/services/clients";
import { useFetchRequestForm, type FormField } from "@/services/forms";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  AtIcon,
  CaretDownIcon,
  ChatCircleTextIcon,
  CheckIcon,
  WhatsappLogoIcon,
} from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextStyle as RNTextStyle,
} from "react-native";

const TEMP_USER_ID = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c";

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

const textBodyMediumStyle = textStyles[TextVariant.Body][TextSize.Medium];

export default function RequestReportScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: clients = [] } = useFetchClients(TEMP_USER_ID);
  const { data: requestForm, isLoading: isFormLoading } = useFetchRequestForm(TEMP_USER_ID);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [selectedSendThrough, setSelectedSendThrough] = useState<
    SendThroughOption[]
  >([]);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>(
    typeof id === "string" ? id : ""
  );
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    if (requestForm?.form_configuration) {
      setFormFields(requestForm.form_configuration as unknown as FormField[]);
    }
  }, [requestForm]);

  const sortedFormFields = [...formFields].sort(
    (a, b) => a.sequence - b.sequence
  );

  const selectedClient = clients.find(
    (client) => client.id === selectedClientId
  );
  const displayClientName = selectedClient?.name || "Select client";

  const handleOpenDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setDropdownLayout({ x, y, width, height });
          setIsDropdownOpen(true);
        }
      );
    }
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsDropdownOpen(false);
  };

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

  const handleRequest = () => {
    const requestPayload = {
      form_configuration: formFields,
      additional_notes: additionalNotes,
      send_through: selectedSendThrough,
      client_id: selectedClientId,
    };

    console.log(
      "Request report payload:",
      JSON.stringify(requestPayload, null, 2)
    );
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
            <View className="w-6 h-6 rounded-full bg-[#E8F5A8] justify-center items-center overflow-hidden">
              <Icons.User size={14} color={Color.Grey} />
            </View>
            <Pressable
              ref={dropdownRef}
              onPress={handleOpenDropdown}
              className="flex-row items-center gap-1"
            >
              <Text
                style={{
                  color: selectedClientId ? Color.Black : Color.Grey,
                  fontFamily:
                    textBodyMediumStyle.fontFamily === Font.DMsans
                      ? "DMSans_600SemiBold"
                      : "Lato_600SemiBold",
                  fontSize: textBodyMediumStyle.fontSize,
                  fontWeight: "600" as RNTextStyle["fontWeight"],
                }}
              >
                {displayClientName}
              </Text>
              <CaretDownIcon size={16} color={Color.Grey} weight="regular" />
            </Pressable>
          </View>

          <Modal transparent visible={isDropdownOpen} animationType="none">
            <Pressable
              className="flex-1"
              onPress={() => setIsDropdownOpen(false)}
            />
            {dropdownLayout && (
              <View
                className="absolute bg-white rounded-xl shadow-lg border border-[#D4D4D4] max-h-[200px] overflow-hidden"
                style={{
                  top: dropdownLayout.y + dropdownLayout.height + 4,
                  left: dropdownLayout.x,
                  minWidth: 200,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <ScrollView showsVerticalScrollIndicator={false}>
                  {[...clients]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((client) => (
                      <Pressable
                        key={client.id}
                        onPress={() => handleSelectClient(client.id)}
                        className={`py-3 px-4 border-b border-[#F5F5F5] ${
                          selectedClientId === client.id ? "bg-[#F5F5F5]" : ""
                        }`}
                      >
                        <Text
                          style={{
                            color: Color.Black,
                            fontFamily:
                              textBodyMediumStyle.fontFamily === Font.DMsans
                                ? "DMSans_400Regular"
                                : "Lato_400Regular",
                            fontSize: textBodyMediumStyle.fontSize,
                            fontWeight:
                              selectedClientId === client.id
                                ? ("600" as RNTextStyle["fontWeight"])
                                : ("400" as RNTextStyle["fontWeight"]),
                          }}
                        >
                          {client.name}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            )}
          </Modal>
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
                <CheckboxIndicator className="mr-3 border-[#D4D4D4] data-[checked=true]:bg-[#90C67C] data-[checked=true]:border-[#90C67C]">
                  <CheckboxIcon
                    as={CheckIcon}
                    className="!text-white"
                    color="#FFFFFF"
                  />
                </CheckboxIndicator>
                <CheckboxLabel className="text-[#111827]">
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

          <View className="mb-6 rounded-xl border border-[#D4D4D4] p-3">
            <TextInput
              value={additionalNotes}
              onChangeText={setAdditionalNotes}
              multiline
              textAlignVertical="top"
              placeholder="Type additional notes here..."
              placeholderTextColor={Color.Grey}
              className="min-h-[120px] text-black"
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
                  className={`flex-1 flex-row items-center justify-center gap-2 rounded-xl border px-3 py-3 ${isSelected ? "border-[#90C67C] bg-[#90C67C]" : "border-[#D4D4D4] bg-[#F5F5F5]"}`}
                >
                  <IconComponent
                    size={18}
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

          <View className="h-24" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
