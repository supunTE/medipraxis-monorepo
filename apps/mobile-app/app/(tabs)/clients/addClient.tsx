import {
  ButtonComponent,
  ButtonSize,
  DateTimePickerComponent,
  DropdownComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Icons } from "@/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { Color, TextSize, TextVariant } from "@repo/config";
import React, { useState } from "react";
import type { NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { z } from "zod";
import type { CreateClientInput } from "../../../services/clients";

const titleOptions = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Ms", value: "Ms" },
  { label: "Dr", value: "Dr" },
  { label: "Prof", value: "Prof" },
  { label: "Rev", value: "Rev" },
];

const genderOptions = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

// DD/MM/YYYY → YYYY-MM-DDT00:00 (for DateTimePickerComponent value prop)
function dobToISO(dob: string): string {
  const parts = dob.split("/");
  if (parts.length !== 3) return "";
  const [day, month, year] = parts;
  return `${year}-${month}-${day}T00:00`;
}

// YYYY-MM-DDTHH:MM → DD/MM/YYYY (for form field storage)
function isoToDOB(iso: string): string {
  const datePart = iso.split("T")[0];
  if (!datePart) return "";
  const [year, month, day] = datePart.split("-");
  return `${day}/${month}/${year}`;
}

// Zod validation schema
const clientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    message: "Gender is required",
  }),
  dateOfBirth: z
    .string()
    .min(1, "Date of birth is required")
    .refine(
      (date) => {
        // Check format DD/MM/YYYY
        const datePattern = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!datePattern.test(date)) return false;

        const parts = date.split("/").map(Number);
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];

        if (!day || !month || !year) return false;

        const dateObj = new Date(year, month - 1, day);

        // Check if date is valid (handles leap years automatically)
        if (
          dateObj.getDate() !== day ||
          dateObj.getMonth() !== month - 1 ||
          dateObj.getFullYear() !== year
        ) {
          return false;
        }

        // Check if date is not in the future
        if (dateObj > new Date()) {
          return false;
        }

        return true;
      },
      {
        message:
          "Invalid date. Must be valid DD/MM/YYYY format and not in the future",
      }
    ),
  contactNumber: z
    .string()
    .min(1, "Contact number is required")
    .refine(
      (phone) => {
        // E.164 format: + followed by 1-15 digits (optional spaces/hyphens)
        // Removes spaces and hyphens before validation
        const cleaned = phone.replace(/[\s-]/g, "");
        const phonePattern = /^\+[1-9]\d{1,14}$/;
        return phonePattern.test(cleaned);
      },
      {
        message: "Invalid phone number format. (e.g., +94701234567)",
      }
    ),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z
    .string()
    .optional()
    .refine(
      (phone) => {
        if (!phone || !phone.trim()) return true;
        const cleaned = phone.replace(/[\s-]/g, "");
        const phonePattern = /^\+[1-9]\d{1,14}$/;
        return phonePattern.test(cleaned);
      },
      {
        message: "Invalid phone number format. (e.g., +94701234567)",
      }
    ),
  emergencyContactRelationship: z.string().optional(),
  note: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface AddClientProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (clientData: CreateClientInput) => void | Promise<void>;
}

