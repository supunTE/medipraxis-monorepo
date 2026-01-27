import type {
  Client,
  ContactInfo,
  CreateClientInput,
  CreateContactInfoInput,
  UpdateClientInput,
} from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export const CLIENT_QUERIES = {
  CLIENT_TABLE: "client",
  CONTACT_TABLE: "contact",
  CLIENT_ID: "client_id",
  CONTACT_ID: "contact_id",
  USER_ID: "user_id",
  COUNTRY_CODE: "country_code",
  CONTACT_NUMBER: "contact_number",
  DELETED_DATE: "deleted_date",
  CREATED_DATE: "created_date",
  MODIFIED_DATE: "modified_date",
  DELETED: "deleted",
  FIND_ALL: "*",
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
    // Remove leading plus sign from country code
    const cleanCountryCode = countryCode.replace(/^\+/, "");

    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CONTACT_TABLE)
      .select("*")
      .eq(CLIENT_QUERIES.COUNTRY_CODE, cleanCountryCode)
      .eq(CLIENT_QUERIES.CONTACT_NUMBER, contactNumber)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContactInfo;
  }

  async createContactInfo(
    contactInfo: CreateContactInfoInput
  ): Promise<ContactInfo> {
    // Remove leading plus sign from country code
    const data = {
      country_code: contactInfo.country_code.replace(/^\+/, ""),
      contact_number: contactInfo.contact_number,
    };
    const { data: contact, error } = await this.db
      .from(CLIENT_QUERIES.CONTACT_TABLE)
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return contact as ContactInfo;
  }

  async findContactInfoById(contactId: string): Promise<ContactInfo | null> {
    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CONTACT_TABLE)
      .select("*")
      .eq(CLIENT_QUERIES.CONTACT_ID, contactId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContactInfo;
  }

  /* ------------Client Methods------------ */

  async findAll(userId?: string): Promise<Client[]> {
    let query = this.db
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .select(CLIENT_QUERIES.FIND_ALL)
      .is(CLIENT_QUERIES.DELETED_DATE, null)
      .order(CLIENT_QUERIES.CREATED_DATE, { ascending: false });

    if (userId) {
      query = query.eq(CLIENT_QUERIES.USER_ID, userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return [];
    }

    return data as Client[];
  }

  async findById(clientId?: string): Promise<Client | null> {
    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .select(CLIENT_QUERIES.FIND_ALL)
      .eq(CLIENT_QUERIES.CLIENT_ID, clientId)
      .is(CLIENT_QUERIES.DELETED_DATE, null)
      .single();

    if (error || !data) {
      return null;
    }

    return data as Client;
  }

  async findByContactId(contactId: string): Promise<Client[]> {
    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .select(CLIENT_QUERIES.FIND_ALL)
      .eq(CLIENT_QUERIES.CONTACT_ID, contactId)
      .is(CLIENT_QUERIES.DELETED_DATE, null);

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return (data as Client[]) || [];
  }

  async findByPhone(
    countryCode: string,
    contactNumber: string
  ): Promise<Client[]> {
    // First find the contact_id
    const contact = await this.findContactInfo(countryCode, contactNumber);

    if (!contact) {
      return [];
    }

    // Then find all clients with that contact_id
    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .select(CLIENT_QUERIES.FIND_ALL)
      .eq(CLIENT_QUERIES.CONTACT_ID, contact.contact_id)
      .eq(CLIENT_QUERIES.DELETED, false);

    if (error || !data) {
      return [];
    }

    return data as Client[];
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
      .from(CLIENT_QUERIES.CLIENT_TABLE)
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
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .update({
        ...clientData,
        modified_date: new Date().toISOString(),
      })
      .eq(CLIENT_QUERIES.CLIENT_ID, clientId)
      .is(CLIENT_QUERIES.DELETED_DATE, null)
      .select()
      .single();

    if (error || !data) {
      return null;
    }

    return data as Client;
  }

  async delete(clientId: string): Promise<boolean> {
    const { data, error } = await this.db
      .from(CLIENT_QUERIES.CLIENT_TABLE)
      .update({
        deleted_date: new Date().toISOString(),
        modified_date: new Date().toISOString(),
      })
      .eq(CLIENT_QUERIES.CLIENT_ID, clientId)
      .is(CLIENT_QUERIES.DELETED_DATE, null)
      .select();

    if (error) {
      return false;
    }

    return data.length > 0;
  }
}
