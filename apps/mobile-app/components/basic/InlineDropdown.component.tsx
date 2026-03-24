import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import { CaretDownIcon } from "phosphor-react-native";
import React, { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  type TextStyle as RNTextStyle,
} from "react-native";

const DROPDOWN_MIN_WIDTH = 200;
const DROPDOWN_MAX_HEIGHT = 200;
const DROPDOWN_OFFSET = 4;
const CARET_ICON_SIZE = 16;

const textBodyMediumStyle = textStyles[TextVariant.Body][TextSize.Medium];

export interface InlineDropdownOption {
  label: string;
  value: string;
}

interface InlineDropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: InlineDropdownOption[];
  placeholder?: string;
}

export const InlineDropdownComponent: React.FC<InlineDropdownProps> = ({
  value,
  onValueChange,
  options,
  placeholder = "Select",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<View>(null);
  const [dropdownLayout, setDropdownLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder;

  const handleOpenDropdown = () => {
    if (dropdownRef.current) {
      dropdownRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          setDropdownLayout({ x, y, width, height });
          setIsOpen(true);
        }
      );
    }
  };

  const handleSelectOption = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <>
      <Pressable
        ref={dropdownRef}
        onPress={handleOpenDropdown}
        className="flex-row items-center gap-1"
      >
        <Text
          style={{
            color: value ? Color.Black : Color.Grey,
            fontFamily:
              textBodyMediumStyle.fontFamily === Font.DMsans
                ? "DMSans_600SemiBold"
                : "Lato_600SemiBold",
            fontSize: textBodyMediumStyle.fontSize,
            fontWeight: "600" as RNTextStyle["fontWeight"],
          }}
        >
          {displayValue}
        </Text>
        <CaretDownIcon
          size={CARET_ICON_SIZE}
          color={Color.Grey}
          weight="regular"
        />
      </Pressable>

      <Modal transparent visible={isOpen} animationType="none">
        <Pressable className="flex-1" onPress={() => setIsOpen(false)} />
        {dropdownLayout && (
          <View
            className="absolute bg-white rounded-xl shadow-lg overflow-hidden"
            style={{
              top: dropdownLayout.y + dropdownLayout.height + DROPDOWN_OFFSET,
              left: dropdownLayout.x,
              minWidth: DROPDOWN_MIN_WIDTH,
              maxHeight: DROPDOWN_MAX_HEIGHT,
              borderColor: Color.LightGrey,
              borderWidth: 1,
              shadowColor: Color.Black,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 5,
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {options
                .sort((a, b) => a.label.localeCompare(b.label))
                .map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelectOption(option.value)}
                    className="py-3 px-4"
                    style={{
                      borderBottomWidth: 1,
                      borderBottomColor: Color.LightGrey,
                      backgroundColor:
                        value === option.value ? Color.LightGrey : Color.White,
                    }}
                  >
                    <Text
                      style={{
                        color: Color.Black,
                        fontFamily:
                          textBodyMediumStyle.fontFamily === Font.DMsans
                            ? "DMSans_400Regular"
                            : "Lato_400Regular",
                        fontSize: textBodyMediumStyle.fontSize,
                        fontWeight:
                          value === option.value
                            ? ("600" as RNTextStyle["fontWeight"])
                            : ("400" as RNTextStyle["fontWeight"]),
                      }}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        )}
      </Modal>
    </>
  );
};
