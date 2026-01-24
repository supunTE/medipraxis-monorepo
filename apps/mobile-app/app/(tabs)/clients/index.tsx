import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { View } from "@/components/Themed";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons, type IconName } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import type { Client } from "@repo/models";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle as RNTextStyle,
} from "react-native";
import * as ClientHandler from "../../../services/clients/client.handler";
import { AddClient } from "./addClient";
import { ClientCardComponent } from "./ClientCard.component";

// Client type for UI
interface ClientDisplay {
  id: string;
  name: string;
  initial: string;
  color: string;
  icon: IconName;
}

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

// Group clients by first letter
const groupClientsByLetter = (clients: ClientDisplay[]) => {
  const grouped: Record<string, ClientDisplay[]> = {};
  clients.forEach((client) => {
    const firstChar = client.name.charAt(0);
    if (firstChar) {
      const letter = firstChar.toUpperCase();
      if (!grouped[letter]) {
        grouped[letter] = [];
      }
      grouped[letter].push(client);
    }
  });
  return grouped;
};

// Helper function to get random color
const getRandomColor = (): string => {
  const colors = [
    "#F4D03F",
    "#85C1E9",
    "#BB8FCE",
    "#F8B739",
    "#82E0AA",
    "#F1948A",
    "#AED6F1",
    "#D7BDE2",
    "#F9E79F",
  ];
  const randomIndex = Math.floor(Math.random() * colors.length);
  return colors[randomIndex]!;
};

// Helper function to get random icon
const getRandomIcon = (): IconName => {
  const icons: IconName[] = ["Heart", "Star", "Check", "Plus"];
  return icons[Math.floor(Math.random() * icons.length)] || "Heart";
};

// Map API Client to ClientDisplay
const mapClientToDisplay = (client: Client): ClientDisplay => {
  // Construct full name from first_name and last_name if full_name is not available
  const fullName =
    client.full_name || `${client.first_name} ${client.last_name || ""}`.trim();

  return {
    id: client.client_id,
    name: fullName,
    initial: client.first_name.charAt(0).toUpperCase(),
    color: getRandomColor(),
    icon: getRandomIcon(),
  };
};

interface ClientsScreenProps {
  userId?: string; // Will use default if not provided
}

