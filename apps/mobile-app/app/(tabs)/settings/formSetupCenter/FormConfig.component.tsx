import { TextComponent } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useFonts } from "expo-font";
import React, { useEffect, useRef, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AddFieldModal } from "./AddFieldModal.component";
import { FieldItem } from "./FieldItem.component";
import { FIELD_TYPES } from "./formConfig.constants";
import type { Field, FormConfigProps } from "./formConfig.types";

const formFieldsStore: Record<string, Field[]> = {};

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
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [draggingFieldId, setDraggingFieldId] = useState<string | null>(null);
  const draggingFieldIdRef = useRef<string | null>(null);
  const dragStartYRef = useRef<number>(0);

  // Load fields for the specific form type
  useEffect(() => {
    if (formType && visible) {
      const savedFields = formFieldsStore[formType] || [];
      setFields(savedFields);
    }
  }, [formType, visible]);

  const handleSave = () => {
    // Save fields to the store for this form type
    if (formType) {
      formFieldsStore[formType] = fields;
    }
  };

  const handleAddNewField = () => {
    setEditingFieldId(null);
    setShowAddFieldModal(true);
  };

  const handleEditField = (fieldId: string) => {
    setEditingFieldId(fieldId);
    setShowAddFieldModal(true);
  };

  const handleSaveField = (fieldData: {
    fieldType: string;
    fieldName: string;
    isRequired: boolean;
    isShareEnabled: boolean;
  }) => {
    const fieldTypeOption = FIELD_TYPES.find(
      (type) => type.id === fieldData.fieldType
    );

    if (!fieldTypeOption) return;

    if (editingFieldId) {
      // Update existing field
      setFields((prev) =>
        prev.map((field) =>
          field.id === editingFieldId
            ? {
                ...field,
                fieldType: fieldData.fieldType,
                fieldName: fieldData.fieldName,
                icon: fieldTypeOption.icon,
                isRequired: fieldData.isRequired,
                isShareEnabled: fieldData.isShareEnabled,
              }
            : field
        )
      );
    } else {
      // Add new field
      const maxSequence =
        fields.length > 0 ? Math.max(...fields.map((f) => f.sequence)) : 0;
      const newField: Field = {
        id: Date.now().toString(),
        fieldType: fieldData.fieldType,
        fieldName: fieldData.fieldName,
        icon: fieldTypeOption.icon,
        isRequired: fieldData.isRequired,
        isShareEnabled: fieldData.isShareEnabled,
        sequence: maxSequence + 1,
      };
      setFields((prev) =>
        [...prev, newField].sort((a, b) => a.sequence - b.sequence)
      );
    }
  };

  const handleDeleteField = () => {
    if (editingFieldId) {
      setFields((prev) => prev.filter((field) => field.id !== editingFieldId));
      setShowAddFieldModal(false);
      setEditingFieldId(null);
    }
  };

  const moveFieldUp = (fieldId: string) => {
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);
    const currentIndex = sortedFields.findIndex((f) => f.id === fieldId);

    if (currentIndex <= 0 || currentIndex >= sortedFields.length) return;

    const currentField = sortedFields[currentIndex];
    const previousField = sortedFields[currentIndex - 1];

    // Swap sequences with previous field
    const updatedFields = fields.map((f) => {
      if (f.id === currentField?.id) {
        return { ...f, sequence: previousField?.sequence ?? f.sequence };
      }
      if (f.id === previousField?.id) {
        return { ...f, sequence: currentField?.sequence ?? f.sequence };
      }
      return f;
    });

    setFields(updatedFields);
  };

  const moveFieldDown = (fieldId: string) => {
    const sortedFields = [...fields].sort((a, b) => a.sequence - b.sequence);
    const currentIndex = sortedFields.findIndex((f) => f.id === fieldId);

    if (currentIndex < 0 || currentIndex >= sortedFields.length - 1) return;

    const currentField = sortedFields[currentIndex];
    const nextField = sortedFields[currentIndex + 1];

    // Swap sequences with next field
    const updatedFields = fields.map((f) => {
      if (f.id === currentField?.id) {
        return { ...f, sequence: nextField?.sequence ?? f.sequence };
      }
      if (f.id === nextField?.id) {
        return { ...f, sequence: currentField?.sequence ?? f.sequence };
      }
      return f;
    });

    setFields(updatedFields);
  };

  const handleDragStart = (fieldId: string) => {
    draggingFieldIdRef.current = fieldId;
    dragStartYRef.current = 0;
    setDraggingFieldId(fieldId);
  };

  const handleDragMove = (_fieldId: string, y: number) => {
    if (dragStartYRef.current === 0) {
      dragStartYRef.current = y;
    } else if (draggingFieldIdRef.current) {
      const deltaY = y - dragStartYRef.current;
      const threshold = 30;

      if (deltaY < -threshold) {
        // Dragged up
        moveFieldUp(draggingFieldIdRef.current);
        dragStartYRef.current = y;
      } else if (deltaY > threshold) {
        // Dragged down
        moveFieldDown(draggingFieldIdRef.current);
        dragStartYRef.current = y;
      }
    }
  };

  const handleDragEnd = (_fieldId: string) => {
    draggingFieldIdRef.current = null;
    dragStartYRef.current = 0;
    setDraggingFieldId(null);
  };

  const getEditingFieldData = () => {
    if (!editingFieldId) return null;
    const field = fields.find((f) => f.id === editingFieldId);
    if (!field) return null;
    return {
      fieldType: field.fieldType,
      fieldName: field.fieldName,
      isRequired: field.isRequired,
      isShareEnabled: field.isShareEnabled,
    };
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
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingBottom: 160 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={!draggingFieldId}
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

            {/* Add Description Button */}
            <TouchableOpacity className="py-4 px-4 rounded-lg bg-white mb-4">
              <Text className="text-base text-gray-600">+ Add Description</Text>
            </TouchableOpacity>

            {/* Display Fields */}
            {[...fields]
              .sort((a, b) => a.sequence - b.sequence)
              .map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  onPress={() => handleEditField(field.id)}
                  onDragStart={() => handleDragStart(field.id)}
                  onDragMove={(y: number) => handleDragMove(field.id, y)}
                  onDragEnd={() => handleDragEnd(field.id)}
                  isDragging={draggingFieldId === field.id}
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
            className="absolute bottom-0 w-full px-4 py-5 border-t bg-white gap-3"
            style={{ borderTopColor: Color.LightGrey, borderTopWidth: 1 }}
          >
            <TouchableOpacity
              className="bg-black py-3 px-6 rounded-lg items-center"
              onPress={handleSave}
            >
              <Text className="font-semibold text-white text-base">Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white py-3 px-6 rounded-lg items-center border"
              style={{ borderColor: Color.Black, borderWidth: 1 }}
              onPress={onClose}
            >
              <Text className="font-semibold text-black text-base">Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Field Modal */}
      <AddFieldModal
        visible={showAddFieldModal}
        onClose={() => {
          setShowAddFieldModal(false);
          setEditingFieldId(null);
        }}
        onSave={handleSaveField}
        onDelete={handleDeleteField}
        editingField={getEditingFieldData()}
        formType={formType}
      />
    </>
  );
}
