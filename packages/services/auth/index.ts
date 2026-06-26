import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, usersTable, sessionTable, accountTable, verificationTable } from "@repo/database";

const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:8000",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: usersTable,
      session: sessionTable,
      account: accountTable,
      verification: verificationTable,
    },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  socialProviders: socialProviders as any,
  trustedOrigins: [process.env.WEB_URL || "http://localhost:3000"],
  accountLinking: {
    enabled: true,
    trustedProviders: ["google", "github"],
  },
});
