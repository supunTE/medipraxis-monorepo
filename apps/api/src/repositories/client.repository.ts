import type {
  Client,
  ContactInfo,
  CreateClientInput,
  CreateContactInfoInput,
  UpdateClientInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CLIENT_QUERIES = {
  FIND_ALL: "*",
  FIND_BY_ID: "*",
} as const;

export class ClientRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  /* ------------Contact Info Methods------------ */

  async findContactInfo(
    countryCode: string,
    contactNumber: string
  ): Promise<ContactInfo | null> {
    const { data, error } = await this.db
      .from("contact_info")
      .select("*")
      .eq("country_code", countryCode)
      .eq("contact_number", contactNumber)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContactInfo;
  }

  async createContactInfo(
    contactInfo: CreateContactInfoInput
  ): Promise<ContactInfo> {
    const data = {
      country_code: contactInfo.country_code,
      contact_number: contactInfo.contact_number,
    };
    const { data: contact, error } = await this.db
      .from("contact")
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return contact as ContactInfo;
  }

  /* ------------Client Methods------------ */

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
      gender: clientData.gender,
      date_of_birth: clientData.date_of_birth,
      emergency_contact_name: clientData.emergency_contact_name || null,
      emergency_contact_country_code:
        clientData.emergency_contact_country_code || null,
      emergency_contact_number: clientData.emergency_contact_number || null,
      emergency_contact_relationship:
        clientData.emergency_contact_relationship || null,
      known_conditions: clientData.known_conditions || null,
      note: clientData.note || null,
      contact_id: clientData.contact_id,
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
    const { data, error } = await this.db
      .from("client")
      .update({
        ...clientData,
        modified_date: new Date().toISOString(),
      })
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
