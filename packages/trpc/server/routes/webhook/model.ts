import { z } from "zod";

export const createWebhookInputModel = z.object({
    formId: z.string().describe("UUID of the form"),
    name: z.string().max(100).describe("Name for the webhook"),
    url: z.string().url().describe("Webhook callback URL"),
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
    url: z.string().url().optional().describe("New URL"),
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
