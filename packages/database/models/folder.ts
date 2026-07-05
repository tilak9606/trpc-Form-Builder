import { pgTable, uuid, timestamp, varchar, text, index } from "drizzle-orm/pg-core";
import { usersTable } from "./user";

export const foldersTable = pgTable(
    "folders",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 100 }).notNull(),
        userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
    },
    (table) => ({
        userIdx: index("idx_folders_user").on(table.userId),
    })
);
