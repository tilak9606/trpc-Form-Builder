import { pgTable, timestamp, text, varchar, boolean, pgEnum } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const userRoleEnum = pgEnum("user_role", ["USER", "ADMIN"]);
export const userPlanEnum = pgEnum("user_plan", ["free", "pro", "enterprise"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "cancelled",
  "expired",
  "inactive",
  "pending",
]);

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),

  image: text("image"),

  role: userRoleEnum("role").default("USER").notNull(),

  plan: userPlanEnum("plan").default("free").notNull(),

  razorpaySubscriptionId: varchar("razorpay_subscription_id", { length: 100 }),
  razorpayCustomerId: varchar("razorpay_customer_id", { length: 100 }),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("inactive"),

  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().$onUpdate(() => sql`now()`),
});