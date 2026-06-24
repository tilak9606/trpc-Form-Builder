import { pgTable, uuid, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export interface FormSubmissionValue {
    fieldId: string;
    value: string;
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionsTable = pgTable("form_submissions", {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }),

    respondentEmail: varchar("respondent_email", { length: 255 }),
    respondentIp: varchar("respondent_ip", { length: 45 }),

    values: json("values").$type<FormSubmissionValueRow>(),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
