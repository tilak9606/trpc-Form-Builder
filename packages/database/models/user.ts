import { pgTable, timestamp, text, varchar, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),

  image: text("image"),

  role: varchar("role", { length: 10 }).default("USER").notNull(),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => sql`now()`),
});