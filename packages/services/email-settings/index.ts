import { db, eq, and } from "@repo/database";
import { emailNotificationSettingsTable } from "@repo/database/models/email-notification-settings";
import { updateEmailSettingsSchema } from "@repo/database/schemas/email-settings";
import { formsTable } from "@repo/database/models/form";
import { TRPCError } from "@trpc/server";

export class EmailSettingsService {
  async getSettings(userId: string, formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!form) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Form with ID ${formId} not found or access denied` });
    }

    const [settings] = await db
      .select()
      .from(emailNotificationSettingsTable)
      .where(eq(emailNotificationSettingsTable.formId, formId))
      .limit(1);

    if (!settings) {
      return {
        formId,
        creatorNotifyOnSubmission: false,
        creatorNotifyEmail: null,
        creatorEmailSubject: null,
        creatorEmailTemplate: null,
        respondentConfirmationEnabled: false,
        respondentEmailFieldId: null,
        respondentEmailSubject: null,
        respondentEmailTemplate: null,
        weeklyDigestEnabled: false,
      };
    }
    return settings;
  }

  async updateSettings(userId: string, formId: string, data: unknown) {
    const validData = updateEmailSettingsSchema.parse(data);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.createdBy, userId)));

    if (!form) {
      throw new TRPCError({ code: "NOT_FOUND", message: `Form with ID ${formId} not found or access denied` });
    }

    const [existing] = await db
      .select()
      .from(emailNotificationSettingsTable)
      .where(eq(emailNotificationSettingsTable.formId, formId))
      .limit(1);

    if (existing) {
      const { formId: _, ...updateData } = validData;
      const [updated] = await db
        .update(emailNotificationSettingsTable)
        .set(updateData)
        .where(eq(emailNotificationSettingsTable.formId, formId))
        .returning();
      return updated;
    } else {
      const { formId: __, ...insertData } = validData;
      const [inserted] = await db
        .insert(emailNotificationSettingsTable)
        .values({ ...insertData, formId })
        .returning();
      return inserted;
    }
  }
}