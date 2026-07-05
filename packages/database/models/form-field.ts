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
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { formsTable } from "./form";
import type { FieldType } from "../constants/field-types";

export const fieldTypeEnum = pgEnum("field_type_enum", [
    "TEXT",
    "EMAIL",
    "NUMBER",
    "YES_NO",
    "PASSWORD",
    "SELECT",
    "MULTI_SELECT",
    "DATE",
    "TIME",
    "RATING",
    "TAGS",
    "TOGGLE",
    "RADIO",
    "CHECKBOX",
    "TEXTAREA",
    "FILE_UPLOAD",
]);

export const formFieldsTable = pgTable(
    "form_fields",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        formId: uuid("form_id").notNull().references(() => formsTable.id, { onDelete: "cascade" }),

        label: varchar("label", { length: 100 }).notNull(),
        labelKey: varchar("label_key", { length: 100 }).notNull(),

        description: text("description"),

        placeholder: text("placeholder"),
        isRequired: boolean("is_required").default(false).notNull(),

        index: numeric("index").$type<string>().notNull(),
        type: fieldTypeEnum("type").$type<FieldType>().notNull(),

        options: json("options").$type<string[]>().default([]),
        maxFileSize: numeric("max_file_size"),
        allowedFileTypes: json("allowed_file_types").$type<string[]>(),
        validation: json("validation").$type<{
            min?: number;
            max?: number;
            pattern?: string;
            icon?: string;
        } | null>(),
        page: numeric("page").$type<string>().default("1").notNull(),

        condition: json("condition").$type<{
            fieldId: string;
            operator: "equals" | "not_equals" | "contains";
            value: string;
            targetPage?: number;
        } | null>().default(null),

        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    },
    (table) => ({
        formIdx: index("idx_fields_form").on(table.formId),
    })
);

export const formFieldsRelations = relations(formFieldsTable, ({ one }) => ({
    form: one(formsTable, {
        fields: [formFieldsTable.formId],
        references: [formsTable.id],
    }),
}));
