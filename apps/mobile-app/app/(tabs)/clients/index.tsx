import { ButtonComponent, ButtonSize, TextComponent } from "@/components/basic";
import { View } from "@/components/Themed";
import { Input, InputField, InputSlot } from "@/components/ui/input";
import { Icons, type IconName } from "@/config";
import { Color, Font, TextSize, TextVariant, textStyles } from "@repo/config";
import React, { useRef, useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type TextStyle as RNTextStyle,
} from "react-native";
import { AddClient } from "./addClient";
import { ClientCardComponent } from "./ClientCard.component";

// Client type
interface Client {
  id: string;
  name: string;
  initial: string;
  color: string;
  icon: IconName;
}

// Sample client data
const clientsData: Client[] = [
  // A
  {
    id: "1",
    name: "Aaron Baker",
    initial: "A",
    color: "#F4D03F",
    icon: "Heart",
  },
  {
    id: "2",
    name: "Abigail Chung",
    initial: "A",
    color: "#F4D03F",
    icon: "Star",
  },
  {
    id: "3",
    name: "Adam Davis",
    initial: "A",
    color: "#F4D03F",
    icon: "Check",
  },
  {
    id: "4",
    name: "Alice Garcia",
    initial: "A",
    color: "#F4D03F",
    icon: "Plus",
  },
  // B
  {
    id: "5",
    name: "Ben Carter",
    initial: "B",
    color: "#85C1E9",
    icon: "Heart",
  },
  {
    id: "6",
    name: "Benjamin Chen",
    initial: "B",
    color: "#BB8FCE",
    icon: "Star",
  },
  {
    id: "7",
    name: "Bethany Evans",
    initial: "B",
    color: "#85C1E9",
    icon: "Check",
  },
  {
    id: "8",
    name: "Blake Gonzales",
    initial: "B",
    color: "#BB8FCE",
    icon: "Plus",
  },
  {
    id: "9",
    name: "Brenda Kaur",
    initial: "B",
    color: "#BB8FCE",
    icon: "Heart",
  },
  // C
  {
    id: "10",
    name: "Carlos Martinez",
    initial: "C",
    color: "#F8B739",
    icon: "Heart",
  },
  {
    id: "11",
    name: "Catherine Lee",
    initial: "C",
    color: "#F8B739",
    icon: "Star",
  },
  // D
  {
    id: "12",
    name: "Daniel Wilson",
    initial: "D",
    color: "#82E0AA",
    icon: "Check",
  },
  {
    id: "13",
    name: "Diana Ross",
    initial: "D",
    color: "#82E0AA",
    icon: "Plus",
  },
  // E
  {
    id: "14",
    name: "Emma Thompson",
    initial: "E",
    color: "#F1948A",
    icon: "Heart",
  },
  {
    id: "15",
    name: "Eric Johnson",
    initial: "E",
    color: "#F1948A",
    icon: "Star",
  },
  // M
  {
    id: "16",
    name: "Michael Brown",
    initial: "M",
    color: "#AED6F1",
    icon: "Check",
  },
  {
    id: "17",
    name: "Maria Garcia",
    initial: "M",
    color: "#AED6F1",
    icon: "Plus",
  },
  // S
  {
    id: "18",
    name: "Sarah Miller",
    initial: "S",
    color: "#D7BDE2",
    icon: "Heart",
  },
  {
    id: "19",
    name: "Steven Clark",
    initial: "S",
    color: "#D7BDE2",
    icon: "Star",
  },
  // Z
  {
    id: "20",
    name: "Zachary Turner",
    initial: "Z",
    color: "#F9E79F",
    icon: "Check",
  },
  {
    id: "21",
    name: "Zoe Anderson",
    initial: "Z",
    color: "#F9E79F",
    icon: "Plus",
  },
];

// Text styles
const textLargeStyle = textStyles[TextVariant.Body][TextSize.Large];

// Group clients by first letter
const groupClientsByLetter = (clients: Client[]) => {
  const grouped: Record<string, Client[]> = {};
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

export default function ClientsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState(clientsData);
  const [visibleSection, setVisibleSection] = useState<string>("A");
  const [isAddClientVisible, setIsAddClientVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const sectionRefs = useRef<Record<string, number>>({});

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
  const handleSaveClient = (clientData: unknown) => {
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
      };

      // Generate new client
      const newClient: Client = {
        id: String(clients.length + 1),
        name: `${data.firstName} ${data.lastName || ""}`.trim(),
        initial: data.firstName.charAt(0).toUpperCase(),
        color: getRandomColor(),
        icon: getRandomIcon(),
      };

      // Add new client to the list
      setClients([...clients, newClient]);
    }
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
        onSave={handleSaveClient}
      />
    </View>
  );
}
