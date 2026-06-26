import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { env } from "./env";

export const db = drizzle(env.DATABASE_URL);
export * from "drizzle-orm";
export * from "./schema";
export * from "./constants/user-plan";
export * from "./constants/field-types";
export default db;