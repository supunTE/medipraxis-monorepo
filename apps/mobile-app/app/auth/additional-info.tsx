import { Color, TextSize, TextVariant } from "@repo/config";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import type { RegisterAdditionalDetailsInput } from "@repo/models";
import { File as ExpoFile } from "expo-file-system";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ButtonComponent,
  ButtonSize,
  CheckboxComponent,
  DropdownComponent,
  DropdownOption,
  FileUploadComponent,
  TextComponent,
  TextInputComponent,
  TextInputType,
} from "@/components/basic";
import { Controller, useForm } from "react-hook-form";
import { authService } from "@/services/auth";

type AdditionalInfoForm = {
  title: string;
  firstName: string;
  lastName: string;
  profession: string;
  registrationNumber: string;
  specialization: string;
  mobileCountryCode: string;
  mobileNumber: string;
  differentWhatsappNumber: boolean;
  whatsappCountryCode: string;
  whatsappNumber: string;
  emailAddress?: string;
};

export default function AdditionalInfoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<ExpoFile | null>(null);
  const [sealFile, setSealFile] = useState<ExpoFile | null>(null);
  const [photoUploadName, setPhotoUploadName] = useState<string>("");
  const [sealUploadName, setSealUploadName] = useState<string>("");

  const titleOptions: DropdownOption[] = [
    { label: "Mr", value: "Mr" },
    { label: "Mrs", value: "Mrs" },
    { label: "Ms", value: "Ms" },
    { label: "Dr", value: "Dr" },
  ];

  const professionOptions: DropdownOption[] = [
    { label: "Doctor", value: "doctor" },
    { label: "Consultant", value: "consultant" },
    { label: "Specialist", value: "specialist" },
    { label: "General Practitioner", value: "gp" },
  ];

  const specializationOptions: DropdownOption[] = [
    { label: "General Medicine", value: "general_medicine" },
    { label: "Cardiology", value: "cardiology" },
    { label: "Pediatrics", value: "pediatrics" },
    { label: "Dermatology", value: "dermatology" },
  ];

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AdditionalInfoForm>({
    defaultValues: {
      title: "",
      firstName: "",
      lastName: "",
      profession: "doctor",
      registrationNumber: "",
      specialization: "",
      mobileCountryCode: "+94",
      mobileNumber: "",
      differentWhatsappNumber: false,
      whatsappCountryCode: "+94",
      whatsappNumber: "",
      emailAddress: undefined,
    },
  });

  const showWhatsappNumber = watch("differentWhatsappNumber");

  const pickFile = async (
    target: "photo" | "seal",
    pickerTitle: "Photo" | "Seal"
  ) => {
    try {
      const picked = await ExpoFile.pickFileAsync();
      const selected = Array.isArray(picked) ? picked[0] : picked;

      if (!selected) {
        return;
      }

      if (target === "photo") {
        setPhotoFile(selected);
        setPhotoUploadName(selected.name);
      } else {
        setSealFile(selected);
        setSealUploadName(selected.name);
      }
    } catch (e: any) {
      const message = String(e?.message ?? "");
      if (message.toLowerCase().includes("cancel")) {
        return;
      }
      Alert.alert(
        `${pickerTitle} Upload`,
        e?.message ?? `Failed to pick ${pickerTitle.toLowerCase()} file`
      );
    }
  };

  const onSave = async (data: AdditionalInfoForm) => {
    const payload: RegisterAdditionalDetailsInput = {
      title: data.title + ".",
      first_name: data.firstName,
      last_name: data.lastName,
      profession: data.profession,
      registration_number: data.registrationNumber,
      specialization: data.specialization,
      different_whatsapp_number: data.differentWhatsappNumber,
      whatsapp_country_code: data.whatsappCountryCode || undefined,
      whatsapp_number: data.whatsappNumber || undefined,
      email_address: data.emailAddress || undefined,
    };

    try {
      setIsSaving(true);
      await authService.registerAdditionalDetails(payload);

      try {
        if (photoFile) {
          await authService.uploadProfilePicture(photoFile);
        }

        if (sealFile) {
          await authService.uploadSeal(sealFile);
        }
      } catch (uploadError: any) {
        console.error("uploadError", uploadError);
        Alert.alert(
          "Partial Success",
          `Details saved, but file upload failed: ${uploadError?.message ?? "Unknown error"}`
        );
        return;
      }

      Alert.alert("Saved", "Additional information submitted.");
      router.replace({
        pathname: "/auth/key-reveal",
        params: {
          phoneNumber: data.mobileNumber,
          countryCode: data.mobileCountryCode,
        },
      });
    } catch (e: any) {
      Alert.alert(
        "Save Failed",
        e?.message ?? "Failed to save additional details"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onInvalid = () => {
    const firstError = Object.values(errors).find((error) => !!error?.message);
    Alert.alert(
      "Incomplete Form",
      firstError?.message?.toString() ?? "Please check required fields."
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "white", paddingTop: insets.top }}
    >
      <ScrollView
        contentContainerClassName="px-[22px] pb-7 pt-5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-3 items-start">
          <ButtonComponent.BackButton
            size={ButtonSize.Small}
            onPress={() => router.replace("/auth/login")}
          >
            Go Back to Login
          </ButtonComponent.BackButton>
        </View>

        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Large}
          className="pt-3 pb-4"
        >
          Account Registration
        </TextComponent>

        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          className="mb-2 mt-2"
        >
          1. Personal Info
        </TextComponent>

        <View className="flex-row gap-2.5">
          <View className="flex-[0.34]">
            <Controller
              control={control}
              name="title"
              rules={{ required: "Title is required" }}
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
          <View className="flex-[0.66]">
            <Controller
              control={control}
              name="firstName"
              rules={{ required: "First name is required" }}
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

        <View className="mb-2 mt-2">
          <Controller
            control={control}
            name="lastName"
            rules={{ required: "Last name is required" }}
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

        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          className="mb-2 mt-4"
        >
          2. Professional Info
        </TextComponent>

        <View className="mb-2">
          <Controller
            control={control}
            name="profession"
            rules={{ required: "Profession is required" }}
            render={({ field: { onChange, value } }) => (
              <DropdownComponent
                label="Doctor *"
                value={value}
                onValueChange={onChange}
                options={professionOptions}
                placeholder="Profession"
                errorText={errors.profession?.message}
              />
            )}
          />
        </View>
        <View className="mb-2">
          <Controller
            control={control}
            name="registrationNumber"
            rules={{ required: "Registration number is required" }}
            render={({ field: { onChange, value } }) => (
              <TextInputComponent
                label="Registration Number *"
                inputField={{
                  value,
                  onChangeText: onChange,
                  placeholder: "17748143-79526-hkprt",
                }}
                errorText={errors.registrationNumber?.message}
              />
            )}
          />
        </View>
        <View className="mb-2">
          <Controller
            control={control}
            name="specialization"
            rules={{ required: "Specialization is required" }}
            render={({ field: { onChange, value } }) => (
              <DropdownComponent
                label="Specialization *"
                value={value}
                onValueChange={onChange}
                options={specializationOptions}
                placeholder="Cardiology"
                errorText={errors.specialization?.message}
              />
            )}
          />
        </View>

        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          className="mb-2 mt-4"
        >
          3. Contact Info
        </TextComponent>

        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Large}
          className="mb-1"
        >
          Mobile Number
        </TextComponent>
        <View className="mb-2 flex-row gap-2.5">
          <View className="flex-[0.3]">
            <Controller
              control={control}
              name="mobileCountryCode"
              rules={{ required: "Code required" }}
              render={({ field: { onChange, value } }) => (
                <TextInputComponent
                  inputType={TextInputType.Phone}
                  inputField={{
                    value,
                    onChangeText: onChange,
                    placeholder: "Code",
                  }}
                  errorText={errors.mobileCountryCode?.message}
                />
              )}
            />
          </View>
          <View className="flex-[0.7]">
            <Controller
              control={control}
              name="mobileNumber"
              rules={{ required: "Mobile number is required" }}
              render={({ field: { onChange, value } }) => (
                <TextInputComponent
                  inputType={TextInputType.Phone}
                  inputField={{
                    value,
                    onChangeText: onChange,
                    placeholder: "Mobile Number",
                  }}
                  errorText={errors.mobileNumber?.message}
                />
              )}
            />
          </View>
        </View>

        <View className="mb-2 my-0.5">
          <Controller
            control={control}
            name="differentWhatsappNumber"
            render={({ field: { onChange, value } }) => (
              <CheckboxComponent
                isChecked={value}
                onChange={onChange}
                label="Different WhatsApp Number?"
                labelSize={TextSize.Medium}
                labelColor={Color.Black}
              />
            )}
          />
        </View>

        {showWhatsappNumber && (
          <>
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Large}
              className="mb-1"
            >
              WhatsApp Number
            </TextComponent>
            <View className="mb-2 flex-row gap-2.5">
              <View className="flex-[0.3]">
                <Controller
                  control={control}
                  name="whatsappCountryCode"
                  rules={{
                    validate: (value) =>
                      !showWhatsappNumber || !!value.trim() || "Code required",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      inputType={TextInputType.Phone}
                      inputField={{
                        value,
                        onChangeText: onChange,
                        placeholder: "Code",
                      }}
                      errorText={errors.whatsappCountryCode?.message}
                    />
                  )}
                />
              </View>
              <View className="flex-[0.7]">
                <Controller
                  control={control}
                  name="whatsappNumber"
                  rules={{
                    validate: (value) =>
                      !showWhatsappNumber ||
                      !!value.trim() ||
                      "WhatsApp number is required",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInputComponent
                      inputType={TextInputType.Phone}
                      inputField={{
                        value,
                        onChangeText: onChange,
                        placeholder: "WhatsApp Number",
                      }}
                      errorText={errors.whatsappNumber?.message}
                    />
                  )}
                />
              </View>
            </View>
          </>
        )}
        <View className="mb-2">
          <Controller
            control={control}
            name="emailAddress"
            rules={{
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Enter a valid email address",
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextInputComponent
                label="Email Address"
                inputType={TextInputType.Email}
                inputField={{
                  value,
                  onChangeText: onChange,
                  placeholder: "john.s@gmail.com",
                }}
                errorText={errors.emailAddress?.message}
              />
            )}
          />
        </View>

        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Small}
          className="mb-2 mt-4"
        >
          4. Additional Info
        </TextComponent>

        <FileUploadComponent
          title="Photo Upload"
          fileName={photoUploadName}
          onPress={() => void pickFile("photo", "Photo")}
          onRemove={() => {
            setPhotoFile(null);
            setPhotoUploadName("");
          }}
        />
        <FileUploadComponent
          title="Seal Upload"
          fileName={sealUploadName}
          onPress={() => void pickFile("seal", "Seal")}
          onRemove={() => {
            setSealFile(null);
            setSealUploadName("");
          }}
        />

        <View className="mt-[14px]">
          <ButtonComponent
            size={ButtonSize.Large}
            buttonColor={Color.Black}
            textColor={Color.White}
            disabled={isSaving}
            onPress={handleSubmit(onSave, onInvalid)}
          >
            {isSaving ? "Saving..." : "Save"}
          </ButtonComponent>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
