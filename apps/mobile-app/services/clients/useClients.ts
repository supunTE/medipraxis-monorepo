import type { IconName } from "@/config";
import { apiClient } from "@/lib/api-client";
import type { Client } from "@repo/models";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import parsePhoneNumber from "libphonenumber-js";
import { Alert } from "react-native";

// Client type for UI display
export interface ClientDisplay {
  id: string;
  name: string;
  initial: string;
  color: string;
  icon: IconName;
}

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
  const fullName = `${client.first_name} ${client.last_name || ""}`.trim();

  return {
    id: client.client_id,
    name: fullName,
    initial: client.first_name.charAt(0).toUpperCase(),
    color: getRandomColor(),
    icon: getRandomIcon(),
  };
};

// Group clients by first letter
export const groupClientsByLetter = (clients: ClientDisplay[]) => {
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

// Fetch all clients hook
export const useFetchClients = (userId: string) => {
  return useQuery({
    queryKey: ["clients", userId],
    queryFn: async () => {
      const response = await apiClient.api.clients.$get({
        query: {
          user_id: userId,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to load clients. Please try again.");
        return [];
      }

      const data = await response.json();
      const displayClients = data.clients.map(mapClientToDisplay);
      return displayClients;
    },
  });
};

// Create client input type
export interface CreateClientInput {
  title: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  contactNumber: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  emergencyContactRelationship?: string;
  knownConditions?: string[];
  note?: string;
}

// Create client hook
export const useCreateClient = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientData: CreateClientInput) => {
      // Parse contact number
      let countryCode: string | null = null;
      let contactNumber: string | null = null;

      if (clientData.contactNumber) {
        try {
          const phoneNumber = parsePhoneNumber(clientData.contactNumber);
          if (!phoneNumber) {
            Alert.alert("Error", "Invalid phone number format");
            return null;
          }
          countryCode = phoneNumber.countryCallingCode;
          contactNumber = phoneNumber.nationalNumber;
        } catch {
          Alert.alert("Error", "Invalid phone number format");
          return null;
        }
      }

      // Parse emergency contact number
      let emergencyCountryCode: string | null = null;
      let emergencyContactNumber: string | null = null;

      if (clientData.emergencyContactNumber) {
        try {
          const emergencyPhone = parsePhoneNumber(
            clientData.emergencyContactNumber
          );
          if (!emergencyPhone) {
            Alert.alert("Error", "Invalid emergency contact number format");
            return null;
          }
          emergencyCountryCode = emergencyPhone.countryCallingCode;
          emergencyContactNumber = emergencyPhone.nationalNumber;
        } catch {
          Alert.alert("Error", "Invalid emergency contact number format");
          return null;
        }
      }

      // Convert DD/MM/YYYY to YYYY-MM-DD
      const [day, month, year] = clientData.dateOfBirth.split("/");
      const formattedDate = `${year}-${month}-${day}`;

      const payload = {
        title: clientData.title,
        first_name: clientData.firstName,
        last_name: clientData.lastName,
        gender: clientData.gender,
        date_of_birth: formattedDate,
        country_code: countryCode,
        contact_number: contactNumber,
        emergency_contact_name: clientData.emergencyContactName ?? null,
        emergency_contact_country_code: emergencyCountryCode,
        emergency_contact_number: emergencyContactNumber,
        emergency_contact_relationship:
          clientData.emergencyContactRelationship ?? null,
        known_conditions: clientData.knownConditions ?? null,
        note: clientData.note ?? null,
        user_id: userId,
        contact_id: null,
      };

      const response = await apiClient.api.clients.$post({
        json: payload,
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to create client. Please try again.");
        return null;
      }

      const data = await response.json();
      return data.client;
    },
    onSuccess: async (client) => {
      if (client) {
        await queryClient.invalidateQueries({ queryKey: ["clients", userId] });
        Alert.alert("Success", "Client created successfully");
      }
    },
  });
};

// Get client by ID hook
export const useFetchClientById = (clientId: string) => {
  return useQuery({
    queryKey: ["client", clientId],
    queryFn: async () => {
      const response = await apiClient.api.clients[":id"].$get({
        param: {
          id: clientId,
        },
      });

      if (!response.ok) {
        Alert.alert(
          "Error",
          "Failed to load client details. Please try again."
        );
        return null;
      }

      const data = await response.json();
      return data.client;
    },
    enabled: !!clientId,
  });
};

// Check phone exists hook
export const useCheckPhoneExists = () => {
  return useMutation({
    mutationFn: async ({
      countryCode,
      contactNumber,
    }: {
      countryCode: string;
      contactNumber: string;
    }) => {
      const response = await apiClient.api.clients["check-phone"].$get({
        query: {
          country_code: countryCode,
          contact_number: contactNumber,
        },
      });

      if (!response.ok) {
        Alert.alert("Error", "Failed to check phone number. Please try again.");
        return { exists: false, clients: [] };
      }

      const data = await response.json();
      return data;
    },
  });
};
