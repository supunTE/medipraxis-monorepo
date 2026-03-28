import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { TextComponent } from "./Text.component";

interface FileUploadComponentProps {
  title: string;
  onPress?: () => void;
  fileName?: string;
  helperText?: string;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  title,
  onPress,
  fileName,
  helperText = "You can add only pdf or image file up to 5mb",
}) => {
  return (
    <View className="mb-2 mt-1">
      <TextComponent
        variant={TextVariant.Body}
        size={TextSize.Small}
        className="mb-1.5"
      >
        {title}
      </TextComponent>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="min-h-[86px] items-center justify-center gap-[3px] rounded-lg border-[1.5px] border-dashed border-[#7A7A7A] bg-[#FBFBFB] px-3.5 py-2.5"
      >
        <Icons.UploadIcon size={20} color={Color.Black} />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Large}
          className="text-[28px] leading-[31px]"
        >
          Upload
        </TextComponent>
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Small}
          color={Color.Grey}
          className="text-center"
        >
          {fileName ?? helperText}
        </TextComponent>
      </TouchableOpacity>
    </View>
  );
};
