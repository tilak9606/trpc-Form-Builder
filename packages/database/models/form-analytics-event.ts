import { pgTable, uuid, timestamp, varchar, index } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formAnalyticsEventsTable = pgTable(
    "form_analytics_events",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }).notNull(),

        eventType: varchar("event_type", { length: 20 }).notNull(),

        sessionId: varchar("session_id", { length: 100 }),
        deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
        respondentIp: varchar("respondent_ip", { length: 45 }),

        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        formEventIdx: index("idx_events_form_type").on(table.formId, table.eventType),
        createdAtIdx: index("idx_events_created_at").on(table.createdAt),
    })
);
