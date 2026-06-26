import { pgTable, timestamp, text, varchar, boolean } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),

  image: text("image"),

  role: varchar("role", { length: 10 }).default("USER").notNull(),

  plan: varchar("plan", { length: 20 }).default("free").notNull(),

  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 100 }),
  razorpayCustomerId: varchar("razorpay_customer_id", { length: 100 }),
  subscriptionStatus: varchar("subscription_status", { length: 20 }).default("inactive"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => sql`now()`),
});