export default function ClientsScreen({
  userId = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c", // Default hard coded user ID
}: ClientsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<ClientDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleSection, setVisibleSection] = useState<string>("A");
  const [isAddClientVisible, setIsAddClientVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});

  // Fetch clients from API
  const fetchClients = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching clients for userId:", userId);
      const apiClients = await ClientHandler.fetchAllClients(userId);
      console.log("Received clients:", apiClients);
      console.log("Number of clients:", apiClients.length);

      const displayClients = apiClients.map(mapClientToDisplay);
      console.log("Display clients:", displayClients);

      setClients(displayClients);
    } catch (err) {
      console.error("Error fetching clients:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Fetch clients on mount
  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  // Filter clients based on search
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedClients = groupClientsByLetter(filteredClients);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const handleClientPress = (clientId: string) => {
    console.log("Client pressed:", clientId);
    // Navigate to client details
  };

  // Handle save client
  const handleSaveClient = async (clientData: unknown): Promise<void> => {
    console.log("Saving client:", clientData);

    // Type guard to ensure clientData has required properties
    if (
      clientData &&
      typeof clientData === "object" &&
      "firstName" in clientData &&
      "lastName" in clientData
    ) {
      const data = clientData as {
        firstName: string;
        lastName?: string | null;
        title?: string;
        gender?: "MALE" | "FEMALE" | "OTHER";
        dateOfBirth?: string;
        countryCode?: string;
        contactNumber?: string;
        emergencyContactName?: string;
        emergencyContactCountryCode?: string;
        emergencyContactNumber?: string;
        emergencyContactRelationship?: string;
        knownConditions?: string[];
        note?: string;
      };

      try {
        // Create client via API
        const newClient = await ClientHandler.createNewClient(data, userId);

        // Add new client to the list
        const displayClient = mapClientToDisplay(newClient);
        setClients([...clients, displayClient]);

        // Close modal
        setIsAddClientVisible(false);
      } catch (err) {
        console.error("Error creating client:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create client"
        );
      }
    }
  };

  // Handle alphabet letter press to scroll to section
  const handleLetterPress = (letter: string) => {
    const yOffset = sectionRefs.current[letter];
    if (yOffset !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
      setVisibleSection(letter);
    }
  };

  // Handle scroll to detect visible section
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const sortedLetters = Object.keys(groupedClients).sort();

    // Find which section is currently visible
    for (let i = sortedLetters.length - 1; i >= 0; i--) {
      const letter = sortedLetters[i];
      if (letter && sectionRefs.current[letter] !== undefined) {
        if (scrollY >= sectionRefs.current[letter] - 50) {
          setVisibleSection(letter);
          break;
        }
      }
    }
  };

  // Handle layout change for sections
  const handleSectionLayout = (letter: string, event: LayoutChangeEvent) => {
    const { y } = event.nativeEvent.layout;
    sectionRefs.current[letter] = y;
  };

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={Color.Green} />
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Medium}
          style={{ marginTop: 16, color: Color.Grey }}
        >
          Loading clients...
        </TextComponent>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <Icons.Info size={48} color={Color.Danger} />
        <TextComponent
          variant={TextVariant.Title}
          size={TextSize.Medium}
          style={{ marginTop: 16, color: Color.Danger }}
        >
          Error Loading Clients
        </TextComponent>
        <TextComponent
          variant={TextVariant.Body}
          size={TextSize.Medium}
          style={{ marginTop: 8, color: Color.Grey, textAlign: "center" }}
        >
          {error}
        </TextComponent>
        <ButtonComponent
          size={ButtonSize.Medium}
          buttonColor={Color.Green}
          textColor={Color.White}
          onPress={() => void fetchClients()}
          style={{ marginTop: 24 }}
        >
          Retry
        </ButtonComponent>
      </View>
    );
  }

  // Empty state - no clients loaded
  if (clients.length === 0) {
    return (
      <View className="flex-1 pt-5">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 mb-5">
          <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
            Clients
          </TextComponent>
          <View className="items-center">
            <ButtonComponent
              size={ButtonSize.Small}
              leftIcon={Icons.Plus}
              buttonColor={Color.Black}
              textColor={Color.White}
              iconColor={Color.White}
              onPress={() => setIsAddClientVisible(true)}
            >
              Add Client
            </ButtonComponent>
          </View>
        </View>

        {/* Search Bar */}
        <View className="px-5 mb-5">
          <Input
            variant="outline"
            size="md"
            style={{
              borderColor: Color.LightGrey,
              borderWidth: 1.5,
              borderRadius: 12,
              width: "100%",
              height: 56,
              backgroundColor: Color.White,
            }}
          >
            <InputField
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor={Color.Grey}
              style={{
                paddingLeft: 16,
                paddingRight: 48,
                paddingVertical: 12,
                fontFamily:
                  textLargeStyle.fontFamily === Font.DMsans
                    ? "DMSans_400Regular"
                    : "Lato_400Regular",
                fontSize: textLargeStyle.fontSize,
                fontWeight: "400" as RNTextStyle["fontWeight"],
                textAlign: "left",
                color: Color.Black,
              }}
            />
            <InputSlot className="pr-4">
              <Icons.Search size={20} color={Color.Grey} weight="regular" />
            </InputSlot>
          </Input>
        </View>

        {/* Empty state message */}
        <View className="flex-1 justify-center items-center px-5">
          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Large}
            style={{ marginTop: 16, color: Color.Grey }}
          >
            📋
          </TextComponent>
          <TextComponent
            variant={TextVariant.Title}
            size={TextSize.Medium}
            style={{ marginTop: 16, color: Color.Grey }}
          >
            No Clients Found
          </TextComponent>
          <TextComponent
            variant={TextVariant.Body}
            size={TextSize.Medium}
            style={{ marginTop: 8, color: Color.Grey, textAlign: "center" }}
          >
            Tap &ldquo;Add Client&rdquo; to create your first client
          </TextComponent>
        </View>

        {/* Add Client Modal */}
        <AddClient
          visible={isAddClientVisible}
          onClose={() => setIsAddClientVisible(false)}
          onSave={(data) => void handleSaveClient(data)}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 pt-5">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 mb-5">
        <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
          Clients
        </TextComponent>
        <View className="items-center">
          <ButtonComponent
            size={ButtonSize.Small}
            leftIcon={Icons.Plus}
            buttonColor={Color.Black}
            textColor={Color.White}
            iconColor={Color.White}
            onPress={() => setIsAddClientVisible(true)}
          >
            Add Client
          </ButtonComponent>
        </View>
      </View>

      {/* Search Bar */}
      <View className="px-5 mb-5">
        <Input
          variant="outline"
          size="md"
          style={{
            borderColor: Color.LightGrey,
            borderWidth: 1.5,
            borderRadius: 12,
            width: "100%",
            height: 56,
            backgroundColor: Color.White,
          }}
        >
          <InputField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search"
            placeholderTextColor={Color.Grey}
            style={{
              paddingLeft: 16,
              paddingRight: 48,
              paddingVertical: 12,
              fontFamily:
                textLargeStyle.fontFamily === Font.DMsans
                  ? "DMSans_400Regular"
                  : "Lato_400Regular",
              fontSize: textLargeStyle.fontSize,
              fontWeight: "400" as RNTextStyle["fontWeight"],
              textAlign: "left",
              color: Color.Black,
            }}
          />
          <InputSlot className="pr-4">
            <Icons.Search size={20} color={Color.Grey} weight="regular" />
          </InputSlot>
        </Input>
      </View>

      {/* Client List with Alphabet Index */}
      <View className="flex-1 flex-row">
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          style={{ paddingRight: 40 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {Object.keys(groupedClients)
            .sort()
            .map((letter) => {
              const clientGroup = groupedClients[letter];
              if (!clientGroup) return null;

              return (
                <View
                  key={letter}
                  className="mb-6"
                  onLayout={(event) => handleSectionLayout(letter, event)}
                >
                  <TextComponent
                    variant={TextVariant.Title}
                    size={TextSize.Medium}
                  >
                    {letter}
                  </TextComponent>
                  {clientGroup.map((client) => (
                    <ClientCardComponent
                      key={client.id}
                      id={client.id}
                      name={client.name}
                      color={client.color}
                      icon={client.icon}
                      onPress={() => handleClientPress(client.id)}
                    />
                  ))}
                </View>
              );
            })}
        </ScrollView>

        {/* Alphabet Index */}
        <View
          className="absolute right-0"
          style={{
            top: 0,
            bottom: 0,
            paddingHorizontal: 8,
            justifyContent: "space-evenly",
          }}
        >
          {alphabet.map((letter) => {
            const hasClients = groupedClients[letter];
            const isVisible = letter === visibleSection;
            return (
              <TouchableOpacity
                key={letter}
                className="items-center justify-center"
                onPress={() => hasClients && handleLetterPress(letter)}
                disabled={!hasClients}
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor:
                    isVisible && hasClients ? Color.Green : "transparent",
                }}
              >
                <TextComponent
                  variant={TextVariant.Body}
                  size={TextSize.Small}
                  style={{
                    color:
                      isVisible && hasClients
                        ? Color.White
                        : hasClients
                          ? Color.Grey
                          : Color.LightGrey,
                    fontWeight: isVisible && hasClients ? "600" : "400",
                    fontSize: 11,
                  }}
                >
                  {letter}
                </TextComponent>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Add Client Modal */}
      <AddClient
        visible={isAddClientVisible}
        onClose={() => setIsAddClientVisible(false)}
        onSave={(data) => void handleSaveClient(data)}
      />
    </View>
  );
}
