import {
  ButtonComponent,
  ButtonSize,
  DropdownComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Icons } from "@/config";
import { zodResolver } from "@hookform/resolvers/zod";
import { Color, TextSize, TextVariant } from "@repo/config";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  View,
} from "react-native";
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

  const MAX_CONDITIONS = 5;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
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
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: Color.White }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1" style={{ backgroundColor: Color.White }}>
            <View
              className="px-5 pt-3 pb-4"
              style={{ backgroundColor: Color.White }}
            >
              <View className="mb-4" style={{ alignSelf: "flex-start" }}>
                <ButtonComponent.BackButton
                  size={ButtonSize.Small}
                  onPress={handleClose}
                />
              </View>
              <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
                Add Client Details
              </TextComponent>
            </View>

            <ScrollView
              className="flex-1 px-5"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 120 }}
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
                      <TextInputComponent
                        label="Date of birth *"
                        inputField={{
                          value,
                          onChangeText: onChange,
                          placeholder: "29/12/1998",
                        }}
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
                        numberOfLines: 8,
                        textAlignVertical: "top",
                      }}
                    />
                  )}
                />
              </View>
            </ScrollView>

            <View
              className="px-5 pb-8 pt-4"
              style={{
                backgroundColor: Color.White,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <ButtonComponent
                size={ButtonSize.Large}
                buttonColor={Color.Black}
                textColor={Color.White}
                onPress={() => void handleSubmit(onSubmit)()}
              >
                Save
              </ButtonComponent>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};
