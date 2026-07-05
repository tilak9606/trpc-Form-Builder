import { pgTable, uuid, timestamp, varchar, text, boolean, jsonb, pgEnum, index } from "drizzle-orm/pg-core";
import { sql, relations } from "drizzle-orm";
import { usersTable } from "./user";
import { foldersTable } from "./folder";
import { formFieldsTable } from "./form-field";

export const formStatusEnum = pgEnum("form_status", ["draft", "published", "archived"]);
export const formVisibilityEnum = pgEnum("form_visibility", ["public", "unlisted", "private"]);

export type FormStatus = "draft" | "published" | "archived";
export type FormVisibility = "public" | "unlisted" | "private";

export const formsTable = pgTable(
    "forms",
    {
        id: uuid("id").primaryKey().defaultRandom(),

        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        slug: varchar("slug", { length: 64 }).unique().notNull(),
        status: formStatusEnum("status").default("draft").notNull(),
        visibility: formVisibilityEnum("visibility").default("public").notNull(),

        createdBy: text("created_by")
            .notNull()
            .references(() => usersTable.id, { onDelete: "cascade" }),

        folderId: uuid("folder_id").references(() => foldersTable.id, { onDelete: "set null" }),

        themeId: varchar("theme_id", { length: 255 }),

        coverImageUrl: text("cover_image_url"),

        metaTitle: varchar("meta_title", { length: 60 }),
        metaDescription: text("meta_description"),

        settings: jsonb("settings").notNull().default({}),

        passwordHash: text("password_hash"),

        publishedAt: timestamp("published_at"),
        archivedAt: timestamp("archived_at"),
        deletedAt: timestamp("deleted_at"),

        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => sql`now()`),
    },
    (table) => ({
        creatorIdx: index("idx_forms_creator").on(table.createdBy),
        slugIdx: index("idx_forms_slug").on(table.slug),
        themeIdx: index("idx_forms_theme").on(table.themeId),
    })
);

export const formsRelations = relations(formsTable, ({ many }) => ({
    fields: many(formFieldsTable),
}));

export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;