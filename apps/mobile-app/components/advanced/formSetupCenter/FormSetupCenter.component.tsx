import { TextComponent } from "@/components/basic";
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
  StyleSheet,
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

  const handleTilePress = (tileTitle: string) => {
    setSelectedFormTitle(tileTitle);
    setShowFormConfig(true);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <TextComponent
              variant={TextVariant.Title}
              size={TextSize.Large}
              color={Color.Black}
              style={styles.heading}
            >
              Form Setup Center
            </TextComponent>
            <TextComponent
              variant={TextVariant.Body}
              size={TextSize.Medium}
              color={Color.Grey}
              style={styles.subheading}
            >
              Forms that adapt to your needs
            </TextComponent>
          </View>

          {/* Tiles Section */}
          <View style={styles.tilesContainer}>
            {FORM_TILES.map((tile) => (
              <View key={tile.id} style={styles.tile}>
                <Image
                  source={tile.image}
                  style={styles.tileImage}
                  resizeMode="contain"
                />
                <View style={styles.tileContent}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileDescription}>{tile.description}</Text>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleTilePress(tile.title)}
                    activeOpacity={0.7}
                  >
                    <PencilSimpleIcon
                      size={20}
                      color={Color.White}
                      weight="regular"
                    />
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Close Button */}
          <View style={styles.actionSection}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Form Config Modal */}
      <FormConfig
        visible={showFormConfig}
        onClose={() => setShowFormConfig(false)}
        formTitle={selectedFormTitle}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Color.White,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heading: {
    marginBottom: 8,
  },
  subheading: {
    marginTop: 4,
  },
  tilesContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tile: {
    backgroundColor: Color.LightCream,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Color.Grey,
    shadowColor: Color.Black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tileImage: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  tileContent: {
    flex: 1,
    justifyContent: "flex-start",
  },
  tileTitle: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 18,
    color: Color.Black,
    marginBottom: 4,
  },
  tileDescription: {
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
    color: Color.Grey,
    lineHeight: 20,
    marginBottom: 12,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Color.Black,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 8,
  },
  editButtonText: {
    fontFamily: "DMSans_600SemiBold",
    fontSize: 14,
    color: Color.White,
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: Color.Grey,
    backgroundColor: Color.White,
  },
  closeButton: {
    backgroundColor: Color.Black,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  closeButtonText: {
    fontFamily: "DMSans_600SemiBold",
    color: Color.White,
    fontSize: 16,
  },
});
