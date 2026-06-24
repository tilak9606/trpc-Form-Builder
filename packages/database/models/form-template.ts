import { pgTable, uuid, timestamp, varchar, text, json } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const formTemplatesTable = pgTable("form_templates", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 100 }).notNull(),
    description: varchar("description", { length: 300 }),
    fields: json("fields").$type<{
        label: string;
        type: string;
        description?: string;
        placeholder?: string;
        isRequired?: boolean;
        options?: string[];
        validation?: { min?: number; max?: number; pattern?: string };
    }[]>().notNull().default([]),
    createdBy: text("created_by").references(() => usersTable.id),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
