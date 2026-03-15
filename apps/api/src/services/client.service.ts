import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@repo/models";
import type { ClientRepository } from "../repositories";

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

  async getClientByContactId(contactId: string): Promise<Client[]> {
    const clients = await this.clientRepository.findByContactId(contactId);

    if (!clients) {
      throw new Error("Client not found");
    }

    return clients;
  }

  async getClientByPhone(
    countryCode: string,
    contactNumber: string
  ): Promise<Client[]> {
    // Remove leading plus sign from country code
    const cleanCountryCode = countryCode?.replace(/^\\+/, "") ?? "";
    const clients = await this.clientRepository.findByPhone(
      cleanCountryCode,
      contactNumber
    );
    return clients;
  }

  async createClient(input: CreateClientInput): Promise<Client> {
    // Find or create contact_info
    let contactId = input.contact_id;

    if (input.country_code && input.contact_number) {
      // Remove leading plus sign from country code
      const cleanCountryCode = input.country_code.replace(/^\\+/, "");

      let contact = await this.clientRepository.findContactInfo(
        cleanCountryCode,
        input.contact_number
      );

      if (!contact) {
        contact = await this.clientRepository.createContactInfo({
          country_code: cleanCountryCode,
          contact_number: input.contact_number,
        });
      }
      contactId = contact.contact_id;
    }

    // Create client
    if (!contactId) {
      throw new Error("Cannot create client: Missing contact information.");
    }

    return this.clientRepository.create({
      ...input,
      contact_id: contactId,
    });
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
    const deleted = await this.clientRepository.delete(clientId);

    if (!deleted) {
      throw new Error("Client not found or could not be deleted");
    }

    return deleted;
  }
}
