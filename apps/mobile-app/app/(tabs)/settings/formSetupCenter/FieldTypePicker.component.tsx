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
import { Modal, Pressable, ScrollView, Text, View } from "react-native";
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
    <View className="mb-4">
      {label && (
        <Text className="font-semibold text-sm text-black mb-2">{label}</Text>
      )}

      <Pressable
        ref={triggerRef}
        onPress={() => setIsOpen(!isOpen)}
        className={`flex-row items-center justify-between py-3.5 px-4 border rounded-lg bg-white ${
          isOpen ? "border-black" : "border-gray-400"
        }`}
      >
        <View className="flex-1">
          {selectedOption ? (
            <View className="flex-row items-center gap-3">
              <selectedOption.icon
                size={20}
                color={Color.Black}
                weight="regular"
              />
              <Text className="font-medium text-base text-black">
                {selectedOption.label}
              </Text>
            </View>
          ) : (
            <Text className="text-base text-gray-600">{placeholder}</Text>
          )}
        </View>
        <View className="ml-2">
          <CaretDownIcon
            size={20}
            color={Color.Grey}
            weight="bold"
            style={isOpen ? { transform: [{ rotate: "180deg" }] } : undefined}
          />
        </View>
      </Pressable>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-transparent"
          onPress={() => setIsOpen(false)}
        >
          <View
            className="absolute bg-white rounded-lg border border-gray-400 max-h-[300px] shadow-lg"
            style={{
              ...getDropdownPosition(),
              shadowColor: Color.Black,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
            onStartShouldSetResponder={() => true}
          >
            <ScrollView
              className="max-h-[300px]"
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
                    className={`flex-row items-center py-3 px-4 gap-3 border-b border-gray-100 ${
                      value === option.id ? "bg-[#FFF8F0]" : ""
                    } ${disabled ? "opacity-40" : ""}`}
                    disabled={disabled}
                  >
                    <IconComponent
                      size={20}
                      color={disabled ? Color.Grey : Color.Black}
                      weight="regular"
                    />
                    <Text
                      className={`font-medium text-base ${
                        disabled ? "text-gray-600" : "text-black"
                      }`}
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
