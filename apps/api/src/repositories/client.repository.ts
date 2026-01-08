import type {
  Client,
  CreateClientInput,
  UpdateClientInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CLIENT_QUERIES = {
  FIND_ALL: `
    *
  `,
  FIND_BY_ID: `
    *
  `,
} as const;

export class ClientRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findAll(userId?: string): Promise<Client[]> {
    let query = this.db
      .from("client")
      .select(CLIENT_QUERIES.FIND_ALL)
      .is("deleted_date", null)
      .order("created_date", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as Client[];
  }

  async findById(clientId?: string): Promise<Client | null> {
    const { data, error } = await this.db
      .from("client")
      .select(CLIENT_QUERIES.FIND_BY_ID)
      .eq("client_id", clientId)
      .is("deleted_date", null)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Client;
  }

  async create(clientData: CreateClientInput): Promise<Client> {
    const data = {
      title: clientData.title,
      first_name: clientData.first_name,
      last_name: clientData.last_name,
      full_name: `${clientData.first_name} ${clientData.last_name}`,
      gender: clientData.gender,
      date_of_birth: clientData.date_of_birth,
      phone: clientData.phone,
      emergency_contact_name: clientData.emergency_contact_name || null,
      emergency_contact_phone: clientData.emergency_contact_phone || null,
      emergency_contact_relationship:
        clientData.emergency_contact_relationship || null,
      known_conditions: clientData.known_conditions || null,
      note: clientData.note || null,
      user_id: clientData.user_id,
      modified_date: new Date().toISOString(),
    };

    const { data: client, error } = await this.db
      .from("client")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return client as Client;
  }

  async update(
    clientId: string,
    clientData: UpdateClientInput
  ): Promise<Client | null> {
    const updateData: any = {
      modified_date: new Date().toISOString(),
    };

    if (clientData.title !== undefined) updateData.title = clientData.title;
    if (clientData.first_name !== undefined)
      updateData.first_name = clientData.first_name;
    if (clientData.last_name !== undefined)
      updateData.last_name = clientData.last_name;

    // Update full_name if first_name or last_name changed
    if (
      clientData.first_name !== undefined ||
      clientData.last_name !== undefined
    ) {
      // Fetch current client to get missing name part
      const current = await this.findById(clientId);
      if (current) {
        const first_name = clientData.first_name ?? current.first_name;
        const last_name = clientData.last_name ?? current.last_name;
        updateData.full_name = `${first_name} ${last_name}`;
      }
    }

    if (clientData.gender !== undefined) updateData.gender = clientData.gender;
    if (clientData.date_of_birth !== undefined)
      updateData.date_of_birth = clientData.date_of_birth;
    if (clientData.phone !== undefined) updateData.phone = clientData.phone;
    if (clientData.emergency_contact_name !== undefined)
      updateData.emergency_contact_name = clientData.emergency_contact_name;
    if (clientData.emergency_contact_phone !== undefined)
      updateData.emergency_contact_phone = clientData.emergency_contact_phone;
    if (clientData.emergency_contact_relationship !== undefined)
      updateData.emergency_contact_relationship =
        clientData.emergency_contact_relationship;
    if (clientData.known_conditions !== undefined)
      updateData.known_conditions = clientData.known_conditions;
    if (clientData.note !== undefined) updateData.note = clientData.note;
    if (clientData.user_id !== undefined)
      updateData.user_id = clientData.user_id;

    const { data, error } = await this.db
      .from("client")
      .update(updateData)
      .eq("client_id", clientId)
      .is("deleted_date", null)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return data as Client;
  }

  async delete(clientId: string): Promise<boolean> {
    const { data, error } = await this.db
      .from("client")
      .update({
        deleted_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      })
      .eq("client_id", clientId)
      .is("deleted_date", null)
      .select();

    if (error) {
      return false;
    }

    return data.length > 0;
  }
}
