import { Color, TextSize, TextVariant, textStyles } from "@repo/config";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

// Props for the NumberDropdown component
interface NumberDropdownProps {
  value: number;
  onValueChange: (value: number) => void;
  maxNumber: number;
  minNumber?: number;
  placeholder?: string;
  label?: string;
  helperText?: string;
  errorText?: string;
  showHelperText?: boolean;
  readOnly?: boolean;
}

// Text styles
const textBodyLargeStyle = textStyles[TextVariant.Body][TextSize.Large];
const textBodySmallStyle = textStyles[TextVariant.Body][TextSize.Small];

// Custom Dropdown Portal Component
interface DropdownPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  triggerRef: React.RefObject<View | null>;
}

const DropdownPortal = ({
  isOpen,
  onClose,
  children,
  triggerRef,
}: DropdownPortalProps) => {
  const [triggerLayout, setTriggerLayout] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [openUpwards, setOpenUpwards] = useState(false);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      triggerRef.current.measureInWindow(
        (x: number, y: number, width: number, height: number) => {
          const screenHeight = Dimensions.get("window").height;
          const dropdownMaxHeight = 300;
          const spaceBelow = screenHeight - (y + height);
          const spaceAbove = y;

          const shouldOpenUpwards =
            spaceBelow < dropdownMaxHeight && spaceAbove > spaceBelow;

          setTriggerLayout({ x, y, width, height });
          setOpenUpwards(shouldOpenUpwards);
        }
      );
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) return null;

  const getDropdownPosition = () => {
    if (!triggerLayout) return {};
    const screenHeight = Dimensions.get("window").height;

    if (openUpwards) {
      return {
        bottom: screenHeight - triggerLayout.y - 40,
        left: triggerLayout.x,
        width: triggerLayout.width,
      };
    } else {
      return {
        top: triggerLayout.y + triggerLayout.height + 10,
        left: triggerLayout.x,
        width: triggerLayout.width,
      };
    }
  };

  return (
    <Modal transparent visible={isOpen} animationType="none">
      <Pressable className="flex-1 bg-black/10" onPress={onClose} />
      {triggerLayout && (
        <Pressable
          className="absolute bg-white rounded-xl shadow-sm max-h-[300px] overflow-hidden"
          style={[
            getDropdownPosition(),
            {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
              elevation: 2,
            },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      )}
    </Modal>
  );
};

interface DropdownContentProps {
  children: React.ReactNode;
}

const DropdownContent = ({ children }: DropdownContentProps) => {
  return (
    <View className="flex-1">
      <ScrollView
        className="max-h-[300px]"
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {children}
      </ScrollView>
    </View>
  );
};

// NumberDropdown Component
export const NumberDropdownComponent = ({
  value,
  onValueChange,
  maxNumber,
  minNumber = 1,
  placeholder = "Select a number",
  label,
  helperText,
  errorText,
  showHelperText = true,
  readOnly = false,
}: NumberDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  // Determine border color based on error state
  const getBorderColor = () => {
    if (errorText) return Color.Danger;
    return Color.LightGrey;
  };

  // Get helper text to display
  const getHelperText = (): string | null => {
    if (!showHelperText) return null;
    if (errorText) return errorText;
    return helperText || null;
  };

  // Determine helper text color
  const getHelperTextColor = () => {
    if (errorText) return Color.Danger;
    return Color.Grey;
  };

  // Get selected display value
  const displayValue = value ? value.toString() : placeholder;

  // Handle number selection
  const handleSelect = (numberValue: number) => {
    onValueChange(numberValue);
    setIsOpen(false);
  };

  const displayedHelperText = getHelperText();

  // Generate number options
  const numberOptions = Array.from(
    { length: maxNumber - minNumber + 1 },
    (_, i) => minNumber + i
  );

  return (
    <View className="w-full">
      {label && (
        <Text
          className="mb-2"
          style={{
            color: Color.Black,
            fontFamily: "DMSans_600SemiBold",
            fontSize: textBodyLargeStyle.fontSize,
          }}
        >
          {label}
        </Text>
      )}

      <Pressable
        ref={triggerRef}
        className="h-[48px] bg-white rounded-lg px-4 justify-center"
        style={{
          borderWidth: 1,
          borderColor: getBorderColor(),
        }}
        onPress={() => !readOnly && setIsOpen(!isOpen)}
        disabled={readOnly}
      >
        <Text
          style={{
            color: value ? Color.Black : Color.Grey,
            fontFamily: "DMSans_400Regular",
            fontSize: textBodyLargeStyle.fontSize,
          }}
        >
          {displayValue}
        </Text>
      </Pressable>

      {displayedHelperText && (
        <Text
          className="mt-1 ml-1"
          style={{
            color: getHelperTextColor(),
            fontFamily: "DMSans_400Regular",
            fontSize: textBodySmallStyle.fontSize,
          }}
        >
          {displayedHelperText}
        </Text>
      )}

      <DropdownPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      >
        <DropdownContent>
          {numberOptions.map((num) => {
            const isSelected = value === num;
            return (
              <Pressable
                key={num}
                className="px-5 py-3.5"
                style={{
                  backgroundColor: isSelected
                    ? "rgba(144, 198, 124, 0.1)"
                    : "transparent",
                }}
                onPress={() => handleSelect(num)}
              >
                <Text
                  style={{
                    color: isSelected ? Color.Green : Color.Black,
                    fontFamily: isSelected
                      ? "DMSans_600SemiBold"
                      : "DMSans_400Regular",
                    fontSize: textBodyLargeStyle.fontSize,
                  }}
                >
                  {num}
                </Text>
              </Pressable>
            );
          })}
        </DropdownContent>
      </DropdownPortal>
    </View>
  );
};
