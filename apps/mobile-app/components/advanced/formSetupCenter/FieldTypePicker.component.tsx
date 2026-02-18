import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color } from "@repo/config";
import { useFonts } from "expo-font";
import { CaretDownIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { FieldTypePickerProps } from "./formConfig.types";

export function FieldTypePicker({
  value,
  onValueChange,
  options,
  placeholder = "Select field type",
  label,
  formType,
}: FieldTypePickerProps) {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const triggerRef = useRef<View>(null);

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setTriggerLayout({ x, y, width, height });
        }
      );
    }
  }, [isOpen]);

  const handleSelect = (optionId: string) => {
    onValueChange(optionId);
    setIsOpen(false);
  };

  const getDropdownPosition = () => {
    if (!triggerLayout) return {};
    return {
      top: triggerLayout.y + triggerLayout.height + 8,
      left: triggerLayout.x,
      width: triggerLayout.width,
    };
  };

  const isOptionDisabled = (option: FieldTypePickerProps["options"][0]) => {
    if (option.disabled) return true;
    if (formType && option.disabledForForms?.includes(formType)) return true;
    return false;
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <Pressable
        ref={triggerRef}
        onPress={() => setIsOpen(!isOpen)}
        style={[styles.trigger, isOpen && styles.triggerOpen]}
      >
        <View style={styles.triggerContent}>
          {selectedOption ? (
            <View style={styles.selectedOption}>
              <selectedOption.icon
                size={20}
                color={Color.Black}
                weight="regular"
              />
              <Text style={styles.selectedText}>{selectedOption.label}</Text>
            </View>
          ) : (
            <Text style={styles.placeholder}>{placeholder}</Text>
          )}
        </View>
        <CaretDownIcon
          size={20}
          color={Color.Grey}
          weight="bold"
          style={[styles.caret, isOpen && styles.caretOpen]}
        />
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setIsOpen(false)}>
          <View
            style={[styles.dropdown, getDropdownPosition()]}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              style={styles.optionsList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false}
            >
              {options.map((option) => {
                const IconComponent = option.icon;
                const disabled = isOptionDisabled(option);
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => !disabled && handleSelect(option.id)}
                    style={[
                      styles.option,
                      value === option.id && styles.optionSelected,
                      disabled && styles.optionDisabled,
                    ]}
                    disabled={disabled}
                  >
                    <IconComponent
                      size={20}
                      color={disabled ? Color.Grey : Color.Black}
                      weight="regular"
                    />
                    <Text
                      style={[
                        styles.optionText,
                        disabled && styles.optionTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Color.Black,
    marginBottom: 8,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Color.Grey,
    borderRadius: 8,
    backgroundColor: Color.White,
  },
  triggerOpen: {
    borderColor: Color.Black,
  },
  triggerContent: {
    flex: 1,
  },
  selectedOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  selectedText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Color.Black,
  },
  placeholder: {
    fontFamily: "DMSans_400Regular",
    fontSize: 16,
    color: Color.Grey,
  },
  caret: {
    marginLeft: 8,
  },
  caretOpen: {
    transform: [{ rotate: "180deg" }],
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  dropdown: {
    position: "absolute",
    backgroundColor: Color.White,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Color.Grey,
    maxHeight: 300,
    shadowColor: Color.Black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  optionsList: {
    maxHeight: 300,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  optionSelected: {
    backgroundColor: Color.LightCream,
  },
  optionDisabled: {
    opacity: 0.4,
  },
  optionText: {
    fontFamily: "DMSans_500Medium",
    fontSize: 16,
    color: Color.Black,
  },
  optionTextDisabled: {
    color: Color.Grey,
  },
});
