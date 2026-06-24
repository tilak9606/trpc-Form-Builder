import {
    pgTable,
    uuid,
    timestamp,
    varchar,
    pgEnum,
    text,
    boolean,
    numeric,
    json,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const fieldTypeEnum = pgEnum("field_type_enum", [
    "TEXT",
    "EMAIL",
    "NUMBER",
    "YES_NO",
    "PASSWORD",
    "SELECT",
    "MULTI_SELECT",
    "DATE",
    "TEXTAREA",
    "FILE_UPLOAD",
]);

export const formFieldsTable = pgTable("form_fields", {
    id: uuid("id").primaryKey().defaultRandom(),
    formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }),

    label: varchar("label", { length: 100 }).notNull(),
    labelKey: varchar("label_key", { length: 100 }).notNull(),

    description: text("description"),

    placeholder: text("placeholder"),
    isRequired: boolean("is_required").default(false).notNull(),

    index: numeric("index").notNull(),
    type: fieldTypeEnum("type").notNull(),

    options: json("options").$type<string[]>().default([]),
    maxFileSize: numeric("max_file_size"),
    allowedFileTypes: json("allowed_file_types").$type<string[]>(),
    validation: json("validation").$type<{
        min?: number;
        max?: number;
        pattern?: string;
    } | null>(),
    page: numeric("page").default("1").notNull(),

    condition: json("condition").$type<{
        fieldId: string;
        operator: "equals" | "not_equals" | "contains";
        value: string;
        targetPage?: number;
    } | null>().default(null),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
