import {
  ButtonComponent,
  ButtonSize,
  DropdownComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import React, { useState } from "react";
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

const titleOptions = [
  { label: "Mr", value: "Mr" },
  { label: "Mrs", value: "Mrs" },
  { label: "Ms", value: "Ms" },
  { label: "Dr", value: "Dr" },
  { label: "Prof", value: "Prof" },
  { label: "Rev", value: "Rev" },
];

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Other", value: "Other" },
  { label: "Prefer not to say", value: "Prefer not to say" },
];

// Zod validation schema
const clientSchema = z.object({
  title: z.string().min(1, "Title is required"),
  firstName: z.string().min(1, "First name is required"),
  gender: z.string().min(1, "Gender is required"),
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
});

interface AddClientProps {
  visible: boolean;
  onClose: () => void;
  onSave?: (clientData: unknown) => void;
}

interface FormErrors {
  title?: string;
  firstName?: string;
  gender?: string;
  dateOfBirth?: string;
  contactNumber?: string;
  emergencyContactNumber?: string;
}

export const AddClient: React.FC<AddClientProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  // Form state
  const [title, setTitle] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactNumber, setEmergencyContactNumber] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [note, setNote] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [conditionInput, setConditionInput] = useState("");

  // Error state
  const [errors, setErrors] = useState<FormErrors>({});

  const MAX_CONDITIONS = 5;

  const resetForm = (): void => {
    setTitle("");
    setFirstName("");
    setLastName("");
    setGender("");
    setDateOfBirth("");
    setContactNumber("");
    setEmergencyContactName("");
    setEmergencyContactNumber("");
    setEmergencyContactRelationship("");
    setNote("");
    setConditions([]);
    setConditionInput("");
    setErrors({});
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

  const validateForm = (): boolean => {
    try {
      clientSchema.parse({
        title: title.trim(),
        firstName: firstName.trim(),
        gender: gender.trim(),
        dateOfBirth: dateOfBirth.trim(),
        contactNumber: contactNumber.trim(),
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors = {};
        error.errors.forEach((err) => {
          const field = err.path[0] as keyof FormErrors;
          newErrors[field] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const validateEmergencyContactNumber = (): boolean => {
    // Only validate if emergency contact number is provided
    if (emergencyContactNumber.trim()) {
      const cleaned = emergencyContactNumber.replace(/[\s-]/g, "");
      const phonePattern = /^\+[1-9]\d{1,14}$/;
      if (!phonePattern.test(cleaned)) {
        setErrors({
          ...errors,
          emergencyContactNumber:
            "Invalid phone number format. (e.g., +94701234567)",
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = (): void => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    // Validate emergency contact number if provided
    if (!validateEmergencyContactNumber()) {
      return;
    }

    // Prepare client data
    const clientData = {
      title,
      firstName,
      lastName: lastName.trim() || null,
      gender,
      dateOfBirth,
      contactNumber,
      emergencyContactName: emergencyContactName.trim() || null,
      emergencyContactNumber: emergencyContactNumber.trim() || null,
      emergencyContactRelationship: emergencyContactRelationship.trim() || null,
      conditions: conditions.length > 0 ? conditions : null,
      note: note.trim() || null,
    };

    onSave?.(clientData);
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
                  <DropdownComponent
                    label="Title *"
                    value={title}
                    onValueChange={(value) => {
                      setTitle(value);
                      if (errors.title) {
                        setErrors({ ...errors, title: undefined });
                      }
                    }}
                    options={titleOptions}
                    placeholder="Select"
                    errorText={errors.title}
                  />
                </View>
                <View className="flex-[2]">
                  <TextInputComponent
                    label="First Name *"
                    inputField={{
                      value: firstName,
                      onChangeText: (text) => {
                        setFirstName(text);
                        if (errors.firstName) {
                          setErrors({ ...errors, firstName: undefined });
                        }
                      },
                      placeholder: "John",
                    }}
                    errorText={errors.firstName}
                  />
                </View>
              </View>

              <View className="mb-4">
                <TextInputComponent
                  label="Last Name"
                  inputField={{
                    value: lastName,
                    onChangeText: setLastName,
                    placeholder: "Siriwardane",
                  }}
                />
              </View>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <DropdownComponent
                    label="Gender *"
                    value={gender}
                    onValueChange={(value) => {
                      setGender(value);
                      if (errors.gender) {
                        setErrors({ ...errors, gender: undefined });
                      }
                    }}
                    options={genderOptions}
                    placeholder="Select"
                    errorText={errors.gender}
                  />
                </View>
                <View className="flex-1">
                  <TextInputComponent
                    label="Date of birth *"
                    inputField={{
                      value: dateOfBirth,
                      onChangeText: (text) => {
                        setDateOfBirth(text);
                        if (errors.dateOfBirth) {
                          setErrors({ ...errors, dateOfBirth: undefined });
                        }
                      },
                      placeholder: "29/12/1998",
                    }}
                    errorText={errors.dateOfBirth}
                  />
                </View>
              </View>

              <View className="mb-6">
                <TextInputComponent
                  label="Contact Number *"
                  inputType={TextInputType.Phone}
                  inputField={{
                    value: contactNumber,
                    onChangeText: (text) => {
                      setContactNumber(text);
                      if (errors.contactNumber) {
                        setErrors({ ...errors, contactNumber: undefined });
                      }
                    },
                    placeholder: "+94 70 123 4567",
                  }}
                  errorText={errors.contactNumber}
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
                <TextInputComponent
                  label="Emergency Contact Name"
                  inputField={{
                    value: emergencyContactName,
                    onChangeText: setEmergencyContactName,
                    placeholder: "Elena Siriwardane",
                  }}
                />
              </View>

              <View className="mb-4">
                <TextInputComponent
                  label="Emergency Contact Number"
                  inputType={TextInputType.Phone}
                  inputField={{
                    value: emergencyContactNumber,
                    onChangeText: (text) => {
                      setEmergencyContactNumber(text);
                      if (errors.emergencyContactNumber) {
                        setErrors({
                          ...errors,
                          emergencyContactNumber: undefined,
                        });
                      }
                    },
                    placeholder: "+94 70 123 4567",
                  }}
                  errorText={errors.emergencyContactNumber}
                />
              </View>

              <View className="mb-4">
                <TextInputComponent
                  label="Emergency Contact Relationship"
                  inputField={{
                    value: emergencyContactRelationship,
                    onChangeText: setEmergencyContactRelationship,
                    placeholder: "Wife",
                  }}
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
                <View className="flex-row gap-2 mb-3">
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
                <TextInputComponent
                  label="Note"
                  inputField={{
                    value: note,
                    onChangeText: setNote,
                    placeholder: "Type additional notes here",
                    multiline: true,
                    numberOfLines: 8,
                    textAlignVertical: "top",
                  }}
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
                onPress={handleSave}
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
