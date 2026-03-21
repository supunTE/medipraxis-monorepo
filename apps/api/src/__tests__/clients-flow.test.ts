import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { ClientService } from "../services/client.service";
import type { ClientRepository } from "../repositories";
import type { Client, ContactInfo } from "@repo/models";

const mockClient: Client = {
  client_id: "client-1",
  title: "Mr",
  first_name: "John",
  last_name: "Doe",
  gender: "MALE",
  date_of_birth: "1990-01-01",
  emergency_contact_name: null,
  emergency_contact_country_code: null,
  emergency_contact_number: null,
  emergency_contact_relationship: null,
  known_conditions: null,
  note: null,
  created_date: "2024-01-01T00:00:00Z",
  modified_date: null,
  deleted_date: null,
  contact_id: "contact-1",
  user_id: "user-1",
  country_code: "94",
  contact_number: "771234567",
};

const mockContactInfo: ContactInfo = {
  contact_id: "contact-1",
  country_code: "94",
  contact_number: "771234567",
  created_date: "2024-01-01T00:00:00Z",
};

function makeMockRepo(
  overrides: Partial<ClientRepository> = {}
): jest.Mocked<ClientRepository> {
  return {
    findAll: jest.fn<ClientRepository["findAll"]>().mockResolvedValue([mockClient]),
    findById: jest.fn<ClientRepository["findById"]>().mockResolvedValue(mockClient),
    findByContactId: jest.fn<ClientRepository["findByContactId"]>().mockResolvedValue([mockClient]),
    findByPhone: jest.fn<ClientRepository["findByPhone"]>().mockResolvedValue([mockClient]),
    findByName: jest.fn<ClientRepository["findByName"]>().mockResolvedValue([mockClient]),
    create: jest.fn<ClientRepository["create"]>().mockResolvedValue(mockClient),
    update: jest.fn<ClientRepository["update"]>().mockResolvedValue(mockClient),
    delete: jest.fn<ClientRepository["delete"]>().mockResolvedValue(true),
    findContactInfo: jest.fn<ClientRepository["findContactInfo"]>().mockResolvedValue(mockContactInfo),
    createContactInfo: jest.fn<ClientRepository["createContactInfo"]>().mockResolvedValue(mockContactInfo),
    findContactInfoById: jest.fn<ClientRepository["findContactInfoById"]>().mockResolvedValue(mockContactInfo),
    ...overrides,
  } as jest.Mocked<ClientRepository>;
}

describe("ClientService", () => {
  let repo: jest.Mocked<ClientRepository>;
  let service: ClientService;

  beforeEach(() => {
    repo = makeMockRepo();
    service = new ClientService(repo);
  });

  it("getClientById throws when client does not exist", async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getClientById("nonexistent")).rejects.toThrow(
      "Client not found"
    );
  });

  it("createClient reuses existing contact info instead of creating a new one", async () => {
    await service.createClient({
      title: "Mr",
      user_id: "user-1",
      first_name: "John",
      last_name: "Doe",
      date_of_birth: "1990-01-01",
      gender: "MALE",
      country_code: "+94",
      contact_number: "771234567",
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.findContactInfo).toHaveBeenCalledWith("94", "771234567");
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.createContactInfo).not.toHaveBeenCalled();
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ contact_id: "contact-1" })
    );
  });

  it("createClient creates new contact info when none exists", async () => {
    repo.findContactInfo.mockResolvedValue(null);

    await service.createClient({
      title: "Ms",
      user_id: "user-1",
      first_name: "Jane",
      last_name: "Doe",
      date_of_birth: "1992-06-15",
      gender: "FEMALE",
      country_code: "+94",
      contact_number: "779999999",
    });

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.createContactInfo).toHaveBeenCalledWith({
      country_code: "94",
      contact_number: "779999999",
    });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).toHaveBeenCalled();
  });

  it("createClient throws when no contact information is provided", async () => {
    await expect(
      service.createClient({
        title: "Dr",
        user_id: "user-1",
        first_name: "Ghost",
        last_name: "User",
        date_of_birth: "1985-03-20",
        gender: "OTHER",
      })
    ).rejects.toThrow("Cannot create client: Missing contact information.");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.create).not.toHaveBeenCalled();
  });

  it("updateClient throws when client does not exist", async () => {
    repo.update.mockResolvedValue(null);
    await expect(
      service.updateClient("nonexistent", { first_name: "Updated" })
    ).rejects.toThrow("Client not found or could not be updated");
  });

  it("deleteClient throws when client does not exist", async () => {
    repo.delete.mockResolvedValue(false);
    await expect(service.deleteClient("nonexistent")).rejects.toThrow(
      "Client not found or could not be deleted"
    );
  });

  it("getClientByPhone strips leading + from country code before querying", async () => {
    await service.getClientByPhone("+94", "771234567");

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(repo.findByPhone).toHaveBeenCalledWith("94", "771234567");
  });
});
