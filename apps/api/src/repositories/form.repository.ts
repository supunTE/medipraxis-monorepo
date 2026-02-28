import type { CreateFormInput, Form } from "@repo/models";
import type { SupabaseClient } from "@supabase/supabase-js";

export class FormRepository {
  private db: SupabaseClient;

  constructor(db: SupabaseClient) {
    this.db = db;
  }

  async findByUserIdAndFormType(
    userId: string,
    formType: string
  ): Promise<Form[]> {
    const { data, error } = await this.db
      .from("form")
      .select("*")
      .eq("user_id", userId)
      .eq("form_type", formType)
      .order("version", { ascending: true });

    if (error || !data) return [];
    return data as Form[];
  }

  async findByUserId(userId: string): Promise<Form[]> {
    const { data, error } = await this.db
      .from("form")
      .select("*")
      .eq("user_id", userId)
      .order("version", { ascending: true });

    if (error || !data) return [];
    return data as Form[];
  }

  async findById(formId: string): Promise<Form | null> {
    const { data, error } = await this.db
      .from("form")
      .select("*")
      .eq("form_id", formId)
      .single();

    if (error || !data) return null;
    return data as Form;
  }

  async deactivateAllForUserAndFormType(
    userId: string,
    formType: string
  ): Promise<void> {
    const { error } = await this.db
      .from("form")
      .update({ is_active: false })
      .eq("user_id", userId)
      .eq("form_type", formType)
      .eq("is_active", true);

    if (error) {
      throw new Error(`Failed to deactivate forms: ${error.message}`);
    }
  }

  async getMaxVersionForUserAndFormType(
    userId: string,
    formType: string
  ): Promise<number> {
    const { data, error } = await this.db
      .from("form")
      .select("version")
      .eq("user_id", userId)
      .eq("form_type", formType)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return 0;
    return data.version;
  }

  async create(input: CreateFormInput, version: number): Promise<Form> {
    const { data, error } = await this.db
      .from("form")
      .insert({
        title: input.title,
        description: input.description || null,
        is_active: true,
        form_configuration: input.form_configuration,
        user_id: input.user_id,
        form_type: input.form_type,
        version,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create form");
    }

    return data as Form;
  }

  async findActiveByUserIdAndFormType(
    userId: string,
    formType: string
  ): Promise<Form | null> {
    const { data, error } = await this.db
      .from("form")
      .select("*")
      .eq("user_id", userId)
      .eq("form_type", formType)
      .eq("is_active", true)
      .single();

    if (error || !data) return null;
    return data as Form;
  }
}
