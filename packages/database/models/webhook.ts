import { pgTable, uuid, timestamp, varchar, text, json, boolean, index } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const webhooksTable = pgTable(
    "webhooks",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }).notNull(),
        name: varchar("name", { length: 100 }).notNull(),
        url: text("url").notNull(),
        events: json("events").$type<string[]>().notNull().default(["submission.created"]),
        enabled: boolean("enabled").notNull().default(true),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    },
    (table) => ({
        formIdx: index("idx_webhooks_form").on(table.formId),
    })
);
