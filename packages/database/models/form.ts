import { pgTable, uuid, timestamp, varchar, text, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { foldersTable } from "./folder";

export const formStatusEnum = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    CLOSED: "CLOSED",
} as const;

export type FormStatus = (typeof formStatusEnum)[keyof typeof formStatusEnum];

export const formsTable = pgTable("forms", {
    id: uuid("id").primaryKey().defaultRandom(),

    title: varchar("title", { length: 100 }).notNull(),
    description: varchar("description", { length: 300 }),
    slug: varchar("slug", { length: 100 }).unique().notNull(),
    status: varchar("status", { length: 10 }).$type<FormStatus>().default("DRAFT").notNull(),

    createdBy: text("created_by").references(() => usersTable.id),

    folderId: uuid("folder_id").references(() => foldersTable.id, { onDelete: "set null" }),

    notifyEmail: boolean("notify_email").notNull().default(false),
    notifyEmailTo: varchar("notify_email_to", { length: 255 }),

    themePrimaryColor: varchar("theme_primary_color", { length: 7 }).default("#3b82f6"),
    themeBackgroundColor: varchar("theme_background_color", { length: 7 }).default("#000000"),
    themeTextColor: varchar("theme_text_color", { length: 7 }).default("#ffffff"),
    themeLabelColor: varchar("theme_label_color", { length: 7 }).default("#ffffff"),
    themeFontFamily: varchar("theme_font_family", { length: 50 }).default("Inter"),
    themeBorderRadius: varchar("theme_border_radius", { length: 10 }).default("0.5rem"),
    themeButtonText: varchar("theme_button_text", { length: 50 }).default("Submit"),
    themeButtonTextColor: varchar("theme_button_text_color", { length: 7 }).default("#ffffff"),
    themeLogoUrl: text("theme_logo_url"),

    thankYouUrl: text("thank_you_url"),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});
