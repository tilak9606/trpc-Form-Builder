import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const formAnalyticsEventsTable = pgTable("form_analytics_events", {
    id: uuid("id").primaryKey().defaultRandom(),

    formId: uuid("form_id").references(() => formsTable.id, { onDelete: "cascade" }).notNull(),

    eventType: varchar("event_type", { length: 20 }).notNull(), // 'view', 'start', 'submit'

    sessionId: varchar("session_id", { length: 100 }),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }),
    respondentIp: varchar("respondent_ip", { length: 45 }),

    createdAt: timestamp("created_at").defaultNow(),
});
