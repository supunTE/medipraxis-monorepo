import { TextInput, ToggleButton, ToggleSize } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { useFonts } from "expo-font";
import { Trash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { FieldTypePicker } from "./FieldTypePicker.component";
import { FIELD_TYPES } from "./formConfig.constants";
import type { AddFieldModalProps } from "./formConfig.types";

export function AddFieldModal({
  visible,
  onClose,
  onSave,
  onDelete,
  editingField,
  formType,
}: AddFieldModalProps) {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });

  const [selectedFieldType, setSelectedFieldType] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [isShareEnabled, setIsShareEnabled] = useState(false);

  // Populate form when editing existing field
  useEffect(() => {
    if (editingField) {
      setSelectedFieldType(editingField.field_type);
      setFieldName(editingField.display_label);
      setIsRequired(editingField.required);
      setIsShareEnabled(editingField.shareable);
    } else {
      setSelectedFieldType("");
      setFieldName("");
      setIsRequired(false);
      setIsShareEnabled(false);
    }
  }, [editingField, visible]);

  const handleFieldTypeChange = (fieldTypeId: string) => {
    setSelectedFieldType(fieldTypeId);
  };

  const handleDelete = () => {
    onDelete?.();
  };

  const handleSave = () => {
    if (selectedFieldType && fieldName.trim()) {
      onSave?.({
        field_type: selectedFieldType,
        display_label: fieldName.trim(),
        required: isRequired,
        shareable: isShareEnabled,
      });
      // Reset form
      setSelectedFieldType("");
      setFieldName("");
      setIsRequired(false);
      setIsShareEnabled(false);
      onClose();
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View
          className="bg-white rounded-xl w-full max-w-[500px]"
          style={{ maxHeight: "80%" }}
        >
          {/* Header with Delete Icon */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-300/30">
            <Text className="font-semibold text-xl text-black">
              {editingField ? "Edit Field" : "Add New Field"}
            </Text>
            {editingField && (
              <TouchableOpacity onPress={handleDelete} className="p-1">
                <Trash size={24} color="#EF4444" weight="regular" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={{ flexGrow: 0, flexShrink: 1 }}
            contentContainerStyle={{ padding: 20 }}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            {/* Field Type Dropdown */}
            <FieldTypePicker
              value={selectedFieldType}
              onValueChange={handleFieldTypeChange}
              options={FIELD_TYPES}
              label="Field Type"
              placeholder="Select field type"
              formType={formType}
            />

            {/* Field Name Section */}
            <View className="mt-5 mb-5">
              <Text className="font-medium text-sm text-black mb-2">
                Field Name
              </Text>
              <TextInput
                inputField={{
                  value: fieldName,
                  onChangeText: setFieldName,
                  placeholder: "Enter field name",
                }}
              />
            </View>

            {/* Horizontal Line */}
            <View className="h-[1px] bg-gray-300/30 my-5" />

            {/* Toggles Section */}
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 flex-row justify-between items-center py-3 px-4 rounded-lg">
                <Text className="font-medium text-sm text-black">Required</Text>
                <ToggleButton
                  size={ToggleSize.Medium}
                  isActive={isRequired}
                  onToggle={setIsRequired}
                />
              </View>

              <View className="flex-1 flex-row justify-between items-center py-3 px-4 rounded-lg">
                <Text className="font-medium text-sm text-black">
                  Enable Share
                </Text>
                <ToggleButton
                  size={ToggleSize.Medium}
                  isActive={isShareEnabled}
                  onToggle={setIsShareEnabled}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row gap-3 px-5 py-4 border-t border-gray-300/30">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-white border border-black items-center"
              onPress={onClose}
            >
              <Text className="font-semibold text-base text-black">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-3 rounded-lg items-center ${
                !selectedFieldType || !fieldName.trim()
                  ? "bg-gray-400 opacity-50"
                  : "bg-black"
              }`}
              onPress={handleSave}
              disabled={!selectedFieldType || !fieldName.trim()}
            >
              <Text className="font-semibold text-base text-white">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
