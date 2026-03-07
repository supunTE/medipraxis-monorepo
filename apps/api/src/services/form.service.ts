import type { CreateFormInput, Form } from "@repo/models";
import type { FormRepository } from "../repositories";

export class FormService {
  private formRepository: FormRepository;

  constructor(formRepository: FormRepository) {
    this.formRepository = formRepository;
  }

  async getFormsByUserId(userId: string, formType?: string): Promise<Form[]> {
    if (formType) {
      return await this.formRepository.findByUserIdAndFormType(
        userId,
        formType
      );
    }
    return await this.formRepository.findByUserId(userId);
  }

  async getFormById(formId: string): Promise<Form> {
    const form = await this.formRepository.findById(formId);
    if (!form) throw new Error("Form not found");
    return form;
  }

  async saveForm(input: CreateFormInput): Promise<Form> {
    // Get max version for this user + form_type combination
    const maxVersion =
      await this.formRepository.getMaxVersionForUserAndFormType(
        input.user_id,
        input.form_type
      );

    // If a version already exists, deactivate all previous active versions
    if (maxVersion > 0) {
      await this.formRepository.deactivateAllForUserAndFormType(
        input.user_id,
        input.form_type
      );
    }

    // New version = maxVersion + 1 (starts at 1 for first entry)
    const newVersion = maxVersion + 1;

    return await this.formRepository.create(input, newVersion);
  }

  async getActiveForm(userId: string, formType: string): Promise<Form> {
    const form = await this.formRepository.findActiveByUserIdAndFormType(
      userId,
      formType
    );

    if (!form) throw new Error("No active form found");
    return form;
  }
}
