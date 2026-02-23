import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { View } from "@/components/Themed";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle as RNTextStyle,
} from "react-native";
import {
  groupClientsByLetter,
  useCreateClient,
  useFetchClients,
  type CreateClientInput,
} from "../../../services/clients";
import { AddClient } from "./addClient";
import { ClientCardComponent } from "./ClientCard.component";

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NAV_BAR_HEIGHT = Platform.OS === "ios" ? 83 : 60;
const CIRCLE_SIZE = 18;

interface ClientsScreenProps {
  userId?: string; // Will use default if not provided
}

export default function ClientsScreen({
  userId = "2a3c19b8-d352-4b30-a2ac-1cdf993d310c", // Default hard coded user ID
}: ClientsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleSection, setVisibleSection] = useState<string>("A");
  const [isAddClientVisible, setIsAddClientVisible] = useState(false);
  const [alphabetContainerHeight, setAlphabetContainerHeight] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});
  const isProgrammaticScroll = useRef(false);

  // Fetch clients using React Query
  const { data: clients = [], isLoading } = useFetchClients(userId);

  // Create client mutation
  const createClientMutation = useCreateClient(userId);

  // Filter clients based on search
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedClients = groupClientsByLetter(filteredClients);

  const handleClientPress = (clientId: string) => {
    console.log("Client pressed:", clientId);
    // Navigate to client details
  };

  // Handle save client
  const handleSaveClient = async (
    clientData: CreateClientInput
  ): Promise<void> => {
    await createClientMutation.mutateAsync(clientData);
    setIsAddClientVisible(false);
  };

  // Handle alphabet letter press to scroll to section
  const handleLetterPress = (letter: string) => {
    const yOffset = sectionRefs.current[letter];
    if (yOffset !== undefined && scrollViewRef.current) {
      isProgrammaticScroll.current = true;
      setVisibleSection(letter);
      scrollViewRef.current.scrollTo({ y: yOffset, animated: true });
      setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, 400);
    }
  };

  // Handle scroll to detect visible section
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;

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

  const handleAlphabetContainerLayout = (event: LayoutChangeEvent) => {
    setAlphabetContainerHeight(event.nativeEvent.layout.height);
  };

  const letterSlotHeight =
    alphabetContainerHeight > 0
      ? Math.floor(alphabetContainerHeight / ALPHABET.length)
      : 0;

  // Loading state
  if (isLoading) {
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

  // Empty state - no clients loaded
  if (clients.length === 0) {
    return (
      <View className="flex-1 pt-5">
        {/* Header */}
        <View className="flex-row justify-between items-center px-5 mb-5">
          <TextComponent variant={TextVariant.Title} size={TextSize.Large}>
            Clients
          </TextComponent>
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
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: 20,
            paddingRight: 44,
            paddingBottom: 100,
          }}
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
          style={{
            position: "absolute",
            top: 0,
            bottom: NAV_BAR_HEIGHT,
            right: 12,
            width: 32,
          }}
          onLayout={handleAlphabetContainerLayout}
        >
          {letterSlotHeight > 0 &&
            ALPHABET.map((letter) => {
              const hasClients = !!groupedClients[letter];
              const isActive = letter === visibleSection && hasClients;

              return (
                <TouchableOpacity
                  key={letter}
                  onPress={() => hasClients && handleLetterPress(letter)}
                  disabled={!hasClients}
                  style={{
                    height: letterSlotHeight,
                    width: 32,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      position: "absolute",
                      width: CIRCLE_SIZE,
                      height: CIRCLE_SIZE,
                      borderRadius: CIRCLE_SIZE / 2,
                      backgroundColor: Color.Green,
                      opacity: isActive ? 1 : 0,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "600",
                      lineHeight: 13,
                      textAlign: "center",
                      width: CIRCLE_SIZE,
                      color: isActive
                        ? Color.White
                        : hasClients
                          ? Color.Grey
                          : Color.LightGrey,
                    }}
                  >
                    {letter}
                  </Text>
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
