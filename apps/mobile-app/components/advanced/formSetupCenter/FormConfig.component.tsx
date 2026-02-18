import { TextComponent } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useFonts } from "expo-font";
import React, { useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AddFieldModal } from "./AddFieldModal.component";
import { FieldItem } from "./FieldItem.component";
import { FIELD_TYPES } from "./formConfig.constants";
import type { Field, FormConfigProps } from "./formConfig.types";

export function FormConfig({ visible, onClose, formTitle }: FormConfigProps) {
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
      const newField: Field = {
        id: Date.now().toString(),
        fieldType: fieldData.fieldType,
        fieldName: fieldData.fieldName,
        icon: fieldTypeOption.icon,
        isRequired: fieldData.isRequired,
        isShareEnabled: fieldData.isShareEnabled,
      };
      setFields((prev) => [...prev, newField]);
    }
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
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <TextComponent
              variant={TextVariant.Title}
              size={TextSize.Large}
              color={Color.Black}
              style={styles.heading}
            >
              {formTitle}
            </TextComponent>

            {/* Add Description Button */}
            <TouchableOpacity style={styles.addDescriptionButton}>
              <Text style={styles.addDescriptionText}>+ Add Description</Text>
            </TouchableOpacity>

            {/* Display Fields */}
            {fields.map((field) => (
              <FieldItem
                key={field.id}
                field={field}
                onPress={() => handleEditField(field.id)}
              />
            ))}

            {/* Add New Field Button */}
            <TouchableOpacity
              style={styles.addFieldButton}
              onPress={handleAddNewField}
            >
              <Text style={styles.addFieldText}>+ Add New Field</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
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
        editingField={getEditingFieldData()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.White,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  heading: {
    marginBottom: 24,
  },
  addDescriptionButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Color.White,
    marginBottom: 16,
  },
  addDescriptionText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: Color.Grey,
  },
  addFieldButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: Color.Black,
    alignItems: "center",
  },
  addFieldText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 16,
    color: Color.White,
  },
  actionSection: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Color.Grey,
    backgroundColor: Color.White,
  },
  closeButton: {
    backgroundColor: Color.Black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: "DMSans_600SemiBold",
    color: Color.White,
    fontSize: 16,
  },
});
