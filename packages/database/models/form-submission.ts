import { pgTable, uuid, timestamp, json, varchar, index } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export interface FormSubmissionValue {
    fieldId: string;
    value: string;
}

export type FormSubmissionValueRow = FormSubmissionValue[];

export const formSubmissionsTable = pgTable(
    "form_submissions",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        formId: uuid("form_id").notNull().references(() => formsTable.id, { onDelete: "cascade" }),

        respondentEmail: varchar("respondent_email", { length: 255 }),
        respondentIp: varchar("respondent_ip", { length: 45 }),

        values: json("values").$type<FormSubmissionValueRow>(),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        formIdx: index("idx_submissions_form").on(table.formId),
        createdAtIdx: index("idx_submissions_created_at").on(table.createdAt),
        formCreatedAtIdx: index("idx_submissions_form_created").on(table.formId, table.createdAt),
    })
);
