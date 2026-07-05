import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formsTable } from "./form";
import { formFieldsTable } from "./form-field";

export const emailNotificationSettingsTable = pgTable(
  "email_notification_settings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id")
      .notNull()
      .unique()
      .references(() => formsTable.id, { onDelete: "cascade" }),

    creatorNotifyOnSubmission: boolean("creator_notify_on_submission")
      .default(false)
      .notNull(),
    creatorNotifyEmail: varchar("creator_notify_email", { length: 255 }),
    creatorEmailSubject: text("creator_email_subject"),
    creatorEmailTemplate: text("creator_email_template"),

    respondentConfirmationEnabled: boolean("respondent_confirmation_enabled")
      .default(false)
      .notNull(),
    respondentEmailFieldId: uuid("respondent_email_field_id").references(
      () => formFieldsTable.id,
      { onDelete: "set null" }
    ),
    respondentEmailSubject: text("respondent_email_subject"),
    respondentEmailTemplate: text("respondent_email_template"),

    weeklyDigestEnabled: boolean("weekly_digest_enabled").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    formIdx: index("idx_email_settings_form").on(table.formId),
  })
);

export const emailNotificationSettingsRelations = relations(
  emailNotificationSettingsTable,
  ({ one }) => ({
    form: one(formsTable, {
      fields: [emailNotificationSettingsTable.formId],
      references: [formsTable.id],
    }),
    respondentEmailField: one(formFieldsTable, {
      fields: [emailNotificationSettingsTable.respondentEmailFieldId],
      references: [formFieldsTable.id],
    }),
  })
);

export type SelectEmailNotificationSetting =
  typeof emailNotificationSettingsTable.$inferSelect;
export type InsertEmailNotificationSetting =
  typeof emailNotificationSettingsTable.$inferInsert;