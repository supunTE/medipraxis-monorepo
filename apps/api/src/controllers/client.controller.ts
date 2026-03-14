import type {
  CreateClientInput,
  GetAllClientsQuery,
  GetClientByPhoneQuery,
  GetClientParam,
  UpdateClientInput,
  UpdateClientParam,
} from "@repo/models";
import { getClientService } from "../lib";
import type { APIContext } from "../types";

export class ClientController {
  static async getAllClients(c: APIContext<{ query: GetAllClientsQuery }>) {
    try {
      const clientService = getClientService(c);
      const userId = c.req.query("user_id");

      const clients = await clientService.getAllClients(userId);

      return c.json({ clients, count: clients.length });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get clients";
      return c.json({ error: message }, 500);
    }
  }

  static async getClientById(c: APIContext<{ param: GetClientParam }, "/:id">) {
    try {
      const clientService = getClientService(c);
      const clientId = c.req.param("id");

      const client = await clientService.getClientById(clientId);

      return c.json({ client });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get client";
      const status =
        error instanceof Error && error.message === "Client not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
  static async getClientByContactId(
    c: APIContext<{ param: GetClientParam }, "/:id">
  ) {
    try {
      const clientService = getClientService(c);
      const contactId = c.req.param("id");

      const clients = await clientService.getClientByContactId(contactId);

      return c.json({ clients });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to get clients";
      const status =
        error instanceof Error && error.message === "Clients not found"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }

  static async getClientByPhone(
    c: APIContext<{ query: GetClientByPhoneQuery }>
  ) {
    try {
      const clientService = getClientService(c);
      const countryCode = c.req.query("country_code");
      const contactNumber = c.req.query("contact_number");

      const clients = await clientService.getClientByPhone(
        countryCode!,
        contactNumber!
      );

      if (clients.length === 0) {
        return c.json({ exists: false, clients: [] });
      }

      return c.json({ exists: true, clients });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to check client existence";
      return c.json({ error: message }, 500);
    }
  }

  static async createClient(c: APIContext<{ json: CreateClientInput }>) {
    try {
      const clientService = getClientService(c);
      const body = c.req.valid("json") as CreateClientInput;

      const client = await clientService.createClient(body);

      return c.json({ success: true, client }, 201);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create client";
      return c.json({ error: message }, 400);
    }
  }

  static async updateClient(
    c: APIContext<{ json: UpdateClientInput; param: UpdateClientParam }, "/:id">
  ) {
    try {
      const clientService = getClientService(c);
      const clientId = c.req.param("id");
      const body = c.req.valid("json") as UpdateClientInput;

      const client = await clientService.updateClient(clientId, body);

      return c.json({ success: true, client });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update client";
      const status =
        error instanceof Error &&
        error.message === "Client not found or could not be updated"
          ? 404
          : 400;
      return c.json({ error: message }, status);
    }
  }

  static async deleteClient(c: APIContext<{ param: GetClientParam }, "/:id">) {
    try {
      const clientService = getClientService(c);
      const clientId = c.req.param("id");

      await clientService.deleteClient(clientId);

      return c.json({ success: true, message: "Client deleted successfully" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete client";
      const status =
        error instanceof Error &&
        error.message === "Client not found or could not be deleted"
          ? 404
          : 500;
      return c.json({ error: message }, status);
    }
  }
}
