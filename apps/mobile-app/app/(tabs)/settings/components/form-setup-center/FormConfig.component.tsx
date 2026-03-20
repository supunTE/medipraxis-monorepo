import { useAuth } from "@/auth/AuthContext";
import {
  ButtonComponent,
  ButtonSize,
  MessagePopup,
  MessageType,
  TextComponent,
} from "@/components/basic";
import { useFetchActiveForm, useSaveForm } from "@/services/forms";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color, TextSize, TextVariant } from "@repo/config";
import { FormType } from "@repo/models";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AddFieldModal } from "./AddFieldModal.component";
import { FieldItem } from "./FieldItem.component";
import { FIELD_TYPES } from "./formConfig.constants";
import type { Field, FormConfigProps, FormData } from "./formConfig.types";

const formDataStore: Record<string, FormData> = {};

// Map form IDs to FormType enum values
const FORM_TYPE_MAPPING: Record<string, FormType> = {
  "1": FormType.CLIENT_DETAILS,
  "2": FormType.APPOINTMENT_RECORD,
  "3": FormType.REQUEST_FORM,
};

export function FormConfig({
  visible,
  onClose,
  formTitle,
  formType,
}: FormConfigProps) {
  const { user } = useAuth();
  const { mutate: saveForm, isPending: isSaving } = useSaveForm({
    onSuccess: () => {
      setMessageType(MessageType.Success);
      setMessageText("Form saved successfully!");
      setShowMessagePopup(true);
    },
    onError: (error: Error) => {
      setMessageType(MessageType.Error);
      setMessageText(error.message || "Failed to save the form");
      setShowMessagePopup(true);
    },
  });

  // Get the form type enum for API call
  const formTypeEnum = formType ? FORM_TYPE_MAPPING[formType] : undefined;

  // Fetch active form from API
  const { data: activeForm, isLoading: isLoadingForm } = useFetchActiveForm(
    user?.user_id || "",
    formTypeEnum!
  );

  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });

  const [fields, setFields] = useState<Field[]>([]);
  const [formDescription, setFormDescription] = useState("");
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [editingFieldSequence, setEditingFieldSequence] = useState<
    number | null
  >(null);
  const [draggingFieldSequence, setDraggingFieldSequence] = useState<
    number | null
  >(null);

  // Message popup state
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageType, setMessageType] = useState<MessageType>(
    MessageType.Success
  );
  const [messageText, setMessageText] = useState("");
  const draggingFieldSequenceRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number>(0);
  const descriptionInputRef = useRef<any>(null);

  // Load form data from API when component is visible and data is available
  useEffect(() => {
    if (visible && activeForm) {
      // Map API response to Field type with icons
      const mappedFields: Field[] = activeForm.form_configuration.map(
        (field) => {
          const fieldTypeOption = FIELD_TYPES.find(
            (type) => type.id === field.field_type
          );
          const defaultIcon = FIELD_TYPES[0]?.icon;
          return {
            ...field,
            icon: fieldTypeOption?.icon || defaultIcon!,
          };
        }
      );

      setFormDescription(activeForm.description || "");
      setFields(mappedFields);

      // Also update local store
      if (formType) {
        formDataStore[formType] = {
          description: activeForm.description || "",
          form_configuration: mappedFields,
        };
      }
    } else if (visible && !isLoadingForm && !activeForm) {
      // No active form exist
      const savedFormData = formType ? formDataStore[formType] : undefined;
      if (savedFormData) {
        setFormDescription(savedFormData.description || "");
        setFields(savedFormData.form_configuration || []);
      } else {
        setFormDescription("");
        setFields([]);
      }
    }
  }, [visible, activeForm, isLoadingForm, formType]);

  const handleSave = () => {
    // Save form data to the store for this form type
    if (formType && user?.user_id) {
      const formTypeEnum = FORM_TYPE_MAPPING[formType];

      if (!formTypeEnum) {
        console.error("Invalid form type:", formType);
        return;
      }

      const formData = {
        title: formTitle,
        description: formDescription,
        user_id: user.user_id,
        form_type: formTypeEnum,
        form_configuration: fields.map((field) => ({
          field_type: field.field_type,
          display_label: field.display_label,
          description: field.description,
          help_text: field.help_text,
          active: field.active,
          required: field.required,
          shareable: field.shareable,
          sequence: field.sequence,
        })),
      };

      formDataStore[formType] = {
        description: formDescription,
        form_configuration: fields,
      };

      saveForm(formData);
    }
  };

  const handleAddNewField = () => {
    setEditingFieldSequence(null);
    setShowAddFieldModal(true);
  };

  const handleEditField = (fieldSequence: number) => {
    setEditingFieldSequence(fieldSequence);
    setShowAddFieldModal(true);
  };

  const handleSaveField = (fieldData: {
    field_type: string;
    display_label: string;
    required: boolean;
    shareable: boolean;
  }) => {
    const fieldTypeOption = FIELD_TYPES.find(
      (type) => type.id === fieldData.field_type
    );

    if (!fieldTypeOption) return;

    if (editingFieldSequence !== null) {
      // Update existing field
      setFields((prev) =>
        prev.map((field) =>
          field.sequence === editingFieldSequence
            ? {
                ...field,
                field_type: fieldData.field_type,
                display_label: fieldData.display_label,
                icon: fieldTypeOption.icon,
                required: fieldData.required,
                shareable: fieldData.shareable,
                description: field.description || "",
                help_text: field.help_text || "",
                active: true,
              }
            : field
        )
      );
    } else {
      // Add new field
      const maxSequence =
        fields.length > 0 ? Math.max(...fields.map((f) => f.sequence)) : 0;
      const newField: Field = {
        field_type: fieldData.field_type,
        display_label: fieldData.display_label,
        description: "",
        help_text: "",
        active: true,
        required: fieldData.required,
        shareable: fieldData.shareable,
        icon: fieldTypeOption.icon,
        sequence: maxSequence + 1,
      };
      setFields((prev) =>
        [...prev, newField].sort((a, b) => a.sequence - b.sequence)
      );
    }
  };

  const handleDeleteField = () => {
    if (editingFieldSequence !== null) {
      setFields((prev) =>
        prev.filter((field) => field.sequence !== editingFieldSequence)
      );
      setShowAddFieldModal(false);
      setEditingFieldSequence(null);
    }
  };

  const moveFieldUp = (fieldSequence: number) => {
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);
    const currentIndex = sortedFields.findIndex(
      (f) => f.sequence === fieldSequence
    );

    if (currentIndex <= 0 || currentIndex >= sortedFields.length) return;

    const currentField = sortedFields[currentIndex];
    const previousField = sortedFields[currentIndex - 1];

    // Swap sequences with previous field
    const updatedFields = fields.map((f) => {
      if (f.sequence === currentField?.sequence) {
        return { ...f, sequence: previousField?.sequence ?? f.sequence };
      }
      if (f.sequence === previousField?.sequence) {
        return { ...f, sequence: currentField?.sequence ?? f.sequence };
      }
      return f;
    });

    setFields(updatedFields);
  };

  const moveFieldDown = (fieldSequence: number) => {
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);
    const currentIndex = sortedFields.findIndex(
      (f) => f.sequence === fieldSequence
    );

    if (currentIndex < 0 || currentIndex >= sortedFields.length - 1) return;

    const currentField = sortedFields[currentIndex];
    const nextField = sortedFields[currentIndex + 1];

    // Swap sequences with next field
    const updatedFields = fields.map((f) => {
      if (f.sequence === currentField?.sequence) {
        return { ...f, sequence: nextField?.sequence ?? f.sequence };
      }
      if (f.sequence === nextField?.sequence) {
        return { ...f, sequence: currentField?.sequence ?? f.sequence };
      }
      return f;
    });

    setFields(updatedFields);
  };

  const handleDragStart = (fieldSequence: number) => {
    draggingFieldSequenceRef.current = fieldSequence;
    dragStartYRef.current = 0;
    setDraggingFieldSequence(fieldSequence);
  };

  const handleDragMove = (_fieldSequence: number, y: number) => {
    if (dragStartYRef.current === 0) {
      dragStartYRef.current = y;
    } else if (draggingFieldSequenceRef.current !== null) {
      const deltaY = y - dragStartYRef.current;
      const threshold = 30;

      if (deltaY < -threshold) {
        // Dragged up
        moveFieldUp(draggingFieldSequenceRef.current);
        dragStartYRef.current = y;
      } else if (deltaY > threshold) {
        // Dragged down
        moveFieldDown(draggingFieldSequenceRef.current);
        dragStartYRef.current = y;
      }
    }
  };

  const handleDragEnd = (_fieldSequence: number) => {
    draggingFieldSequenceRef.current = null;
    dragStartYRef.current = 0;
    setDraggingFieldSequence(null);
  };

  const getEditingFieldData = () => {
    if (editingFieldSequence === null) return null;
    const field = fields.find((f) => f.sequence === editingFieldSequence);
    if (!field) return null;
    return {
      field_type: field.field_type,
      display_label: field.display_label,
      required: field.required,
      shareable: field.shareable,
    };
  };

  const handleDescriptionChange = (text: string) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= 200 || text === "") {
      setFormDescription(text);
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-white">
          {/* Header with Back Button */}
          <View className="px-5 pt-4 pb-2">
            <View style={{ alignSelf: "flex-start" }}>
              <ButtonComponent.BackButton
                size={ButtonSize.Small}
                onPress={onClose}
              />
            </View>
          </View>

          {/* Loading indicator while fetching form */}
          {isLoadingForm ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={Color.Green} />
              <Text className="mt-4 text-base" style={{ color: Color.Grey }}>
                Loading form configuration...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={!draggingFieldSequence}
              >
                {/* Title */}
                <TextComponent
                  variant={TextVariant.Title}
                  size={TextSize.Large}
                  color={Color.Black}
                  className="mb-6"
                >
                  {formTitle}
                </TextComponent>

                {/* Add/Edit Description */}
                {formDescription || isDescriptionFocused ? (
                  <View className="mb-4">
                    <TextInput
                      ref={descriptionInputRef}
                      className="py-3 px-4 rounded-lg bg-white text-base"
                      style={{
                        borderColor: isDescriptionFocused
                          ? Color.LightGrey
                          : "transparent",
                        borderWidth: 1,
                        color: Color.Black,
                      }}
                      placeholder="Enter form description (max 200 words)"
                      placeholderTextColor={Color.Grey}
                      value={formDescription}
                      onChangeText={handleDescriptionChange}
                      onFocus={() => setIsDescriptionFocused(true)}
                      onBlur={() => setIsDescriptionFocused(false)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    className="py-4 px-4 rounded-lg bg-white mb-4"
                    onPress={() => {
                      setIsDescriptionFocused(true);
                      setTimeout(
                        () => descriptionInputRef.current?.focus(),
                        100
                      );
                    }}
                  >
                    <Text className="text-base" style={{ color: Color.Grey }}>
                      + Add Description
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Display Fields */}
                {[...fields]
                  .sort((a, b) => a.sequence - b.sequence)
                  .map((field) => (
                    <FieldItem
                      key={field.sequence}
                      field={field}
                      onPress={() => handleEditField(field.sequence)}
                      onDragStart={() => handleDragStart(field.sequence)}
                      onDragMove={(y: number) =>
                        handleDragMove(field.sequence, y)
                      }
                      onDragEnd={() => handleDragEnd(field.sequence)}
                      isDragging={draggingFieldSequence === field.sequence}
                    />
                  ))}

                {/* Add New Field Button */}
                <TouchableOpacity
                  className="py-4 px-4 rounded-lg bg-black items-center"
                  onPress={handleAddNewField}
                >
                  <Text className="font-semibold text-base text-white">
                    + Add New Field
                  </Text>
                </TouchableOpacity>
              </ScrollView>

              {/* Action Footer */}
              <View
                className="absolute bottom-0 w-full px-4 py-5 border-t bg-white"
                style={{ borderTopColor: Color.LightGrey, borderTopWidth: 1 }}
              >
                <TouchableOpacity
                  className="bg-black py-3 px-6 rounded-lg items-center"
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={Color.White} />
                  ) : (
                    <Text className="font-semibold text-white text-base">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Add Field Modal */}
      <AddFieldModal
        visible={showAddFieldModal}
        onClose={() => {
          setShowAddFieldModal(false);
          setEditingFieldSequence(null);
        }}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
        editingField={getEditingFieldData()}
        formType={formType}
      />

      {/* Message Popup */}
      <MessagePopup
        visible={showMessagePopup}
        type={messageType}
        message={messageText}
        onClose={() => setShowMessagePopup(false)}
      />
    </>
  );
}
