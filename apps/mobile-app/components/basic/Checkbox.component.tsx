import {
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Checkbox as GluestackCheckbox,
} from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { View } from "react-native";
import { TextComponent } from "./Text.component";

export enum CheckboxSize {
  Small = "sm",
  Medium = "md",
  Large = "lg",
}

interface CheckboxComponentProps {
  value: string;
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
}

export const CheckboxComponent: React.FC<CheckboxComponentProps> = ({
  value,
  label,
  isChecked = false,
  onChange,
  size = CheckboxSize.Medium,
  isDisabled = false,
  isInvalid = false,
  labelVariant = TextVariant.Body,
  labelSize = TextSize.Medium,
  labelColor = Color.Black,
  className,
  containerClassName,
}) => {
  return (
    <View className={containerClassName}>
      <GluestackCheckbox
        value={value}
        isChecked={isChecked}
        onChange={onChange}
        size={size}
        isDisabled={isDisabled}
        isInvalid={isInvalid}
        className={className}
      >
        <CheckboxIndicator>
          <CheckboxIcon as={CheckIcon} />
        </CheckboxIndicator>

        {label && (
          <CheckboxLabel className="ml-2">
            <TextComponent
              variant={labelVariant}
              size={labelSize}
              color={labelColor}
            >
              {label}
            </TextComponent>
          </CheckboxLabel>
        )}
      </GluestackCheckbox>
    </View>
  );
};
