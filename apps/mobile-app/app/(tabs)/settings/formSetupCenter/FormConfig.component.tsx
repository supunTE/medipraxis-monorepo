import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import {
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

export function FormConfig({
  visible,
  onClose,
  formTitle,
  formType,
}: FormConfigProps) {
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
  const draggingFieldSequenceRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number>(0);
  const descriptionInputRef = useRef<any>(null);

  // Load form data for the specific form type
  useEffect(() => {
    if (formType && visible) {
      const savedFormData = formDataStore[formType];
      if (savedFormData) {
        setFormDescription(savedFormData.description || "");
        setFields(savedFormData.form_structure || []);
      } else {
        setFormDescription("");
        setFields([]);
      }
    }
  }, [formType, visible]);

  const handleSave = () => {
    // Save form data to the store for this form type
    if (formType) {
      const formData = {
        description: formDescription,
        form_structure: fields,
      };
      formDataStore[formType] = formData;

      //TO DO: API call to save form struct
      console.log("Form Data JSON:", JSON.stringify(formData, null, 2));
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
          <View className="px-5 pt-4 pb-2 flex-row items-center">
            <ButtonComponent.BackButton
              size={ButtonSize.Small}
              onPress={onClose}
            />
          </View>

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
                  setTimeout(() => descriptionInputRef.current?.focus(), 100);
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
                  onDragMove={(y: number) => handleDragMove(field.sequence, y)}
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
            >
              <Text className="font-semibold text-white text-base">Save</Text>
            </TouchableOpacity>
          </View>
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
    </>
  );
}