export const AddClient: React.FC<AddClientProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setIsScrolled(e.nativeEvent.contentOffset.y > 0);
  };

  const MAX_CONDITIONS = 5;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      gender: undefined,
      dateOfBirth: "",
      contactNumber: "",
      emergencyContactName: "",
      emergencyContactNumber: "",
      emergencyContactRelationship: "",
      note: "",
    },
  });

  const resetForm = (): void => {
    reset();
    setConditions([]);
    setConditionInput("");
  };

  const handleAddCondition = (): void => {
    if (
      conditionInput.trim() &&
      conditions.length < MAX_CONDITIONS &&
      !conditions.includes(conditionInput.trim())
    ) {
      setConditions([...conditions, conditionInput.trim()]);
      setConditionInput("");
    }
  };

  const handleRemoveCondition = (condition: string): void => {
    setConditions(conditions.filter((c) => c !== condition));
  };

  const handleClose = (): void => {
    resetForm();
    onClose();
  };

  const onSubmit = (data: ClientFormData): void => {
    // Prepare client data matching CreateClientInput type
    const clientData: CreateClientInput = {
      title: data.title,
      firstName: data.firstName,
      lastName: data.lastName,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      contactNumber: data.contactNumber,
      emergencyContactName: data.emergencyContactName,
      emergencyContactNumber: data.emergencyContactNumber,
      emergencyContactRelationship: data.emergencyContactRelationship,
      knownConditions: conditions.length > 0 ? conditions : undefined,
      note: data.note,
    };

    void onSave?.(clientData);
    resetForm();
    onClose();
  };

  return (
    <>
      {/* Overlay modal — covers status bar */}
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }} />
      </Modal>

      {/* Form modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={handleClose}
      >
        {/* Pseudo wrapper — transparent so overlay shows through padding gaps */}
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 12,
            paddingTop: 24,
            backgroundColor: "transparent",
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "white",
              borderRadius: 20,
              overflow: "hidden",
            }}
          >
            <View
              className="px-5 pt-4 pb-3"
              style={{
                backgroundColor: Color.White,
                shadowColor: "#0000007b",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: isScrolled ? 0.05 : 0,
                shadowRadius: 4,
                elevation: isScrolled ? 2 : 0,
                zIndex: 1,
              }}
            >
              <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
                Add Client Details
              </TextComponent>
            </View>

            <ScrollView
              className="flex-1 px-5"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
            >
              <View className="mb-3">
                <TextComponent
                  variant={TextVariant.Title}
                  size={TextSize.Small}
                >
                  Basic Information
                </TextComponent>
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="title"
                    render={({ field: { onChange, value } }) => (
                      <DropdownComponent
                        label="Title *"
                        value={value}
                        onValueChange={onChange}
                        options={titleOptions}
                        placeholder="Select"
                        errorText={errors.title?.message}
                      />
                    )}
                  />
                </View>
                <View className="flex-[2]">
                  <Controller
                    control={control}
                    name="firstName"
                    render={({ field: { onChange, value } }) => (
                      <TextInputComponent
                        label="First Name *"
                        inputField={{
                          value,
                          onChangeText: onChange,
                          placeholder: "John",
                        }}
                        errorText={errors.firstName?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Controller
                  control={control}
                  name="lastName"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Last Name *"
                      inputField={{
                        value,
                        onChangeText: onChange,
                        placeholder: "Siriwardane",
                      }}
                      errorText={errors.lastName?.message}
                    />
                  )}
                />
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field: { onChange, value } }) => (
                      <DropdownComponent
                        label="Gender *"
                        value={value}
                        onValueChange={onChange}
                        options={genderOptions}
                        placeholder="Select"
                        errorText={errors.gender?.message}
                      />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field: { onChange, value } }) => (
                      <DateTimePickerComponent
                        label="Date of birth *"
                        mode="date"
                        value={value ? dobToISO(value) : ""}
                        onChange={(iso) => onChange(isoToDOB(iso))}
                        placeholder="Select date"
                        errorText={errors.dateOfBirth?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Controller
                  control={control}
                  name="contactNumber"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Contact Number *"
                      inputType={TextInputType.Phone}
                      inputField={{
                        value,
                        onChangeText: onChange,
                        placeholder: "+94 70 123 4567",
                      }}
                      errorText={errors.contactNumber?.message}
                    />
                  )}
                />
              </View>

              <View className="mb-3">
                <TextComponent
                  variant={TextVariant.Title}
                  size={TextSize.Small}
                >
                  Additional Information
                </TextComponent>
              </View>

              <View className="mb-4">
                <Controller
                  control={control}
                  name="emergencyContactName"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Emergency Contact Name"
                      inputField={{
                        value: value || "",
                        onChangeText: onChange,
                        placeholder: "Elena Siriwardane",
                      }}
                    />
                  )}
                />
              </View>

              <View className="mb-4">
                <Controller
                  control={control}
                  name="emergencyContactNumber"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Emergency Contact Number"
                      inputType={TextInputType.Phone}
                      inputField={{
                        value: value || "",
                        onChangeText: onChange,
                        placeholder: "+94 70 123 4567",
                      }}
                      errorText={errors.emergencyContactNumber?.message}
                    />
                  )}
                />
              </View>

              <View className="mb-4">
                <Controller
                  control={control}
                  name="emergencyContactRelationship"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Emergency Contact Relationship"
                      inputField={{
                        value: value || "",
                        onChangeText: onChange,
                        placeholder: "Wife",
                      }}
                    />
                  )}
                />
              </View>

              <View className="mb-4">
                <View className="mb-2">
                  <TextComponent
                    variant={TextVariant.Body}
                    size={TextSize.Medium}
                  >
                    Known Conditions
                  </TextComponent>
                </View>
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="flex-1">
                    <TextInputComponent
                      inputField={{
                        value: conditionInput,
                        onChangeText: setConditionInput,
                        placeholder: "Condition Name",
                      }}
                    />
                  </View>
                  <ButtonComponent
                    size={ButtonSize.Small}
                    leftIcon={Icons.Plus}
                    buttonColor={Color.Black}
                    textColor={Color.White}
                    iconColor={Color.White}
                    onPress={handleAddCondition}
                    disabled={
                      !conditionInput.trim() ||
                      conditions.length >= MAX_CONDITIONS
                    }
                  >
                    Add
                  </ButtonComponent>
                </View>

                {conditions.length > 0 && (
                  <View className="flex-row flex-wrap gap-2 mb-2">
                    {conditions.map((condition) => (
                      <Pressable
                        key={condition}
                        onPress={() => handleRemoveCondition(condition)}
                        className="flex-row items-center rounded-full px-3 py-1.5"
                        style={{ backgroundColor: Color.Danger }}
                      >
                        <TextComponent
                          variant={TextVariant.Body}
                          size={TextSize.Small}
                          color={Color.White}
                          style={{ marginRight: 6 }}
                        >
                          ×
                        </TextComponent>
                        <TextComponent
                          variant={TextVariant.Body}
                          size={TextSize.Small}
                          color={Color.White}
                        >
                          {condition}
                        </TextComponent>
                      </Pressable>
                    ))}
                  </View>
                )}

                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  color={Color.Grey}
                >
                  {MAX_CONDITIONS - conditions.length}/{MAX_CONDITIONS}{" "}
                  Remaining
                </TextComponent>
              </View>

              <View className="mb-6">
                <Controller
                  control={control}
                  name="note"
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      label="Note"
                      inputField={{
                        value: value || "",
                        onChangeText: onChange,
                        placeholder: "Type additional notes here",
                        multiline: true,
                        textAlignVertical: "top",
                        className: "py-2 h-32",
                      }}
                    />
                  )}
                />
              </View>
            </ScrollView>

            {/* Action Footer */}
            <View className="absolute bottom-0 w-full bg-[#EAF8C9] p-4 flex-row justify-end gap-x-2.5 border-t border-gray-100">
              <Pressable
                className="flex-row items-center py-2.5 px-6 rounded-lg"
                style={{
                  backgroundColor: Color.LightCream,
                  borderWidth: 1,
                  borderColor: Color.LightGrey,
                }}
                onPress={handleClose}
              >
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Medium}
                  color={Color.Black}
                >
                  Close
                </TextComponent>
              </Pressable>
              <Pressable
                className="flex-row items-center bg-slate-900 py-2.5 px-6 rounded-lg gap-x-2"
                onPress={() => void handleSubmit(onSubmit)()}
              >
                <Icons.Check size={18} color="white" weight="bold" />
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Medium}
                  color={Color.White}
                >
                  Save
                </TextComponent>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
