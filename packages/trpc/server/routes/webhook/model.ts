import { z } from "zod";

function isAllowedWebhookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return false;
    }

    if (hostname.endsWith(".local") || hostname.endsWith(".internal")) {
      return false;
    }

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }

    const privateIpRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
      /^127\./,
      /^::1$/,
      /^fc00:/i,
      /^fe80:/i,
    ];

    if (privateIpRanges.some((regex) => regex.test(hostname))) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

const webhookUrlSchema = z.string().url().refine(isAllowedWebhookUrl, {
  message: "Webhook URL is not allowed (private IPs, localhost, or invalid protocol)",
});

export const createWebhookInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    name: z.string().max(100).describe("Name for the webhook"),
    url: webhookUrlSchema.describe("Webhook callback URL"),
    events: z.array(z.enum(["submission.created"])).default(["submission.created"]),
    enabled: z.boolean().default(true),
});

export const createWebhookOutputModel = z.object({
    id: z.string(),
});

export const listWebhooksInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
});

export const webhookOutputModel = z.object({
    id: z.string(),
    formId: z.string(),
    name: z.string(),
    url: z.string(),
    events: z.array(z.string()),
    enabled: z.boolean(),
    createdAt: z.string().nullable(),
    updatedAt: z.string().nullable(),
});

export const listWebhooksOutputModel = z.array(webhookOutputModel);

export const updateWebhookInputModel = z.object({
    id: z.string().describe("UUID of the webhook"),
    formId: z.string().describe("UUID of the form"),
    name: z.string().max(100).optional().describe("New name"),
    url: webhookUrlSchema.optional().describe("New URL"),
    events: z.array(z.enum(["submission.created"])).optional(),
    enabled: z.boolean().optional(),
});

export const updateWebhookOutputModel = z.object({
    id: z.string(),
});

export const deleteWebhookInputModel = z.object({
    id: z.string().describe("UUID of the webhook"),
    formId: z.string().describe("UUID of the form"),
});

export const deleteWebhookOutputModel = z.object({
    id: z.string(),
});
