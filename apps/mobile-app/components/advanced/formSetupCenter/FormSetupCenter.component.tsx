import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from "@expo-google-fonts/dm-sans";
import { Lato_400Regular, Lato_700Bold } from "@expo-google-fonts/lato";
import { useFonts } from "expo-font";
import { Color, TextSize, TextVariant } from "@repo/config";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextComponent } from "@/components/basic";
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

  const handleTilePress = (tileId: string) => {
    console.log(`Tile pressed: ${tileId}`);
    // TODO: Navigate to specific form configuration page
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
              <TouchableOpacity
                key={tile.id}
                style={styles.tile}
                onPress={() => handleTilePress(tile.id)}
                activeOpacity={0.7}
              >
                <View style={styles.tileContent}>
                  <Text style={styles.tileTitle}>{tile.title}</Text>
                  <Text style={styles.tileDescription}>{tile.description}</Text>
                </View>
                <View style={styles.tileArrow}>
                  <Text style={styles.arrowIcon}>›</Text>
                </View>
              </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Color.LightCream,
    borderRadius: 12,
    padding: 20,
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
  tileContent: {
    flex: 1,
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
  },
  tileArrow: {
    marginLeft: 12,
  },
  arrowIcon: {
    fontFamily: "DMSans_400Regular",
    fontSize: 28,
    color: Color.Grey,
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
