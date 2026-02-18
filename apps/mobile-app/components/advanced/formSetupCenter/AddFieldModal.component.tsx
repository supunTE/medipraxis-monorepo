import { TextInput, ToggleButton, ToggleSize } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { Trash } from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FieldTypePicker } from "./FieldTypePicker.component";
import { FIELD_TYPES } from "./formConfig.constants";
import type { AddFieldModalProps } from "./formConfig.types";

export function AddFieldModal({
  visible,
  onClose,
  onSave,
  onDelete,
  editingField,
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
      setSelectedFieldType(editingField.fieldType);
      setFieldName(editingField.fieldName);
      setIsRequired(editingField.isRequired);
      setIsShareEnabled(editingField.isShareEnabled);
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
        fieldType: selectedFieldType,
        fieldName: fieldName.trim(),
        isRequired,
        isShareEnabled,
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
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with Delete Icon */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {editingField ? "Edit Field" : "Add New Field"}
            </Text>
            {editingField && (
              <TouchableOpacity
                onPress={handleDelete}
                style={styles.deleteButton}
              >
                <Trash size={24} color="#EF4444" weight="regular" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Field Type Dropdown */}
            <FieldTypePicker
              value={selectedFieldType}
              onValueChange={handleFieldTypeChange}
              options={FIELD_TYPES}
              label="Field Type"
              placeholder="Select field type"
            />

            {/* Field Name Section */}
            <View style={styles.fieldNameSection}>
              <Text style={styles.fieldNameHeading}>Field Name</Text>
              <TextInput
                inputField={{
                  value: fieldName,
                  onChangeText: setFieldName,
                  placeholder: "Enter field name",
                }}
              />
            </View>

            {/* Horizontal Line */}
            <View style={styles.divider} />

            {/* Toggles Section */}
            <View style={styles.togglesContainer}>
              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Required</Text>
                <ToggleButton
                  size={ToggleSize.Medium}
                  isActive={isRequired}
                  onToggle={setIsRequired}
                />
              </View>

              <View style={styles.toggleItem}>
                <Text style={styles.toggleLabel}>Enable Share</Text>
                <ToggleButton
                  size={ToggleSize.Medium}
                  isActive={isShareEnabled}
                  onToggle={setIsShareEnabled}
                />
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!selectedFieldType || !fieldName.trim()) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!selectedFieldType || !fieldName.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Color.White,
    borderRadius: 12,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Color.Grey + "30",
  },
  headerTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 20,
    color: Color.Black,
  },
  deleteButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  fieldNameSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  fieldNameHeading: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: Color.Black,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: Color.Grey + "30",
    marginVertical: 20,
  },
  togglesContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  toggleItem: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  toggleLabel: {
    fontFamily: "DMSans_500Medium",
    fontSize: 14,
    color: Color.Black,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Color.Grey + "30",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Color.White,
    borderWidth: 1,
    borderColor: Color.Black,
    alignItems: "center",
  },
  cancelButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: Color.Black,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Color.Black,
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: Color.Grey,
    opacity: 0.5,
  },
  saveButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: Color.White,
  },
});
