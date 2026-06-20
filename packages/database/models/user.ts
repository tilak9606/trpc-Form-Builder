import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),

  fullName: varchar('full_name', {length: 100}).notNull(),
  email: varchar('email', {length: 322}).notNull().unique(),
  passwordHash: text('password'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').$onUpdate(() => new Date()),
})