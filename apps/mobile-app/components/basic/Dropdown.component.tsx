import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  type TextStyle as RNTextStyle,
  ScrollView,
  Text,
  View,
} from "react-native";
import { type z } from "zod";

// Option type for dropdown items
export interface DropdownOption {
  label: string;
  value: string;
}

// Props for the Dropdown component
interface DropdownProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  label?: string;
  isInvalid?: boolean;
  validationSchema?: z.ZodString;
  validateOnChange?: boolean;
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

// Dropdown Component
const DropdownComponent = ({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  label,
  isInvalid = false,
  validationSchema,
  validateOnChange = true,
}: DropdownProps) => {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<View>(null);

  // Validate input
  useEffect(() => {
    if (!validationSchema) {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    if (!validateOnChange && value === "") {
      setValidationError(null);
      setIsValid(false);
      return;
    }

    const result = validationSchema.safeParse(value);

    if (result.success) {
      setValidationError(null);
      setIsValid(true);
    } else {
      setIsValid(false);
      if (value !== "") {
        const zodError = result.error.issues[0]?.message || "Invalid selection";
        setValidationError(zodError);
      } else {
        setValidationError(null);
      }
    }
  }, [value, validationSchema, validateOnChange]);

  // Determine border color based on validation
  const getBorderColor = () => {
    if (isInvalid || validationError) return Color.Danger;
    if (isValid && value !== "") return Color.Success;
    return Color.LightGrey;
  };

  // Determine message to display and color
  const message = validationError;
  const messageColor = Color.Danger;

  // Get selected option label
  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onValueChange(optionValue);
    setIsOpen(false);
  };

  return (
    <View className="w-full">
      {label && (
        <Text
          className="mb-2"
          style={{
            color: Color.Black,
            fontFamily:
              textBodyLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textBodyLargeStyle.fontSize,
            fontWeight: String(
              textBodyLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {label}
        </Text>
      )}

      <Pressable
        ref={triggerRef}
        onPress={() => setIsOpen(!isOpen)}
        className="border rounded-lg w-full h-[50px] flex-row items-center justify-between px-4"
        style={{
          borderColor: getBorderColor(),
          backgroundColor: Color.White,
        }}
      >
        <Text
          className="flex-1"
          style={{
            color: value ? Color.Black : Color.Grey,
            fontFamily:
              textBodyLargeStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textBodyLargeStyle.fontSize,
            fontWeight: String(
              textBodyLargeStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {displayValue}
        </Text>
        <Icons.CaretDown size={20} color={Color.Grey} weight="regular" />
      </Pressable>

      <DropdownPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        triggerRef={triggerRef}
      >
        <DropdownContent>
          <View className="bg-white">
            {/* Default unselect option */}
            <Pressable
              onPress={() => handleSelect("")}
              className={`py-3 px-4 border-b border-gray-100 ${
                value === "" ? "bg-gray-100" : ""
              }`}
            >
              <Text
                className="text-gray-400"
                style={{
                  fontFamily:
                    textBodyLargeStyle.fontFamily === Font.DMsans
                      ? "DMSans_400Regular"
                      : "Lato_400Regular",
                  fontSize: textBodyLargeStyle.fontSize,
                }}
              >
                {placeholder}
              </Text>
            </Pressable>

            {options.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => handleSelect(option.value)}
                className={`py-3 px-4 border-b border-gray-100 ${
                  value === option.value ? "bg-gray-100" : ""
                }`}
              >
                <Text
                  className={
                    value === option.value
                      ? "font-semibold text-gray-900"
                      : "text-gray-700"
                  }
                  style={{
                    fontFamily:
                      textBodyLargeStyle.fontFamily === Font.DMsans
                        ? "DMSans_400Regular"
                        : "Lato_400Regular",
                    fontSize: textBodyLargeStyle.fontSize,
                  }}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </DropdownContent>
      </DropdownPortal>

      {message && (
        <Text
          className="mt-1 ml-1"
          style={{
            color: messageColor,
            fontFamily:
              textBodySmallStyle.fontFamily === Font.DMsans
                ? "DMSans_400Regular"
                : "Lato_400Regular",
            fontSize: textBodySmallStyle.fontSize,
            fontWeight: String(
              textBodySmallStyle.fontWeight
            ) as RNTextStyle["fontWeight"],
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
};

// Export
export { DropdownComponent };
