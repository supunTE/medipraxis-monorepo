import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { Color, TextSize, TextVariant } from "@repo/config";
import { useFonts } from "expo-font";
import { PencilSimpleIcon } from "phosphor-react-native";
import React, { useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { FormConfig } from "./FormConfig.component";
import { FORM_TILES } from "./formSetupCenter.constants";
import type { FormSetupCenterProps } from "./formSetupCenter.types";

export function FormSetupCenter({ visible, onClose }: FormSetupCenterProps) {
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    Lato_400Regular,
    Lato_700Bold,
  });

  const [showFormConfig, setShowFormConfig] = useState(false);
  const [selectedFormTitle, setSelectedFormTitle] = useState("");
  const [selectedFormId, setSelectedFormId] = useState("");

  const handleTilePress = (tileId: string, tileTitle: string) => {
    setSelectedFormId(tileId);
    setSelectedFormTitle(tileTitle);
    setShowFormConfig(true);
  };

  if (!fontsLoaded) {
    return null;
  }

  const content = (
    <View className="flex-1 bg-white">
      {/* Back Button - only show in modal mode */}
      {onClose && (
        <View className="px-5 pt-4 pb-2">
          <View style={{ alignSelf: "flex-start" }}>
            <ButtonComponent.BackButton
              size={ButtonSize.Small}
              onPress={onClose}
            />
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="px-5 mb-[30px]">
          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Large}
            color={Color.Black}
            className="mb-2"
          >
            Form Setup Center
          </TextComponent>
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            color={Color.Grey}
            className="mt-1"
          >
            Forms that adapt to your needs
          </TextComponent>
        </View>

        {/* Tiles Section */}
        <View className="px-4 gap-4">
          {FORM_TILES.map((tile) => (
            <View
              key={tile.id}
              className="flex-row bg-[#FFF8F0] rounded-xl p-4 border border-gray-400 shadow-sm"
            >
              <Image
                source={tile.image}
                className="w-20 h-20 mr-4"
                resizeMode="contain"
              />
              <View className="flex-1 justify-start">
                <Text className="font-semibold text-lg text-black mb-1">
                  {tile.title}
                </Text>
                <Text className="text-sm text-gray-600 leading-5 mb-3">
                  {tile.description}
                </Text>
                <TouchableOpacity
                  className="flex-row items-center justify-center bg-black py-2.5 px-4 rounded-md gap-2"
                  onPress={() => handleTilePress(tile.id, tile.title)}
                  activeOpacity={0.7}
                >
                  <PencilSimpleIcon
                    size={20}
                    color={Color.White}
                    weight="regular"
                  />
                  <Text className="font-semibold text-sm text-white">Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <>
      {visible !== undefined ? (
        <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          {content}
        </Modal>
      ) : (
        content
      )}

      {/* Form Config Modal */}
      <FormConfig
        visible={showFormConfig}
        onClose={() => setShowFormConfig(false)}
        formTitle={selectedFormTitle}
        formType={selectedFormId}
      />
    </>
  );
}
