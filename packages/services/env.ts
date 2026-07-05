import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  WEB_URL: z.string().default("http://localhost:3000"),

  // Encryption for sensitive data (OAuth tokens, etc.)
  TOKEN_ENCRYPTION_KEY: z.string().min(32).optional(),

  // Form password tokens
  FORM_TOKEN_SECRET: z.string().min(32).optional(),

  // Email (Resend/SendGrid/SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  FROM_EMAIL: z.string().default("noreply@formforge.app"),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);