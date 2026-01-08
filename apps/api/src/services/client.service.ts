import { ClientRepository } from "../repositories";
import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@repo/models";

export class ClientService {
  private clientRepository: ClientRepository;

  constructor(clientRepository: ClientRepository) {
    this.clientRepository = clientRepository;
  }

  async getAllClients(userId?: string): Promise<Client[]> {
    return await this.clientRepository.findAll(userId);
  }

  async getClientById(clientId: string): Promise<Client> {
    const client = await this.clientRepository.findById(clientId);

    if (!client) {
      throw new Error("Client not found");
    }

    return client;
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    // Validate date of birth is not in the future
    const dob = new Date(input.date_of_birth);
    const today = new Date();

    if (dob > today) {
      throw new Error("Date of birth cannot be in the future");
    }

    // Validate minimum age (optional - adjust as needed)
    const age = Math.floor(
      (today.getTime() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
    );

    if (age < 0) {
      throw new Error("Invalid date of birth");
    }

    // Optional: Check for maximum age (e.g., 150 years)
    if (age > 150) {
      throw new Error("Date of birth appears to be invalid");
    }

    // Validate phone number format (basic validation)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/;
    if (!phoneRegex.test(input.phone)) {
      throw new Error("Invalid phone number format");
    }

    // Check if client with same phone already exists for this user
    const existingClients = await this.clientRepository.findAll(input.user_id);
    const duplicatePhone = existingClients.find(
      (client) => client.phone === input.phone
    );

    if (duplicatePhone) {
      throw new Error(
        "A client with this phone number already exists for your account"
      );
    }

    // Validate emergency contact phone if provided
    if (
      input.emergency_contact_phone &&
      !phoneRegex.test(input.emergency_contact_phone)
    ) {
      throw new Error("Invalid emergency contact phone number format");
    }

    // Ensure emergency contact details are consistent
    if (input.emergency_contact_name && !input.emergency_contact_phone) {
      throw new Error(
        "Emergency contact phone is required when emergency contact name is provided"
      );
    }

    if (input.emergency_contact_phone && !input.emergency_contact_name) {
      throw new Error(
        "Emergency contact name is required when emergency contact phone is provided"
      );
    }

    return await this.clientRepository.create(input);
  }

  async updateClient(
    clientId: string,
    input: UpdateClientInput
  ): Promise<Client> {
    const updatedClient = await this.clientRepository.update(clientId, input);

    if (!updatedClient) {
      throw new Error("Client not found or could not be updated");
    }

    return updatedClient;
  }

  async deleteClient(clientId: string): Promise<boolean> {
    const success = await this.clientRepository.delete(clientId);

    if (!success) {
      throw new Error("Client not found or could not be deleted");
    }

    return success;
  }
}
