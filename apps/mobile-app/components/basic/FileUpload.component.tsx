import { Icons } from "@/config";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { TextComponent } from "./Text.component";

interface FileUploadComponentProps {
  title: string;
  onPress?: () => void;
  onRemove?: () => void;
  fileName?: string;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  title,
  onPress,
  onRemove,
  fileName,
}) => {
  const hasFile = !!fileName;

  return (
    <View className="mb-4 mt-1">
      <TextComponent
        variant={TextVariant.Body}
        size={TextSize.Large}
        className="mb-2 italic"
      >
        {title}
      </TextComponent>

      {!hasFile ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          className="min-h-[96px] items-center justify-center rounded-xl border-2 border-dashed border-[#D9D8CC] bg-[#FBF6E9] px-4 py-4"
        >
          <View className="rounded-lg bg-[#90C67C] px-5 py-3">
            <View className="flex-row items-center gap-2">
              <Icons.UploadIcon size={18} color={Color.DarkGreen} />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Medium}
                color={Color.DarkGreen}
              >
                Choose File
              </TextComponent>
            </View>
          </View>

          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Small}
            color={Color.Grey}
            className="mt-3 text-center"
          >
            Accepted formats: JPG, PNG, JPEG.{"\n"}
            Max file size: 5MB
          </TextComponent>
        </TouchableOpacity>
      ) : (
        <View className="min-h-[96px] flex-row items-center gap-4 rounded-xl border-2 border-dashed border-[#D9D8CC] bg-[#FBF6E9] px-4 py-4">
          <View className="items-center gap-3">
            <View className="h-[88px] w-[88px] items-center justify-center rounded-lg bg-white shadow-sm">
              <Icons.UploadIcon size={28} color={Color.Green} />
            </View>
          </View>
          <View>
            <View className="max-w-[180px]">
              <TextComponent
                variant={TextVariant.Title}
                size={TextSize.Small}
                color={Color.Black}
                className="mb-1"
              >
                {fileName}
              </TextComponent>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onRemove}
              className="flex-row items-center gap-2 rounded-lg bg-[#FF5B5B] px-4 py-2"
            >
              <Icons.Trash size={16} color={Color.White} />
              <TextComponent
                variant={TextVariant.Body}
                size={TextSize.Small}
                color={Color.White}
              >
                Remove
              </TextComponent>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
