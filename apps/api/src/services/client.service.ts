import { ClientRepository } from "../repositories";
import type {
  Client,
  CreateClientWithContactInput,
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

  async createClient(input: CreateClientWithContactInput): Promise<Client> {
    // Find or create contact_info
    let contact = await this.clientRepository.findContactInfo(
      input.country_code,
      input.contact_number
    );

    if (!contact) {
      contact = await this.clientRepository.createContactInfo({
        country_code: input.country_code,
        contact_number: input.contact_number,
      });
    }

    // Create client
    return this.clientRepository.create({
      ...input,
      contact_id: contact.contact_id,
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
