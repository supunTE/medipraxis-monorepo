import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { TextComponent } from "./Text.component";

export enum CheckboxSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

interface CheckboxComponentProps {
  label?: string;
  isChecked?: boolean;
  onChange?: (isChecked: boolean) => void;
  size?: CheckboxSize;
  isDisabled?: boolean;
  isInvalid?: boolean;
  labelVariant?: TextVariant;
  labelSize?: Exclude<TextSize, TextSize.ExtraLarge>;
  labelColor?: Color;
  className?: string;
  containerClassName?: string;
  shrinkLabel?: boolean;
}

export const CheckboxComponent: React.FC<CheckboxComponentProps> = ({
  label,
  isChecked = false,
  onChange,
  isDisabled = false,
  isInvalid = false,
  labelVariant = TextVariant.Body,
  labelSize = TextSize.Medium,
  labelColor = Color.Black,
  containerClassName,
  shrinkLabel = true,
}) => {
  const color = isInvalid ? Color.Danger : Color.Black;

  return (
    <TouchableOpacity
      onPress={() => !isDisabled && onChange?.(!isChecked)}
      className={`flex-row ${shrinkLabel ? "items-center" : "items-start"} gap-2.5 ${!shrinkLabel ? "w-full" : ""} ${containerClassName ?? ""}`}
      activeOpacity={0.7}
      disabled={isDisabled}
    >
      <View
        className="w-[22px] h-[22px] rounded-md border-2 justify-center items-center"
        style={{
          borderColor: isChecked ? color : Color.Grey,
          backgroundColor: isChecked ? color : "transparent",
        }}
      >
        {isChecked && (
          <View
            style={{
              width: 12,
              height: 6,
              borderLeftWidth: 2,
              borderBottomWidth: 2,
              borderColor: Color.White,
              transform: [{ rotate: "-45deg" }, { translateY: -1 }],
            }}
          />
        )}
      </View>
      {label !== undefined && (
        <View style={shrinkLabel ? undefined : { flex: 1 }}>
          <TextComponent
            variant={labelVariant}
            size={labelSize}
            color={labelColor}
          >
            {label}
          </TextComponent>
        </View>
      )}
    </TouchableOpacity>
  );
};
